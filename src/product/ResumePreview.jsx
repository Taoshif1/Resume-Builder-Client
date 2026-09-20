import { createElement } from "react";
import { resolvedDocumentStyle } from "./document-styles.js";
import { normalizeDirectText } from "./direct-edit.js";

function EditableText({ as = "span", value, onEdit, change, multiline = false, className }) {
  if (!onEdit) return createElement(as, { className }, value);
  return createElement(
    as,
    {
      className: `${className || ""} pcv-direct-edit`.trim(),
      contentEditable: true,
      suppressContentEditableWarning: true,
      role: "textbox",
      "aria-label": `Edit ${change.field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
      "aria-multiline": multiline || undefined,
      tabIndex: 0,
      onKeyDown: (event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      },
      onPaste: (event) => {
        event.preventDefault();
        document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
      },
      onBlur: (event) => {
        const next = normalizeDirectText(event.currentTarget.innerText, multiline);
        if (next !== normalizeDirectText(value, multiline)) onEdit({ ...change, value: next, multiline });
      },
    },
    value,
  );
}

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

function EditableParts({ parts = [], onEdit, separator = " | " }) {
  return parts.map((part, index) => (
    <span key={part.source?.id || part.field || index}>
      {index > 0 && <span aria-hidden="true">{separator}</span>}
      <EditableText
        value={part.value || part.placeholder || ""}
        onEdit={onEdit}
        change={part.source || { type: "personal", field: part.field }}
      />
    </span>
  ));
}

const PAGE_DIMENSIONS = {
  A4: { width: "794px", height: "1123px" },
  LETTER: { width: "816px", height: "1056px" },
  LEGAL: { width: "816px", height: "1344px" },
};

export default function ResumePreview({ model, zoom = 100, onEdit }) {
  const style = resolvedDocumentStyle(model);
  const page = PAGE_DIMENSIONS[model.paperSize] || PAGE_DIMENSIONS.A4;
  return (
    <>
    <style>{`@page personacv { size: ${model.paperSize === "LEGAL" ? "legal" : model.paperSize === "LETTER" ? "letter" : "A4"}; margin: ${style.pageMargin}pt; }`}</style>
    <article
      className={`pcv-paper pcv-template-${model.template} pcv-font-${style.fontFamily} pcv-section-style-${style.sectionStyle}`}
      style={{
        fontSize: `${model.fontSize}pt`,
        width: page.width,
        maxWidth: page.width,
        minHeight: page.height,
        padding: `${style.pageMargin}pt`,
        fontFamily: style.font.css,
        zoom: zoom / 100,
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
        <EditableText as="h1" value={model.name || "Your name"} onEdit={onEdit} change={{ type: "personal", field: "fullName" }} />
        {(model.title || onEdit) && <EditableText as="p" className="pcv-paper-title" value={model.title || "Your headline"} onEdit={onEdit} change={{ type: "personal", field: "title" }} />}
        {(model.contact || onEdit) && (
          <p className="pcv-document-contact">
            <EditableParts
              parts={onEdit ? model.contactItems : model.contactItems.filter((item) => item.value)}
              onEdit={onEdit}
            />
          </p>
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
                  <EditableText as="h3" value={item.heading} onEdit={onEdit && item.sourceId ? onEdit : null} change={{ type: "entry", collection: item.sourceCollection, id: item.sourceId, field: item.sourceCollection === "experience" ? "role" : item.sourceCollection === "education" ? "degree" : "title" }} />
                  <div className="pcv-document-aside">
                    <DocumentLinks links={item.links} />
                    {(item.dates || (onEdit && item.dateParts)) && (
                      <span className="pcv-paper-dates">
                        {item.dateParts && item.sourceId ? (
                          <EditableParts
                            parts={item.dateParts.map((part) => ({
                              ...part,
                              value: part.value || (part.field === "startDate" ? "Start" : "End"),
                              source: {
                                type: "entry",
                                collection: item.sourceCollection,
                                id: item.sourceId,
                                field: part.field,
                              },
                            }))}
                            onEdit={onEdit}
                            separator=" – "
                          />
                        ) : item.dates}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {item.subheading && (
                <EditableText as="p" className="pcv-document-subheading" value={item.subheading} onEdit={onEdit && item.sourceId && item.sourceCollection !== "projects" ? onEdit : null} change={{ type: "entry", collection: item.sourceCollection, id: item.sourceId, field: item.sourceCollection === "experience" ? "company" : "institution" }} />
              )}
              {section.key === "projects" && item.bullets?.length > 0 && (
                <p className="pcv-document-label">Features:</p>
              )}
              {item.parts?.length > 0 && (
                <p className="pcv-paper-text">
                  <EditableParts parts={item.parts} onEdit={onEdit} />
                </p>
              )}
              {item.text && !item.parts?.length && <EditableText as="p" className="pcv-paper-text" value={item.text} multiline onEdit={onEdit && (item.source || item.sourceId) ? onEdit : null} change={item.source || { type: "entry", collection: item.sourceCollection, id: item.sourceId, field: "description" }} />}
              {item.bullets?.length > 0 && (
                <ul>
                  {item.bullets.map((bullet, i) => (
                    <li key={i}><EditableText value={bullet} onEdit={onEdit && item.sourceId ? (change) => onEdit({ ...change, value: item.bullets.map((entry, index) => index === i ? change.value : entry).join("\n"), multiline: true }) : null} change={{ type: "entry", collection: item.sourceCollection, id: item.sourceId, field: "description" }} /></li>
                  ))}
                </ul>
              )}
              {item.tech && (
                <p className="pcv-document-tech">
                  <strong>Tech: </strong>
                  <EditableText value={item.tech} onEdit={onEdit && item.sourceCollection === "projects" ? onEdit : null} change={{ type: "entry", collection: "projects", id: item.sourceId, field: "techStack" }} />
                </p>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
    </>
  );
}
