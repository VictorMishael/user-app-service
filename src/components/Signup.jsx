import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { ACTION_BUTTON_BASE } from "../styles/buttonStyles";

const FIELD_STYLES =
  "mt-2 rounded-md border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

const SUBMIT_STYLES = `${ACTION_BUTTON_BASE} w-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60`;

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const result = await signUpNewUser(email, password); // Call context function

      if (!result.success) {
        setError(result.error); // Show error message on failure
      } else if (result.data.session) {
        navigate("/dashboard"); // Navigate to dashboard on success
      } else {
        // "Confirm email" is enabled: sign-up succeeded but there is no
        // session yet, so redirecting would bounce back through PrivateRoute.
        setMessage("Check your email to confirm your account.");
      }
    } catch {
      setError("An unexpected error occurred."); // Catch unexpected errors
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="px-4">
      <form onSubmit={handleSignUp} className="m-auto max-w-md py-16">
        <h2 className="pb-2 text-2xl font-bold">Sign up today!</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Sign in
          </Link>
        </p>
        <div className="flex flex-col py-4">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD_STYLES}
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="Email"
          />
        </div>
        <div className="flex flex-col py-4">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            className={FIELD_STYLES}
            type="password"
            name="password"
            id="password"
            autoComplete="new-password"
            placeholder="Password"
          />
        </div>
        <button type="submit" disabled={loading} className={SUBMIT_STYLES}>
          Sign Up
        </button>
        {error && <p className="pt-4 text-center text-red-600">{error}</p>}
        {message && (
          <p className="pt-4 text-center text-green-700 dark:text-green-400">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default Signup;
