import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { session } = UserAuth();

  // undefined = the session is still being restored, null = signed out.
  // Treating them alike would bounce authenticated users on a page refresh.
  if (session === undefined) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return session ? children : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
