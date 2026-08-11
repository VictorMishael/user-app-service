import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

    if (!firstName.trim() || !lastName.trim()) {
      setError("Nombres y Apellidos son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const result = await signUpNewUser(email, password, firstName, lastName); // Call context function

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
    <form
      onSubmit={handleSignUp}
      className="o-container o-container--form py-16"
    >
      <h2 className="pb-2 text-2xl font-bold">Sign up today!</h2>
      <p className="u-text-muted">
        Already have an account?{" "}
        <Link to="/signin" className="s-link">
          Sign in
        </Link>
      </p>
      <div className="o-stack py-4">
        <label htmlFor="firstName" className="sr-only">
          Nombres
        </label>
        <input
          onChange={(e) => setFirstName(e.target.value)}
          className="o-field s-field"
          type="text"
          name="firstName"
          id="firstName"
          autoComplete="given-name"
          placeholder="Nombres"
          required
        />
      </div>
      <div className="o-stack py-4">
        <label htmlFor="lastName" className="sr-only">
          Apellidos
        </label>
        <input
          onChange={(e) => setLastName(e.target.value)}
          className="o-field s-field"
          type="text"
          name="lastName"
          id="lastName"
          autoComplete="family-name"
          placeholder="Apellidos"
          required
        />
      </div>
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
          autoComplete="new-password"
          placeholder="Password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="o-button o-button--md o-button--block s-action"
      >
        Sign Up
      </button>
      {error && <p className="u-text-error pt-4 text-center">{error}</p>}
      {message && (
        <p className="u-text-success pt-4 text-center">{message}</p>
      )}
    </form>
  );
};

export default Signup;
