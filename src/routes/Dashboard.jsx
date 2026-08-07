import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { session, signOut } = UserAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignOut = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await signOut();

      if (result.success) {
        navigate("/");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred."); // Catch unexpected errors
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Welcome, {session?.user?.email}</h2>
      <div>
        <p
          onClick={handleSignOut}
          className="hover:cursor-pointer  border inline-block px-4 py-3 mt-4 "
        >
          Sign out
        </p>
      </div>
      {error && <p className="text-red-600 pt-4">{error}</p>}
    </div>
  );
};

export default Dashboard;
