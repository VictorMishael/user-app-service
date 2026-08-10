import { Outlet } from "react-router-dom";
import Header from "../components/Header";

// Pathless layout route: every page renders below the shared header.
const RootLayout = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
};

export default RootLayout;
