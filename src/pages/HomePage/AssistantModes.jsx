import { Link } from "react-router";
export default function AssistantModes() {
  return (
    <section className="pcv-home-section pcv-canvas">
      <header>
        <p className="pcv-public-eyebrow">
          ONE WORKSPACE, TWO WAYS TO TELL YOUR STORY
        </p>
        <h2>
          A focused Resume.
          <br />A fuller CV.
        </h2>
        <p>
          Use the same profile and project library. Choose the depth that fits
          the opportunity.
        </p>
      </header>
      <div className="pcv-public-card-grid pcv-two-cards">
        <article className="pcv-feature-card">
          <span className="pcv-badge">Resume</span>
          <h3>Make the relevant work count.</h3>
          <p>
            Choose your strongest evidence, tailor the summary and keep the
            document concise. Pro adds job-description comparisons.
          </p>
        </article>
        <article className="pcv-feature-card">
          <span className="pcv-badge">CV</span>
          <h3>Give your career room to grow.</h3>
          <p>
            Include broader experience, education, certifications, languages and
            custom sections. Let the content flow across pages naturally.
          </p>
        </article>
      </div>
      <Link className="pcv-public-secondary" to="/dashboard/resumes">
        Open your document workspace ↗
      </Link>
    </section>
  );
}
