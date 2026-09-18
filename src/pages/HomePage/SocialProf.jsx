import { Link } from "react-router";
export default function SocialProof() {
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
        <Link className="pcv-public-primary" to="/get-started/register">
          Build your Resume / CV
        </Link>
        <Link className="pcv-public-secondary" to="/contact">
          Get in touch
        </Link>
      </div>
    </section>
  );
}
