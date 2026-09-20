import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router";
import AppLoader from "../product/AppLoader";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { user, status, error } = useContext(AuthContext);

  if (status === "initializing") return <AppLoader />;

  if (status === "error") {
    return (
      <main className="pcv-state" role="alert">
        <h1>Sign-in is unavailable</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/get-started"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return children;
};

export default PrivateRoute;
