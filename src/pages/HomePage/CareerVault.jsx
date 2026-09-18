const features = [
  [
    "01",
    "Keep your career in one place",
    "Save your profile, education and career history to your account. Keep an independent JSON backup whenever you need one.",
  ],
  [
    "02",
    "Tailor without starting over",
    "Select relevant experience and projects for each Resume or CV. Document-specific edits leave your master content intact.",
  ],
  [
    "03",
    "Bring your projects with you",
    "Import public GitHub repository facts. Refresh source data without replacing your authored achievements.",
  ],
];
export default function CareerVault() {
  return (
    <section className="pcv-home-section pcv-vault">
      <header>
        <p className="pcv-public-eyebrow">THE CAREER VAULT</p>
        <h2>
          Less retyping.
          <br />
          More of your best work.
        </h2>
        <p>
          Your experience grows over time. Your documents should grow with it.
        </p>
      </header>
      <div className="pcv-public-card-grid">
        {features.map(([number, title, description]) => (
          <article className="pcv-feature-card" key={number}>
            <span className="pcv-feature-number">{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
