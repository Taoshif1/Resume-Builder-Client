import { useWorkspace } from "./workspaceContext";
import { Field, OrderButtons, EntryEditor } from "./Fields";
import { mutateWorkspace, move, removeRecord } from "./operations";
import {
  newId,
  PERSONAL_FIELDS,
  EXPERIENCE_FIELDS,
  EDUCATION_FIELDS,
} from "../resume/data/workspace";

const collections = {
  experience: EXPERIENCE_FIELDS,
  education: EDUCATION_FIELDS,
  skills: ["name"],
  links: ["label", "url"],
  certifications: ["title", "description"],
  achievements: ["title", "description"],
  languages: ["title", "description"],
  volunteering: ["title", "description"],
  customSections: ["title", "description"],
};
const title = (field) =>
  field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
export default function ProfilePage() {
  const { workspace, update } = useWorkspace();
  const edit = (callback) => update((w) => mutateWorkspace(w, callback));
  return (
    <main className="pcv-page">
      <header>
        <p className="pcv-eyebrow">YOUR REUSABLE FOUNDATION</p>
        <h1>Master developer profile</h1>
        <p>
          Maintain your information once. Resume-specific changes belong in the
          variant editor.
        </p>
      </header>
      <nav className="pcv-section-links" aria-label="Profile sections">
        {["personal", ...Object.keys(collections)].map((key) => (
          <a key={key} href={`#${key}`}>
            {key === "personal" ? "Personal information" : title(key)}
          </a>
        ))}
      </nav>
      <section className="pcv-card pcv-profile-section" id="personal">
        <h2>Personal information</h2>
        <div className="pcv-fields">
          {PERSONAL_FIELDS.map((field) => (
            <Field
              key={field}
              label={title(field)}
              value={workspace.profile.personalInfo[field]}
              multiline={field === "summary"}
              type={field === "email" ? "email" : "text"}
              onChange={(value) =>
                edit((w) => {
                  w.profile.personalInfo[field] = value;
                })
              }
            />
          ))}
        </div>
      </section>
      {Object.entries(collections).map(([collection, fields]) => (
        <details
          className="pcv-card pcv-profile-section"
          key={collection}
          id={collection}
          open={collection === "skills" || undefined}
        >
          <summary>
            {title(collection)}{" "}
            <span className="pcv-badge">
              {(workspace.profile[collection] || []).length} entries
            </span>
          </summary>
          <div className="pcv-row">
            <p className="pcv-muted">
              Reusable across your resumes. Customize individual entries in the
              resume editor.
            </p>
            <button
              onClick={() =>
                edit((w) => {
                  (w.profile[collection] ||= []).push({
                    id: newId(),
                    ...Object.fromEntries(fields.map((f) => [f, ""])),
                  });
                })
              }
            >
              Add {collection === "skills" ? "skill" : "entry"}
            </button>
          </div>
          {collection === "skills" && (
            <p>
              Use entries such as “Languages: JavaScript, Python” to group
              skills.
            </p>
          )}
          {!(workspace.profile[collection] || []).length && (
            <p className="pcv-muted">
              No entries yet. Add only information you want to reuse.
            </p>
          )}
          {(workspace.profile[collection] || []).map((record, index) => (
            <article className="pcv-record" key={record.id}>
              <div className="pcv-row">
                <h3>
                  {record.name ||
                    record.title ||
                    record.role ||
                    record.degree ||
                    record.label ||
                    `Entry ${index + 1}`}
                </h3>
                <div>
                  <OrderButtons
                    index={index}
                    length={workspace.profile[collection].length}
                    name={collection}
                    onMove={(delta) =>
                      edit((w) => {
                        w.profile[collection] = move(
                          w.profile[collection],
                          index,
                          delta,
                        );
                      })
                    }
                  />
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete this entry from the master profile and all variant selections?",
                        )
                      )
                        update((w) => removeRecord(w, collection, record.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <EntryEditor
                initiallyOpen={!fields.some((field) => record[field])}
                label="Edit entry"
              >
                <div className="pcv-fields">
                  {fields.map((field) => (
                    <Field
                      key={field}
                      label={title(field)}
                      value={record[field]}
                      multiline={field === "description"}
                      onChange={(value) =>
                        edit((w) => {
                          w.profile[collection].find((r) => r.id === record.id)[
                            field
                          ] = value;
                        })
                      }
                    />
                  ))}
                </div>
              </EntryEditor>
            </article>
          ))}
        </details>
      ))}
    </main>
  );
}
