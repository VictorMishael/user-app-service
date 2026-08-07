import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

/**
 * Sign-out action shared by the header and the dashboard: ends the Supabase
 * session and returns to the landing page, exposing any failure to the caller.
 *
 * @returns {{ handleSignOut: () => Promise<void>, error: string | null }}
 */
export const useSignOut = () => {
  const { signOut } = UserAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSignOut = useCallback(async () => {
    setError(null);

    try {
      const result = await signOut();

      if (result.success) {
        navigate("/");
      } else {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  }, [navigate, signOut]);

  return { handleSignOut, error };
};
