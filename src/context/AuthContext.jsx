import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

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
  }, []);

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

  // A fresh object literal here would re-render every consumer on each render
  // of the provider, even when the session has not changed.
  const value = useMemo(
    () => ({ signUpNewUser, signInUser, session, signOut }),
    [signUpNewUser, signInUser, session, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
