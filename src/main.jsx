import { createRoot } from "react-dom/client";
import "./index.css";
import "./product/product.css";
import "./product/dnd.css";
import "./public-ui.css";
import ErrorBoundary from "./product/ErrorBoundary";
import { RouterProvider } from "react-router";
import { router } from "./routes/router";
import { AuthProvider } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  </ErrorBoundary>,
);
