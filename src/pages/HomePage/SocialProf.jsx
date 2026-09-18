import { useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../context/AuthContext";
export default function SocialProof() {
  const { user } = useContext(AuthContext);
  return (
    <section className="pcv-home-section pcv-final-cta">
      <p className="pcv-public-eyebrow">READY WHEN YOU ARE</p>
      <h2>
        Your next document
        <br />
        starts with your experience.
      </h2>
      <p>Build your profile once. Make each opportunity your own.</p>
      <div className="pcv-public-ctas">
        <Link className="pcv-public-primary" to={user ? "/dashboard" : "/get-started/register"}>
          {user ? "Open your workspace" : "Build your Resume / CV"}
        </Link>
        <Link className="pcv-public-secondary" to="/contact">
          Get in touch
        </Link>
      </div>
    </section>
  );
}
