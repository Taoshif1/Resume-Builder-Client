import { createBrowserRouter, Navigate, Link } from "react-router";
import { MainLayout } from "../layouts/MainLayout";
import Home from "../pages/Home";
import Features from "../pages/Features";
import Pricing from "../pages/Pricing";
import GetStarted from "../pages/GetStarted";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PrivateRoute from "./PrivateRouter";
import WorkspaceProvider from "../product/WorkspaceProvider";
import ProductLayout from "../product/ProductLayout";
import OverviewPage from "../product/OverviewPage";
import ProfilePage from "../product/ProfilePage";
import ProjectsPage from "../product/ProjectsPage";
import VariantsPage from "../product/VariantsPage";
import SettingsPage from "../product/SettingsPage";
import EditorPage from "../product/EditorPage";
import AdminPage from "../product/AdminPage";
import PublicInfo from "../product/PublicInfo";
const protectedLayout = (
  <PrivateRoute>
    <WorkspaceProvider>
      <ProductLayout />
    </WorkspaceProvider>
  </PrivateRoute>
);
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "features", element: <Features /> },
      { path: "pricing", element: <Pricing /> },
      { path: "privacy-policy", element: <PublicInfo type="privacy" /> },
      { path: "terms-of-service", element: <PublicInfo type="terms" /> },
      { path: "contact", element: <PublicInfo type="contact" /> },
    ],
  },
  {
    element: protectedLayout,
    children: [
      { path: "/dashboard", element: <OverviewPage /> },
      { path: "/dashboard/profile", element: <ProfilePage /> },
      { path: "/dashboard/projects", element: <ProjectsPage /> },
      { path: "/dashboard/resumes", element: <VariantsPage /> },
      {
        path: "/dashboard/create",
        element: <Navigate to="/dashboard/resumes" replace />,
      },
      { path: "/dashboard/settings", element: <SettingsPage /> },
      { path: "/resume/new", element: <EditorPage /> },
      { path: "/resume/:id", element: <EditorPage /> },
      { path: "/admin", element: <AdminPage /> },
    ],
  },
  {
    path: "/get-started",
    element: <GetStarted />,
    children: [
      { index: true, element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "*",
    element: (
      <main className="pcv-state">
        <h1>Page not found</h1>
        <Link to="/dashboard">Go to your workspace</Link>
      </main>
    ),
  },
]);
