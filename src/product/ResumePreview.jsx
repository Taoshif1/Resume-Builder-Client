import { resolvedDocumentStyle } from "./document-styles.js";

function DocumentLinks({ links = [] }) {
  return (
    links.length > 0 && (
      <span className="pcv-document-links">
        {links.map((link) => (
          <a key={link.url} href={link.url}>
            {link.label}
          </a>
        ))}
      </span>
    )
  );
}

const PAGE_DIMENSIONS = {
  A4: { width: "794px", height: "1123px" },
  LETTER: { width: "816px", height: "1056px" },
  LEGAL: { width: "816px", height: "1344px" },
};

export default function ResumePreview({ model, zoom = 100 }) {
  const style = resolvedDocumentStyle(model);
  const page = PAGE_DIMENSIONS[model.paperSize] || PAGE_DIMENSIONS.A4;
  return (
    <article
      className={`pcv-paper pcv-template-${model.template} pcv-font-${style.fontFamily} pcv-section-style-${style.sectionStyle}`}
      style={{
        fontSize: `${model.fontSize}pt`,
        maxWidth: page.width,
        minHeight: page.height,
        padding: `${style.pageMargin}pt`,
        fontFamily: style.font.css,
        transform: `scale(${zoom / 100})`,
        transformOrigin: "top center",
        "--document-accent": style.accent,
        "--document-section-gap": `${style.sectionGap}pt`,
        "--document-entry-gap": `${style.entryGap}pt`,
        "--document-name-size": `${style.nameSize}pt`,
        "--document-rule": `${style.rule}pt`,
        "--document-line-height": style.lineSpacing,
      }}
      aria-label={`Live ${model.documentType === "cv" ? "CV" : "resume"} preview`}
    >
      <header className="pcv-document-header" style={{ textAlign: style.align }}>
        <h1>{model.name || "Your name"}</h1>
        {model.title && <p className="pcv-paper-title">{model.title}</p>}
        {model.contact && (
          <p className="pcv-document-contact">{model.contact}</p>
        )}
        <DocumentLinks links={model.links} />
      </header>
      {model.sections.map((section) => (
        <section
          key={section.key}
          className={`pcv-document-section pcv-document-${section.key}`}
        >
          <h2>{style.uppercase ? section.title.toUpperCase() : section.title}</h2>
          {section.items.map((item, index) => (
            <div className="pcv-paper-entry" key={index}>
              {(item.heading || item.dates || item.links?.length > 0) && (
                <div className="pcv-document-row">
                  <h3>{item.heading}</h3>
                  <div className="pcv-document-aside">
                    <DocumentLinks links={item.links} />
                    {item.dates && (
                      <span className="pcv-paper-dates">{item.dates}</span>
                    )}
                  </div>
                </div>
              )}
              {item.subheading && (
                <p className="pcv-document-subheading">{item.subheading}</p>
              )}
              {section.key === "projects" && item.bullets?.length > 0 && (
                <p className="pcv-document-label">Features:</p>
              )}
              {item.text && <p className="pcv-paper-text">{item.text}</p>}
              {item.bullets?.length > 0 && (
                <ul>
                  {item.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
              {item.tech && (
                <p className="pcv-document-tech">
                  <strong>Tech: </strong>
                  {item.tech}
                </p>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
