import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";

import { router } from "./router.jsx";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { ThemeContextProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeContextProvider>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </ThemeContextProvider>
  </StrictMode>
);
