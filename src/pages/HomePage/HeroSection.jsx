import { Link } from "react-router";
export default function HeroSection() {
  return (
    <section className="pcv-home-hero">
      <div className="pcv-hero-copy">
        <p className="pcv-public-eyebrow">PERSONACV / YOUR CAREER, REUSABLE</p>
        <h1>
          One profile.
          <br />
          Your next <span>possibility.</span>
        </h1>
        <p className="pcv-hero-intro">
          Build targeted developer resumes and CVs from reusable career data.
        </p>
        <p>
          Maintain your profile once. Reuse projects and experience, tailor each
          document, and export a clean, ATS-friendly PDF.
        </p>
        <div className="pcv-public-ctas">
          <Link className="pcv-public-primary" to="/get-started/register">
            Build your Resume / CV <span aria-hidden="true">↗</span>
          </Link>
          <Link className="pcv-public-secondary" to="/features">
            Explore Features
          </Link>
        </div>
        <p className="pcv-hero-note">
          Start free · Your content stays yours · No card required
        </p>
      </div>
      <div
        className="pcv-hero-document"
        aria-label="Illustrative document layout"
      >
        <div className="pcv-example-toolbar">
          <span>YOUR CAREER CANVAS</span>
          <span>Resume / CV</span>
        </div>
        <div className="pcv-example-paper">
          <p className="pcv-example-name">YOUR NAME</p>
          <p>Full Stack Developer</p>
          <p className="pcv-example-contact">Your city · Email · Portfolio</p>
          <h2>CAREER OBJECTIVE</h2>
          <p>
            A focused introduction to the work you do and the value you bring.
          </p>
          <h2>SKILLS</h2>
          <p>Frontend · Backend · Your toolkit</p>
          <h2>SELECTED PROJECTS</h2>
          <div className="pcv-example-row">
            <strong>Your strongest work</strong>
            <span>GitHub | Live</span>
          </div>
          <p>
            • Explain the problem you solved.
            <br />• Show the results you can stand behind.
          </p>
          <h2>EDUCATION</h2>
          <div className="pcv-example-row">
            <strong>Your qualification</strong>
            <span>Year – Year</span>
          </div>
          <p>Your institution</p>
        </div>
        <p className="pcv-example-caption">
          Illustrative layout. Built from your own experience.
        </p>
      </div>
    </section>
  );
}
