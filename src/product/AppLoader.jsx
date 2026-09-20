import "./app-loader.css";

export default function AppLoader({ title = "Opening PersonaCV", detail = "Restoring your secure session." }) {
  return (
    <main className="pcv-app-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="pcv-app-loader-mark" aria-hidden="true">P</div>
      <p className="pcv-eyebrow">PERSONACV</p>
      <h1>{title}</h1>
      <p>{detail}</p>
      <div className="pcv-loader" aria-hidden="true" />
    </main>
  );
}
