import { useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../context/AuthContext";
export default function NotFoundPage() {
  const { user } = useContext(AuthContext);
  return <main className="pcv-state"><p className="pcv-eyebrow">404</p><h1>Page not found</h1><p>This link may have moved. Choose where to go next.</p><Link className="pcv-button" to="/">Home</Link><Link className="pcv-button" to={user ? "/dashboard" : "/get-started"}>{user ? "Dashboard" : "Sign in"}</Link></main>;
}
