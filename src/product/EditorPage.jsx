import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useWorkspace } from "./workspaceContext";
import { Field, OrderButtons } from "./Fields";
import { mutateWorkspace, move } from "./operations";
import { resumeDocument, qualityChecks, pdfFilename } from "./document";
import {
  PROJECT_FIELDS,
  EXPERIENCE_FIELDS,
  EDUCATION_FIELDS,
} from "../resume/data/workspace";
import ResumePreview from "./ResumePreview";
import { api, downloadBlob } from "./api";

function SectionOrder({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      data-dragging={isDragging ? "true" : "false"}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : undefined,
      }}
      className="pcv-row pcv-section-order"
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="pcv-drag-handle"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${id} section`}
        aria-pressed={isDragging}
      >
        ⠿
      </button>
      {children}
    </div>
  );
}

export default function EditorPage() {
  const { id } = useParams();
  const { workspace, update, entitlements, features, save, saving, dirty } =
    useWorkspace();
  const variant =
    workspace.resumeVariants.find((v) => v.id === id) ||
    (!id ? workspace.resumeVariants[0] : null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [guidance, setGuidance] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!variant)
    return (
      <main className="pcv-page">
        <h1>Resume not found</h1>
        <Link to="/dashboard/resumes">Back to resumes</Link>
      </main>
    );

  const model = resumeDocument(workspace, variant.id);
  const checks = qualityChecks(model);
  const edit = (fn) =>
    update((w) =>
      mutateWorkspace(w, (n) => {
        const v = n.resumeVariants.find((v) => v.id === variant.id);
        fn(v);
        v.updatedAt = new Date().toISOString();
      }),
    );

  async function action(fn) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function exportPdf() {
    await action(async () => {
      if (dirty) await save();
      const blob = await api("/export", {
        method: "POST",
        body: { variantId: variant.id },
        blob: true,
      });
      downloadBlob(blob, pdfFilename(model.name, variant.name));
      setMessage("PDF downloaded.");
    });
  }

  const groups = [
    [
      "experience",
      "experienceIds",
      workspace.profile.experience,
      EXPERIENCE_FIELDS,
    ],
    ["projects", "projectIds", workspace.projects, PROJECT_FIELDS],
    [
      "education",
      "educationIds",
      workspace.profile.education,
      EDUCATION_FIELDS,
    ],
    ["skills", "skillIds", workspace.profile.skills, ["name"]],
  ];

  return (
    <main className="pcv-editor">
      <header className="pcv-editor-header">
        <div>
          <Link to="/dashboard/resumes">← Resume variants</Link>
          <h1>{variant.name}</h1>
          <p>Edits here apply only to this resume.</p>
        </div>
        <button disabled={busy || saving} onClick={exportPdf}>
          {busy ? "Working…" : "Download PDF"}
        </button>
      </header>
      {message && (
        <p className="pcv-notice" role="status">
          {message}
        </p>
      )}
      <div className="pcv-editor-columns">
        <div className="pcv-editor-controls">
          <section className="pcv-card">
            <h2>Resume details</h2>
            <Field
              label="Resume name"
              value={variant.name}
              onChange={(value) =>
                edit((v) => {
                  v.name = value || "Untitled resume";
                })
              }
            />
            <Field
              label="Target role"
              value={variant.targetRole}
              onChange={(value) =>
                edit((v) => {
                  v.targetRole = value;
                })
              }
            />
            <Field
              label="Target company"
              value={variant.company}
              onChange={(value) =>
                edit((v) => {
                  v.company = value;
                })
              }
            />
            <Field
              label="Labels"
              value={variant.labels}
              onChange={(value) =>
                edit((v) => {
                  v.labels = value;
                })
              }
            />
            <label className="pcv-field">
              Template
              <select
                value={variant.template}
                onChange={(e) =>
                  edit((v) => {
                    v.template = e.target.value;
                  })
                }
              >
                {["modern", "minimal", "corporate"].map((t) => (
                  <option
                    key={t}
                    disabled={!entitlements.templates.includes(t)}
                    value={t}
                  >
                    {t}
                    {!entitlements.templates.includes(t) ? " · Pro" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="pcv-field">
              Paper size
              <select
                value={variant.paperSize || "A4"}
                onChange={(e) =>
                  edit((v) => {
                    v.paperSize = e.target.value;
                  })
                }
              >
                <option>A4</option>
                <option value="LETTER">US Letter</option>
              </select>
            </label>
            <label className="pcv-field">
              Text size
              <select
                value={variant.fontSize || 11}
                onChange={(e) =>
                  edit((v) => {
                    v.fontSize = Number(e.target.value);
                  })
                }
              >
                {[10, 11, 12].map((n) => (
                  <option key={n} value={n}>
                    {n} pt
                  </option>
                ))}
              </select>
            </label>
          </section>
          <section className="pcv-card">
            <h2>Summary for this resume</h2>
            <Field
              label="Summary"
              multiline
              value={
                variant.overrides.personalInfo.summary ??
                workspace.profile.personalInfo.summary
              }
              onChange={(value) =>
                edit((v) => {
                  v.overrides.personalInfo.summary = value;
                })
              }
            />
            <button
              onClick={() =>
                edit((v) => {
                  delete v.overrides.personalInfo.summary;
                })
              }
            >
              Use master summary
            </button>
            {entitlements.aiTools && (
              <button
                disabled={!features.ai || busy}
                onClick={() =>
                  action(async () => {
                    const result = await api("/ai", {
                      method: "POST",
                      body: {
                        action: "shorten",
                        text:
                          model.sections.find((s) => s.key === "summary")
                            ?.items[0]?.text || "",
                      },
                    });
                    setSuggestion(result);
                  })
                }
              >
                {features.ai
                  ? "Suggest a shorter summary"
                  : "AI writing not configured"}
              </button>
            )}
            {suggestion && (
              <aside className="pcv-notice">
                <h3>Review suggestion</h3>
                <p>{suggestion.suggestion}</p>
                <button
                  onClick={() => {
                    edit((v) => {
                      v.overrides.personalInfo.summary = suggestion.suggestion;
                    });
                    setSuggestion(null);
                  }}
                >
                  Apply to this variant
                </button>
                <button onClick={() => setSuggestion(null)}>
                  Keep original
                </button>
              </aside>
            )}
          </section>
          <section className="pcv-card">
            <h2>Section order</h2>
            <p>
              Drag the handle, use arrow buttons, or focus a handle and press
              Space followed by the arrow keys.
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (!over || active.id === over.id) return;
                edit((v) => {
                  const oldIndex = v.sectionOrder.indexOf(active.id);
                  const newIndex = v.sectionOrder.indexOf(over.id);
                  if (oldIndex < 0 || newIndex < 0) return;
                  v.sectionOrder = arrayMove(
                    v.sectionOrder,
                    oldIndex,
                    newIndex,
                  );
                });
              }}
            >
              <SortableContext
                items={variant.sectionOrder}
                strategy={verticalListSortingStrategy}
              >
                {variant.sectionOrder.map((section, index) => (
                  <SectionOrder id={section} key={section}>
                    <label className="pcv-section-label">
                      <input
                        type="checkbox"
                        checked={!variant.hiddenSections?.includes(section)}
                        onChange={(e) =>
                          edit((v) => {
                            v.hiddenSections = e.target.checked
                              ? (v.hiddenSections || []).filter(
                                  (s) => s !== section,
                                )
                              : [...(v.hiddenSections || []), section];
                          })
                        }
                      />{" "}
                      <span>{section}</span>
                    </label>
                    <OrderButtons
                      index={index}
                      length={variant.sectionOrder.length}
                      name={section}
                      onMove={(delta) =>
                        edit((v) => {
                          v.sectionOrder = move(v.sectionOrder, index, delta);
                        })
                      }
                    />
                  </SectionOrder>
                ))}
              </SortableContext>
            </DndContext>
            {[
              "certifications",
              "achievements",
              "languages",
              "volunteering",
              "customSections",
            ].map((section) => (
              <label className="pcv-check" key={section}>
                <input
                  type="checkbox"
                  checked={!variant.hiddenSections?.includes(section)}
                  onChange={(e) =>
                    edit((v) => {
                      v.hiddenSections = e.target.checked
                        ? (v.hiddenSections || []).filter((s) => s !== section)
                        : [...(v.hiddenSections || []), section];
                    })
                  }
                />
                {section.replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </section>
          {groups.map(([collection, key, records, fields]) => (
            <section className="pcv-card" key={key}>
              <h2>{collection}</h2>
              {!records.length && (
                <p>
                  Add entries in your{" "}
                  <Link
                    to={
                      collection === "projects"
                        ? "/dashboard/projects"
                        : "/dashboard/profile"
                    }
                  >
                    master{" "}
                    {collection === "projects" ? "project library" : "profile"}
                  </Link>
                  .
                </p>
              )}
              {[
                ...variant[key].map((id) => records.find((r) => r.id === id)),
                ...records.filter((r) => !variant[key].includes(r.id)),
              ]
                .filter(Boolean)
                .map((record) => {
                  const content =
                    collection === "projects" ? record.resumeData : record;
                  const selected = variant[key].includes(record.id);
                  const index = variant[key].indexOf(record.id);
                  return (
                    <div className="pcv-record" key={record.id}>
                      <div className="pcv-row">
                        <label>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) =>
                              edit((v) => {
                                v[key] = e.target.checked
                                  ? [...v[key], record.id]
                                  : v[key].filter((id) => id !== record.id);
                              })
                            }
                          />{" "}
                          {content.title ||
                            content.role ||
                            content.degree ||
                            content.name ||
                            "Untitled entry"}
                        </label>
                        {selected && (
                          <OrderButtons
                            index={index}
                            length={variant[key].length}
                            name={collection}
                            onMove={(delta) =>
                              edit((v) => {
                                v[key] = move(v[key], index, delta);
                              })
                            }
                          />
                        )}
                      </div>
                      {selected && (
                        <details>
                          <summary>Edit for this resume</summary>
                          {fields.map((field) => (
                            <Field
                              key={field}
                              label={field.replace(/([A-Z])/g, " $1")}
                              multiline={field === "description"}
                              value={
                                variant.overrides[collection][record.id]?.[
                                  field
                                ] ?? content[field]
                              }
                              onChange={(value) =>
                                edit((v) => {
                                  v.overrides[collection][record.id] = {
                                    ...v.overrides[collection][record.id],
                                    [field]: value,
                                  };
                                })
                              }
                            />
                          ))}
                          <button
                            onClick={() =>
                              edit((v) => {
                                delete v.overrides[collection][record.id];
                              })
                            }
                          >
                            Reset to master entry
                          </button>
                        </details>
                      )}
                    </div>
                  );
                })}
            </section>
          ))}
          <section className="pcv-card">
            <h2>Resume quality guidance</h2>
            <p>
              Editorial checks, not an authoritative ATS score or hiring
              prediction.
            </p>
            {checks.length ? (
              <ul>
                {checks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : (
              <p>Basic checks passed. Review every detail before submitting.</p>
            )}
          </section>
          <section className="pcv-card">
            <h2>Job targeting · Pro</h2>
            {entitlements.jobMatching ? (
              <>
                <Field
                  label="Saved job description"
                  multiline
                  value={variant.jobDescription}
                  onChange={(value) =>
                    edit((v) => {
                      v.jobDescription = value;
                    })
                  }
                />
                <button
                  disabled={busy || saving || !variant.jobDescription}
                  onClick={() =>
                    action(async () => {
                      if (dirty) await save();
                      setGuidance(
                        await api("/guidance", {
                          method: "POST",
                          body: {
                            variantId: variant.id,
                            description: variant.jobDescription,
                          },
                        }),
                      );
                    })
                  }
                >
                  Compare existing content
                </button>
                {guidance && (
                  <div>
                    <h3>Matched terms</h3>
                    <p>{guidance.match.matched.join(", ") || "None found"}</p>
                    <h3>Terms absent from this resume</h3>
                    <p>{guidance.match.missing.join(", ") || "None found"}</p>
                    <p>
                      Add a term only if it truthfully describes your
                      experience.
                    </p>
                    <h3>Consider emphasizing</h3>
                    <ul>
                      {guidance.match.hints.map((h) => (
                        <li key={h.title}>
                          {h.title} ({h.matches} matching terms)
                        </li>
                      ))}
                    </ul>
                    <p>
                      Keyword matching is literal guidance and may miss synonyms
                      or context.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p>
                Pro adds saved job targets and keyword comparisons.{" "}
                <Link to="/dashboard/settings">View your plan</Link>.
              </p>
            )}
          </section>
        </div>
        <div className="pcv-preview-wrap">
          <p className="pcv-muted">
            Live preview · {model.paperSize} · PDF paginates automatically
          </p>
          <ResumePreview model={model} />
        </div>
      </div>
    </main>
  );
}
