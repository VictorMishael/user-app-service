import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../supabaseClient";
import {
  clearStoredUserPermissions,
  fetchUserPermissions,
  readStoredUserPermissions,
  storeUserPermissions,
} from "../services/userPermissions";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  // Seeded from sessionStorage so a reload can paint the menu immediately; the
  // effect below still refetches, because a cached permission set may be stale.
  const [userPermissions, setUserPermissions] = useState(
    readStoredUserPermissions
  );
  const [permissionsError, setPermissionsError] = useState(null);
  // Id of the user whose permissions are loaded or in flight. Guards against
  // the sign-in call and the session effect fetching the same data twice.
  const loadedUserIdRef = useRef(null);

  /**
   * Loads the roles and permissions of `userId` into context and session
   * storage. Same result contract as the auth actions.
   *
   * @param {string} userId
   */
  const loadUserPermissions = useCallback(async (userId) => {
    if (!userId) return { success: false, error: "Missing user id." };

    loadedUserIdRef.current = userId;
    const result = await fetchUserPermissions(userId);

    if (!result.success) {
      // Allow a later attempt for this user to run.
      loadedUserIdRef.current = null;
      setPermissionsError(result.error);
      return result;
    }

    console.log("Roles y permisos:", result.data);
    setPermissionsError(null);
    setUserPermissions(result.data);
    storeUserPermissions(result.data);
    return result;
  }, []);

  // Sign up
  /**
   * @param {string} email
   * @param {string} password
   * @param {string} [firstName] Stored as `first_name` in the user metadata.
   * @param {string} [lastName]  Stored as `last_name` in the user metadata.
   *
   * The `handle_new_user()` trigger copies both keys from
   * `raw_user_meta_data` into `public.tbl_users`. Its fallback for a missing
   * name only fires on NULL, so an empty field is omitted rather than sent as
   * an empty string.
   */
  const signUpNewUser = useCallback(
    async (email, password, firstName, lastName) => {
      const metadata = {};
      const first = firstName?.trim();
      const last = lastName?.trim();
      if (first) metadata.first_name = first;
      if (last) metadata.last_name = last;

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error("Error signing up: ", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    },
    []
  );

  // Sign in
  const signInUser = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      // Handle Supabase error explicitly
      if (error) {
        console.error("Sign-in error:", error.message); // Log the error for debugging
        return { success: false, error: error.message }; // Return the error
      }

      // Roles and permissions are loaded before the caller navigates, so the
      // menu can render without a second loading state. A failure here surfaces
      // through `permissionsError` but must not fail the sign-in, since the
      // session is already valid at this point.
      await loadUserPermissions(data?.user?.id);

      // If no error, return success
      return { success: true, data }; // Return the user data
    } catch (error) {
      // Handle unexpected issues
      console.error("Unexpected error during sign-in:", error.message);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  }, [loadUserPermissions]);

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Keeps the permission set tied to whoever the session says is signed in:
  // covers a page reload, a sign-in from another tab, and sign-out. Sign-in in
  // this tab has usually loaded them already — the ref guard skips the refetch.
  useEffect(() => {
    if (session === undefined) return; // Still restoring.

    const userId = session?.user?.id;

    if (!userId) {
      loadedUserIdRef.current = null;
      setUserPermissions(null);
      setPermissionsError(null);
      clearStoredUserPermissions();
      return;
    }

    if (loadedUserIdRef.current === userId) return;
    loadUserPermissions(userId);
  }, [session, loadUserPermissions]);

  // A fresh object literal here would re-render every consumer on each render
  // of the provider, even when the session has not changed.
  const value = useMemo(
    () => ({
      signUpNewUser,
      signInUser,
      session,
      signOut,
      userPermissions,
      permissionsError,
    }),
    [
      signUpNewUser,
      signInUser,
      session,
      signOut,
      userPermissions,
      permissionsError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
