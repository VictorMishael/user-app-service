import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

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
    } catch (err) {
      setError("An unexpected error occurred."); // Catch unexpected errors
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div>
      <form onSubmit={handleSignUp} className="max-w-md m-auto pt-24">
        <h2 className="font-bold pb-2">Sign up today!</h2>
        <p>
          Already have an account? <Link to="/">Sign in</Link>
        </p>
        <div className="flex flex-col py-4">
          {/* <label htmlFor="Email">Email</label> */}
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 mt-2"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
          />
        </div>
        <div className="flex flex-col py-4">
          {/* <label htmlFor="Password">Password</label> */}
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 mt-2"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
          />
        </div>
        <button type="submit" disabled={loading} className="w-full mt-4">
          Sign Up
        </button>
        {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        {message && <p className="text-green-700 text-center pt-4">{message}</p>}
      </form>
    </div>
  );
};

export default Signup;
