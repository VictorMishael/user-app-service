import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signInUser(email, password); // Call context function

      if (result.success) {
        navigate("/dashboard"); // Navigate to dashboard on success
      } else {
        setError(result.error); // Show error message on failure
      }
    } catch {
      setError("An unexpected error occurred."); // Catch unexpected errors
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <form
      onSubmit={handleSignIn}
      className="o-container o-container--form py-16"
    >
      <h2 className="pb-2 text-2xl font-bold">Sign in</h2>
      <p className="u-text-muted">
        Don&apos;t have an account yet?{" "}
        <Link to="/signup" className="s-link">
          Sign up
        </Link>
      </p>
      <div className="o-stack py-4">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          className="o-field s-field"
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          placeholder="Email"
        />
      </div>
      <div className="o-stack py-4">
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          className="o-field s-field"
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          placeholder="Password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="o-button o-button--md o-button--block s-action"
      >
        Sign In
      </button>
      {error && <p className="u-text-error pt-4 text-center">{error}</p>}
    </form>
  );
};

export default Signin;
