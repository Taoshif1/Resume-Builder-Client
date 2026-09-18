export default function Sponsors() {
  return (
    <section className="pcv-toolkit" aria-label="Developer toolkit">
      <p className="pcv-public-eyebrow">BUILT AROUND THE WORK YOU DO</p>
      <ul>
        {[
          "React",
          "JavaScript",
          "Python",
          "Node.js",
          "Databases",
          "Accessibility",
        ].map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p>
        Organize your skills, projects and experience. No endorsements implied.
      </p>
    </section>
  );
}
