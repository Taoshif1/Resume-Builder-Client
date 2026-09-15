export default function ResumePreview({ model }) {
  return (
    <article
      className={`pcv-paper pcv-template-${model.template}`}
      style={{
        fontSize: `${model.fontSize}pt`,
        maxWidth: model.paperSize === "LETTER" ? "816px" : "794px",
      }}
      aria-label="Live resume preview"
    >
      <header>
        <h1>{model.name || "Your name"}</h1>
        <p className="pcv-paper-title">{model.title}</p>
        <p>{model.contact}</p>
        {model.links.map((link) => (
          <p key={link.id}>
            <a href={link.url}>
              {link.label}: {link.url}
            </a>
          </p>
        ))}
      </header>
      {model.sections.map((section) => (
        <section key={section.key}>
          <h2>{section.title}</h2>
          {section.items.map((item, index) => (
            <div className="pcv-paper-entry" key={index}>
              {item.heading && <h3>{item.heading}</h3>}
              {item.dates && <p className="pcv-paper-dates">{item.dates}</p>}
              {item.text && <p className="pcv-paper-text">{item.text}</p>}
              {item.url && (
                <p>
                  <a href={item.url}>{item.url}</a>
                </p>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
