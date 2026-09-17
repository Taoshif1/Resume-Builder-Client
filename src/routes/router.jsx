import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import {
  Features,
  Pricing,
  GetStarted,
  Login,
  Register,
  OverviewPage,
  ProfilePage,
  ProjectsPage,
  VariantsPage,
  SettingsPage,
  EditorPage,
  AdminPage,
} from "./lazy-pages";
import NotFoundPage from "../product/NotFoundPage";
import { MainLayout } from "../layouts/MainLayout";
import Home from "../pages/Home";
import PrivateRoute from "./PrivateRouter";
import WorkspaceProvider from "../product/WorkspaceProvider";
import ProductLayout from "../product/ProductLayout";
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
      {
        path: "features",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <Features />
          </Suspense>
        ),
      },
      {
        path: "pricing",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <Pricing />
          </Suspense>
        ),
      },
      { path: "privacy-policy", element: <PublicInfo type="privacy" /> },
      { path: "terms-of-service", element: <PublicInfo type="terms" /> },
      { path: "contact", element: <PublicInfo type="contact" /> },
    ],
  },
  {
    element: protectedLayout,
    children: [
      {
        path: "/dashboard",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <OverviewPage />
          </Suspense>
        ),
      },
      {
        path: "/dashboard/profile",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "/dashboard/projects",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: "/dashboard/resumes",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <VariantsPage />
          </Suspense>
        ),
      },
      {
        path: "/dashboard/create",
        element: <Navigate to="/dashboard/resumes" replace />,
      },
      {
        path: "/dashboard/settings",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: "/resume/new",
        element: <Navigate to="/dashboard/resumes" replace />,
      },
      {
        path: "/resume/:id",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <EditorPage />
          </Suspense>
        ),
      },
      {
        path: "/admin",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <AdminPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/get-started",
    element: (
      <Suspense
        fallback={
          <p className="pcv-state" role="status">
            Loading page…
          </p>
        }
      >
        <GetStarted />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <Login />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense
            fallback={
              <p className="pcv-state" role="status">
                Loading page…
              </p>
            }
          >
            <Register />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
