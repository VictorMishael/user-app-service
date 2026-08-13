import { supabase } from "../supabaseClient";

/**
 * Session-scoped cache of the signed-in user's roles and permissions. Lives in
 * `sessionStorage` (not `localStorage`) so it dies with the tab: permissions
 * are authorisation data and must not outlive the session they belong to.
 */
const STORAGE_KEY = "vic-thor-user-permissions";

/**
 * Supabase returns an embedded relation as an object for a to-one foreign key
 * and as an array for a to-many one. The shape depends on how the constraints
 * are declared, so every nested level is normalised through here.
 *
 * @param {unknown} value
 * @returns {Array<Record<string, unknown>>}
 */
const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
};

/**
 * Identity of a permission row, used to drop the duplicates produced when the
 * same permission is reachable through more than one role.
 */
const permissionKey = ({ modulo, name, endpoint, httpMethod }) =>
  [modulo, name, endpoint, httpMethod].join("|");

/**
 * Flattens the nested join into the shape the UI consumes: the user's name,
 * one entry per role, and a de-duped flat list of permissions for building the
 * menu and checking access.
 *
 * @param {Array<Record<string, unknown>>} rows Raw rows from `tbl_users`.
 * @param {string} userId
 */
export const normalizeUserPermissions = (rows, userId) => {
  const [user] = toArray(rows);

  const roles = toArray(user?.tbl_user_rol)
    .flatMap((userRole) => toArray(userRole.tbl_rol))
    .map((role) => ({
      name: role.name ?? null,
      // `descripsion` is the column name in the database; the typo stops here.
      description: role.descripsion ?? null,
      status: role.status ?? null,
      permissions: toArray(role.tbl_rol_permisos)
        .flatMap((rolePermission) => toArray(rolePermission.tbl_permisos))
        .map((permission) => ({
          modulo: permission.modulo ?? null,
          name: permission.name ?? null,
          description: permission.descripsion ?? null,
          endpoint: permission.endpoint ?? null,
          httpMethod: permission.http_method ?? null,
          status: permission.status ?? null,
        })),
    }));

  const permissions = [];
  const seen = new Set();
  for (const role of roles) {
    for (const permission of role.permissions) {
      const key = permissionKey(permission);
      if (seen.has(key)) continue;
      seen.add(key);
      permissions.push(permission);
    }
  }

  return {
    userId,
    firstName: user?.first_name ?? null,
    lastName: user?.last_name ?? null,
    roles,
    permissions,
  };
};

/**
 * Reads the signed-in user's roles and permissions in a single round trip,
 * walking `tbl_users → tbl_user_rol → tbl_rol → tbl_rol_permisos → tbl_permisos`.
 *
 * Follows the auth action contract: the caller checks `success` and renders
 * `error` directly, never a raw Supabase error object.
 *
 * @param {string} userId `auth.users.id`, which `tbl_users.id` mirrors.
 * @returns {Promise<{ success: true, data: ReturnType<typeof normalizeUserPermissions> } | { success: false, error: string }>}
 */
export const fetchUserPermissions = async (userId) => {
  if (!userId) {
    return { success: false, error: "Missing user id." };
  }

  try {
    // Query the user's name, roles, and permissions in one go. The `eq` filters
    const { data, error } = await supabase
      .from("tbl_users")
      .select(
        `
        first_name,
        last_name,
        tbl_user_rol(
            tbl_rol(
                name,
                descripsion,
                status,
                tbl_rol_permisos(
                    tbl_permisos(
                        modulo,
                        name,
                        descripsion,
                        endpoint,
                        http_method,
                        status
                    )
                )
            )
        )
      `
      )
      .eq("id", userId)
      .eq("tbl_user_rol.tbl_rol.status", "true")
      .eq("tbl_user_rol.tbl_rol.tbl_rol_permisos.tbl_permisos.status", "true");

    if (error) {
      console.error("Error al obtener permisos:", error.message);
      return { success: false, error: error.message };
    }

    // A valid query that matches nothing comes back as `[]`, not as an error.
    // Normalising that would yield null names and no roles under
    // `success: true` — a silent failure that looks like a user with no data.
    if (!data?.length) {
      console.error(
        `No row in tbl_users for id=${userId}. Either tbl_users.id does not ` +
          `mirror auth.users.id, or RLS gives the authenticated role no ` +
          `SELECT policy on tbl_users.`
      );
      return { success: false, error: "User profile not found." };
    }

    return { success: true, data: normalizeUserPermissions(data, userId) };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred while loading permissions.",
    };
  }
};

/**
 * @returns {ReturnType<typeof normalizeUserPermissions> | null}
 */
export const readStoredUserPermissions = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Private-mode storage or a corrupted entry: fall back to a fresh fetch.
    return null;
  }
};

export const storeUserPermissions = (profile) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Storage is a cache, not the source of truth — losing it is not an error.
  }
};

export const clearStoredUserPermissions = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // See storeUserPermissions.
  }
};
