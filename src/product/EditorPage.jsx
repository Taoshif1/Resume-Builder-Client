import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  FiArrowLeft,
  FiDownload,
  FiEye,
  FiRotateCcw,
  FiRotateCw,
  FiSave,
  FiSliders,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
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
  TEMPLATES,
  newId,
} from "../resume/data/workspace";
import ResumePreview from "./ResumePreview";
import {
  ACCENT_PRESETS,
  DESIGN_PRESETS,
  DOCUMENT_STYLES,
  FONT_FAMILIES,
} from "./document-styles";
import { api, downloadBlob } from "./api";
import { applyVariantDirectEdit } from "./direct-edit";
import { createAutosaveScheduler } from "./save-workspace";
import {
  editorShortcut,
  emptyHistory,
  recordHistory,
  redoHistory,
  undoHistory,
} from "./editor-history";
import {
  duplicateDocumentEntry,
  entryOrderState,
  moveDocumentEntry,
  moveDocumentSection,
  removeDocumentEntry,
  resetDocumentEntryOverride,
  sectionSelection,
  selectionKey,
  setDocumentSectionHidden,
} from "./document-interactions";
import {
  buildDocumentOutline,
  scrollBehavior,
} from "./document-outline";

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
  const workspaceState = useWorkspace();
  const variant = workspaceState.workspace.resumeVariants.find((v) => v.id === id);
  if (!variant)
    return (
      <main className="pcv-page">
        <h1>Document not found</h1>
        <Link to="/dashboard/resumes">Back to Resumes &amp; CVs</Link>
      </main>
    );
  return <DocumentEditor {...workspaceState} variant={variant} />;
}

function DocumentEditor({
    workspace,
    update,
    entitlements,
    features,
    save,
    saving,
    dirty,
    error,
    saveState,
  variant,
  }) {
  const [tab, setTab] = useState("Basics");
  const [view, setView] = useState("edit");
  const [previewZoom, setPreviewZoom] = useState(100);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [guidance, setGuidance] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [history, setHistory] = useState(emptyHistory);
  const [selection, setSelection] = useState(null);
  const [autoSaveBlocked, setAutoSaveBlocked] = useState(false);
  const workspaceRef = useRef(workspace);
  const historyRef = useRef(history);
  const previewRef = useRef(null);
  const outlineRef = useRef(null);
  workspaceRef.current = workspace;
  historyRef.current = history;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const model = resumeDocument(workspace, variant.id);
  const outlineModel = resumeDocument(
    {
      ...workspace,
      resumeVariants: workspace.resumeVariants.map((item) =>
        item.id === variant.id ? { ...item, hiddenSections: [] } : item,
      ),
    },
    variant.id,
  );
  const outlineItems = buildDocumentOutline(
    outlineModel,
    variant.hiddenSections,
  );
  const checks = qualityChecks(model);
  const edit = (fn) => {
    const before = workspaceRef.current;
    const nextHistory = recordHistory(historyRef.current, before);
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    setAutoSaveBlocked(false);
    update((w) =>
      mutateWorkspace(w, (n) => {
        const v = n.resumeVariants.find((v) => v.id === variant.id);
        fn(v);
        v.updatedAt = new Date().toISOString();
      }),
    );
  };

  function undo() {
    const result = undoHistory(historyRef.current, workspaceRef.current);
    if (!result) return;
    historyRef.current = result.history;
    setHistory(result.history);
    setAutoSaveBlocked(false);
    update(result.workspace);
  }

  function redo() {
    const result = redoHistory(historyRef.current, workspaceRef.current);
    if (!result) return;
    historyRef.current = result.history;
    setHistory(result.history);
    setAutoSaveBlocked(false);
    update(result.workspace);
  }

  function directEdit(change) {
    edit((currentVariant) => applyVariantDirectEdit(currentVariant, change));
  }

  async function saveNow() {
    setAutoSaveBlocked(false);
    await save();
  }

  useEffect(() => {
    if (!dirty || saving || autoSaveBlocked) return undefined;
    const autosave = createAutosaveScheduler(save, {
      onError: () => setAutoSaveBlocked(true),
    });
    autosave.schedule();
    return autosave.cancel;
  }, [dirty, saving, autoSaveBlocked, workspace, save]);

  useEffect(() => {
    const handleShortcut = (event) => {
      const shortcut = editorShortcut(event);
      if (shortcut) event.preventDefault();
      if (shortcut === "save") {
        if (dirty) action(saveNow);
      } else if (shortcut === "redo") {
        redo();
      } else if (shortcut === "undo") {
        undo();
      } else if (event.key === "Escape" && document.activeElement?.isContentEditable) {
        document.activeElement.blur();
      } else if (event.key === "Escape" && selection) {
        setSelection(null);
        previewRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

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
      if (
        blob.type !== "application/pdf" ||
        (await blob.slice(0, 5).text()) !== "%PDF-"
      )
        throw new Error("The PDF response is invalid. Please try again.");
      downloadBlob(
        blob,
        pdfFilename(model.name, variant.name, model.documentType),
      );
      setMessage("PDF downloaded.");
    });
  }

  function focusSelection(nextSelection, editable = false) {
    const key = selectionKey(nextSelection);
    window.requestAnimationFrame(() => {
      const target = [...(previewRef.current?.querySelectorAll("[data-selection-key]") || [])]
        .find((element) => element.dataset.selectionKey === key);
      const focusTarget = editable ? target?.querySelector(".pcv-direct-edit") : target;
      if (focusTarget) focusTarget.focus();
      else previewRef.current?.focus();
    });
  }

  function applyContextAction(change, nextSelection = selection) {
    edit(change);
    setSelection(nextSelection);
    focusSelection(nextSelection);
  }

  function navigateFromOutline(item) {
    const nextSelection = sectionSelection(item.key);
    if (item.hidden)
      edit((currentVariant) =>
        setDocumentSectionHidden(currentVariant, item.key, false),
      );
    setSelection(nextSelection);
    setView("preview");
    if (outlineRef.current) outlineRef.current.open = false;
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        const target = [
          ...(previewRef.current?.querySelectorAll("[data-selection-key]") || []),
        ].find((element) => element.dataset.selectionKey === item.targetKey);
        if (!target) {
          previewRef.current?.focus();
          return;
        }
        const reducedMotion = window.matchMedia?.(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        target.scrollIntoView({
          behavior: scrollBehavior(reducedMotion),
          block: "start",
        });
        target.focus();
      }),
    );
  }

  function duplicateSelectedEntry() {
    if (selection?.type !== "entry") return;
    const before = workspaceRef.current;
    const nextHistory = recordHistory(historyRef.current, before);
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    setAutoSaveBlocked(false);
    const result = duplicateDocumentEntry(before, variant.id, selection.collection, selection.id, newId);
    const nextVariant = result.workspace.resumeVariants.find((item) => item.id === variant.id);
    nextVariant.updatedAt = new Date().toISOString();
    update(result.workspace);
    const nextSelection = { ...selection, id: result.id };
    setSelection(nextSelection);
    focusSelection(nextSelection);
  }

  const selectedSectionIndex = selection ? variant.sectionOrder.indexOf(selection.sectionKey) : -1;
  const selectedEntryOrder = selection?.type === "entry"
    ? entryOrderState(variant, selection.collection, selection.id)
    : null;
  const selectedHasOverride = selection?.type === "entry" &&
    Boolean(variant.overrides[selection.collection]?.[selection.id]);

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
    <main className="pcv-editor" data-view={view}>
      <header className="pcv-editor-header">
        <div className="pcv-editor-identity">
          <Link
            to="/dashboard/resumes"
            className="pcv-editor-back"
            aria-label="Back to Resumes and CVs"
            title="Back to Resumes and CVs"
          >
            <FiArrowLeft aria-hidden="true" />
            <span>Back</span>
          </Link>
          <div className="pcv-editor-title">
            <div className="pcv-editor-meta">
              <span className="pcv-document-type">
                {model.documentType === "cv" ? "CV" : "Resume"}
              </span>
              <span
                className={`pcv-editor-save-state is-${saveState}`}
                role="status"
                aria-live="polite"
              >
                {saving
                  ? "Saving…"
                  : saveState === "conflict"
                    ? "Conflict"
                    : saveState === "failed"
                      ? "Save failed"
                      : dirty
                        ? "Unsaved"
                        : "Saved"}
              </span>
            </div>
            <h1 title={variant.name}>{variant.name}</h1>
          </div>
        </div>
        <div className="pcv-editor-toolbar" role="toolbar" aria-label="Document actions">
          <button
            type="button"
            disabled={!history.undo.length}
            onClick={undo}
            aria-label="Undo document change"
            title="Undo (Ctrl or Cmd + Z)"
          >
            <FiRotateCcw aria-hidden="true" />
            <span className="pcv-toolbar-label">Undo</span>
          </button>
          <button
            type="button"
            disabled={!history.redo.length}
            onClick={redo}
            aria-label="Redo document change"
            title="Redo (Ctrl or Cmd + Shift + Z)"
          >
            <FiRotateCw aria-hidden="true" />
            <span className="pcv-toolbar-label">Redo</span>
          </button>
          <button
            type="button"
            aria-pressed={tab === "Design"}
            onClick={() => {
              setTab("Design");
              setView("edit");
            }}
            title="Open template and design controls"
          >
            <FiSliders aria-hidden="true" />
            <span className="pcv-toolbar-label">Design</span>
          </button>
          <div className="pcv-toolbar-zoom" role="group" aria-label="Preview zoom">
            <button
              type="button"
              onClick={() => setPreviewZoom((zoom) => Math.max(60, zoom - 10))}
              disabled={previewZoom <= 60}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <FiZoomOut aria-hidden="true" />
            </button>
            <button
              type="button"
              className="pcv-zoom-value"
              onClick={() => setPreviewZoom(100)}
              aria-label={`Reset zoom to 100 percent. Current zoom ${previewZoom} percent.`}
              title="Reset zoom to 100%"
            >
              {previewZoom}%
            </button>
            <button
              type="button"
              onClick={() => setPreviewZoom((zoom) => Math.min(140, zoom + 10))}
              disabled={previewZoom >= 140}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <FiZoomIn aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            aria-pressed={view === "preview"}
            onClick={() => setView("preview")}
            title="Show document preview"
          >
            <FiEye aria-hidden="true" />
            <span className="pcv-toolbar-label">Preview</span>
          </button>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() => action(saveNow)}
            title={error ? "Retry saving this document" : "Save (Ctrl or Cmd + S)"}
          >
            <FiSave aria-hidden="true" />
            <span className="pcv-toolbar-label">{error ? "Retry" : "Save"}</span>
          </button>
          <button
            type="button"
            className="pcv-primary"
            disabled={busy || saving}
            onClick={exportPdf}
            title="Export this document as PDF"
          >
            <FiDownload aria-hidden="true" />
            <span>{busy ? "Working…" : "Export PDF"}</span>
          </button>
        </div>
      </header>
      {error && (
        <p className="pcv-notice" role="alert">
          {error}
        </p>
      )}
      <div className="pcv-mobile-view" aria-label="Editor view">
        <button aria-pressed={view === "edit"} onClick={() => setView("edit")}>
          Edit
        </button>
        <button
          aria-pressed={view === "preview"}
          onClick={() => setView("preview")}
        >
          Preview
        </button>
      </div>
      {message && (
        <p className="pcv-notice" role="status">
          {message}
        </p>
      )}
      <div className="pcv-editor-columns">
        <div className="pcv-editor-controls">
          <nav className="pcv-editor-tabs" aria-label="Editor sections">
            {["Basics", "Design", "Content", "Order", "Targeting", "Review"].map(
              (label) => (
                <button
                  key={label}
                  aria-pressed={tab === label}
                  onClick={() => setTab(label)}
                >
                  {label}
                </button>
              ),
            )}
          </nav>
          <section className="pcv-card" hidden={tab !== "Basics"}>
            <h2>{model.documentType === "cv" ? "CV details" : "Resume details"}</h2>
            <Field
              label={model.documentType === "cv" ? "CV name" : "Resume name"}
              value={variant.name}
              onChange={(value) =>
                edit((v) => {
                  v.name = value || (v.documentType === "cv" ? "Untitled CV" : "Untitled resume");
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
              Document type
              <select
                value={variant.documentType || "resume"}
                onChange={(e) =>
                  edit((v) => {
                    v.documentType = e.target.value;
                  })
                }
              >
                <option value="resume">Resume</option>
                <option value="cv">CV</option>
              </select>
            </label>
            <p className="pcv-muted">
              {model.documentType === "cv"
                ? "A broader career record. Include education, certifications and custom sections; multiple pages are welcome."
                : "A focused application. Choose relevant evidence and aim for a concise one or two pages."}
            </p>
          </section>
          <section className="pcv-card pcv-design-panel" hidden={tab !== "Design"}>
            <div className="pcv-row">
              <div>
                <p className="pcv-eyebrow">DOCUMENT STUDIO</p>
                <h2>Layout & typography</h2>
                <p className="pcv-muted">
                  Google Docs-style control, while keeping the document structured
                  and ATS-friendly.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  edit((v) => {
                    for (const key of [
                      "fontSize",
                      "fontFamily",
                      "lineSpacing",
                      "sectionGap",
                      "entryGap",
                      "pageMargin",
                      "accentColor",
                      "headerAlign",
                      "sectionStyle",
                    ])
                      delete v[key];
                  })
                }
              >
                Reset design
              </button>
            </div>

            <div className="pcv-density-presets" aria-label="Density presets">
              {Object.entries(DESIGN_PRESETS).map(([name, preset]) => (
                <button
                  type="button"
                  key={name}
                  onClick={() =>
                    edit((v) => {
                      Object.assign(v, preset);
                    })
                  }
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="pcv-fields">
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
                  {TEMPLATES.map((t) => (
                    <option
                      key={t}
                      disabled={!entitlements.templates.includes(t)}
                      value={t}
                    >
                      {DOCUMENT_STYLES[t]?.label || t}
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
                  <option value="A4">A4</option>
                  <option value="LETTER">US Letter</option>
                  <option value="LEGAL">US Legal</option>
                </select>
              </label>

              <label className="pcv-field">
                Font
                <select
                  value={variant.fontFamily || ""}
                  onChange={(e) =>
                    edit((v) => {
                      if (e.target.value) v.fontFamily = e.target.value;
                      else delete v.fontFamily;
                    })
                  }
                >
                  <option value="">Template default</option>
                  {Object.entries(FONT_FAMILIES).map(([id, font]) => (
                    <option key={id} value={id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="pcv-field">
                Text size
                <div className="pcv-design-number">
                  <input
                    type="range"
                    min="8"
                    max="18"
                    step="0.5"
                    value={variant.fontSize || 11}
                    onChange={(e) =>
                      edit((v) => {
                        v.fontSize = Number(e.target.value);
                      })
                    }
                  />
                  <input
                    type="number"
                    min="8"
                    max="18"
                    step="0.5"
                    value={variant.fontSize || 11}
                    onChange={(e) =>
                      edit((v) => {
                        v.fontSize = Math.min(
                          18,
                          Math.max(8, Number(e.target.value) || 11),
                        );
                      })
                    }
                    aria-label="Text size in points"
                  />
                  <span>pt</span>
                </div>
              </label>

              <label className="pcv-field">
                Line spacing
                <div className="pcv-design-number">
                  <input
                    type="range"
                    min="0.9"
                    max="2"
                    step="0.05"
                    value={variant.lineSpacing || DOCUMENT_STYLES[variant.template]?.lineSpacing || 1.15}
                    onChange={(e) =>
                      edit((v) => {
                        v.lineSpacing = Number(e.target.value);
                      })
                    }
                  />
                  <input
                    type="number"
                    min="0.9"
                    max="2"
                    step="0.05"
                    value={variant.lineSpacing || DOCUMENT_STYLES[variant.template]?.lineSpacing || 1.15}
                    onChange={(e) =>
                      edit((v) => {
                        v.lineSpacing = Math.min(
                          2,
                          Math.max(0.9, Number(e.target.value) || 1.15),
                        );
                      })
                    }
                    aria-label="Line spacing"
                  />
                  <span>×</span>
                </div>
              </label>

              <label className="pcv-field">
                Section spacing
                <div className="pcv-design-number">
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="1"
                    value={variant.sectionGap ?? DOCUMENT_STYLES[variant.template]?.sectionGap ?? 7}
                    onChange={(e) =>
                      edit((v) => {
                        v.sectionGap = Number(e.target.value);
                      })
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={variant.sectionGap ?? DOCUMENT_STYLES[variant.template]?.sectionGap ?? 7}
                    onChange={(e) =>
                      edit((v) => {
                        v.sectionGap = Math.min(
                          24,
                          Math.max(0, Number(e.target.value) || 0),
                        );
                      })
                    }
                    aria-label="Section spacing in points"
                  />
                  <span>pt</span>
                </div>
              </label>

              <label className="pcv-field">
                Entry spacing
                <div className="pcv-design-number">
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.5"
                    value={variant.entryGap ?? DOCUMENT_STYLES[variant.template]?.entryGap ?? 4}
                    onChange={(e) =>
                      edit((v) => {
                        v.entryGap = Number(e.target.value);
                      })
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="16"
                    step="0.5"
                    value={variant.entryGap ?? DOCUMENT_STYLES[variant.template]?.entryGap ?? 4}
                    onChange={(e) =>
                      edit((v) => {
                        v.entryGap = Math.min(
                          16,
                          Math.max(0, Number(e.target.value) || 0),
                        );
                      })
                    }
                    aria-label="Entry spacing in points"
                  />
                  <span>pt</span>
                </div>
              </label>

              <label className="pcv-field">
                Page margins
                <div className="pcv-design-number">
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="2"
                    value={variant.pageMargin ?? DOCUMENT_STYLES[variant.template]?.pageMargin ?? 44}
                    onChange={(e) =>
                      edit((v) => {
                        v.pageMargin = Number(e.target.value);
                      })
                    }
                  />
                  <input
                    type="number"
                    min="20"
                    max="80"
                    step="2"
                    value={variant.pageMargin ?? DOCUMENT_STYLES[variant.template]?.pageMargin ?? 44}
                    onChange={(e) =>
                      edit((v) => {
                        v.pageMargin = Math.min(
                          80,
                          Math.max(20, Number(e.target.value) || 44),
                        );
                      })
                    }
                    aria-label="Page margins in points"
                  />
                  <span>pt</span>
                </div>
              </label>

              <label className="pcv-field">
                Header alignment
                <select
                  value={variant.headerAlign || ""}
                  onChange={(e) =>
                    edit((v) => {
                      if (e.target.value) v.headerAlign = e.target.value;
                      else delete v.headerAlign;
                    })
                  }
                >
                  <option value="">Template default</option>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </label>

              <label className="pcv-field">
                Section heading format
                <select
                  value={variant.sectionStyle || ""}
                  onChange={(e) =>
                    edit((v) => {
                      if (e.target.value) v.sectionStyle = e.target.value;
                      else delete v.sectionStyle;
                    })
                  }
                >
                  <option value="">Template default</option>
                  <option value="line">Full divider</option>
                  <option value="underline">Short underline</option>
                  <option value="plain">No divider</option>
                </select>
              </label>
            </div>

            <div className="pcv-color-control">
              <div>
                <strong>Accent color</strong>
                <p className="pcv-muted">
                  Used for your name, section headings and document links.
                </p>
              </div>
              <div className="pcv-color-swatches">
                {ACCENT_PRESETS.map((color) => (
                  <button
                    type="button"
                    key={color.value}
                    title={color.label}
                    aria-label={`Use ${color.label}`}
                    aria-pressed={
                      (variant.accentColor || DOCUMENT_STYLES[variant.template]?.accent)
                        ?.toLowerCase() === color.value.toLowerCase()
                    }
                    style={{ background: color.value }}
                    onClick={() =>
                      edit((v) => {
                        v.accentColor = color.value;
                      })
                    }
                  />
                ))}
                <label className="pcv-custom-color">
                  Custom
                  <input
                    type="color"
                    value={variant.accentColor || DOCUMENT_STYLES[variant.template]?.accent || "#345b91"}
                    onChange={(e) =>
                      edit((v) => {
                        v.accentColor = e.target.value;
                      })
                    }
                  />
                </label>
              </div>
            </div>
          </section>
          <section className="pcv-card" hidden={tab !== "Content"}>
            <h2>Summary for this {model.documentType === "cv" ? "CV" : "resume"}</h2>
            <p className="pcv-badge">
              {variant.overrides.personalInfo.summary !== undefined
                ? "Customized for this document"
                : "Using master summary"}
            </p>
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
              Reset to master summary
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
          <section className="pcv-card" hidden={tab !== "Order"}>
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
            <div className="pcv-add-section-panel">
              <h3>Add or restore sections</h3>
              <p className="pcv-muted">
                Choose core entries in Content. Additional sections use reusable
                Master Profile entries and can be shown or hidden here.
              </p>
              {[
                ["certifications", "Certifications"],
                ["achievements", "Achievements"],
                ["languages", "Languages"],
                ["volunteering", "Volunteering"],
                ["customSections", "Custom sections"],
              ].map(([section, label]) => {
                const count = (workspace.profile[section] || []).length;
                const visible =
                  count > 0 &&
                  !variant.hiddenSections?.includes(section);
                return (
                  <div className="pcv-add-section-row" key={section}>
                    <label className="pcv-check">
                      <input
                        type="checkbox"
                        checked={visible}
                        disabled={count === 0}
                        onChange={(event) =>
                          edit((currentVariant) =>
                            setDocumentSectionHidden(
                              currentVariant,
                              section,
                              !event.target.checked,
                            ),
                          )
                        }
                      />
                      <span>{label}</span>
                    </label>
                    <span className="pcv-muted">
                      {count
                        ? `${count} ${count === 1 ? "entry" : "entries"}`
                        : "No entries"}
                    </span>
                    <Link to={`/dashboard/profile#${section}`}>
                      {count ? "Edit entries" : "Add entries"}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
          {groups.map(([collection, key, records, fields]) => (
            <section className="pcv-card" key={key} hidden={tab !== "Content"}>
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
                          <summary>
                            {Object.keys(
                              variant.overrides[collection][record.id] || {},
                            ).length
                              ? "Customized for this document"
                              : "Using master content"}{" "}
                            · Edit
                          </summary>
                          <p className="pcv-muted">
                            Changes here affect this document only. Deselecting a
                            project keeps it in your Project Library.
                          </p>
                          {fields.map((field) => (
                            <Field
                              key={field}
                              label={`${field.replace(/([A-Z])/g, " $1")} · ${variant.overrides[collection][record.id]?.[field] !== undefined ? "Customized" : "Master"}`}
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
          <section className="pcv-card" hidden={tab !== "Review"}>
            <h2>{model.documentType === "cv" ? "CV" : "Resume"} checks</h2>
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
          <section className="pcv-card" hidden={tab !== "Targeting"}>
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
                    <h3>Terms absent from this document</h3>
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
        <div className="pcv-preview-wrap" ref={previewRef} tabIndex={-1}>
          <div className="pcv-document-toolbar" aria-label="Document preview details">
            <span>
              Live preview · {model.paperSize} · PDF paginates automatically
            </span>
            <div className="pcv-document-toolbar-meta">
              <details className="pcv-document-outline" ref={outlineRef}>
                <summary>Outline</summary>
                <nav aria-label="Document outline">
                  {outlineItems.length ? (
                    outlineItems.map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        className={item.hidden ? "is-hidden" : ""}
                        aria-current={
                          !item.hidden && selection?.sectionKey === item.key
                            ? "location"
                            : undefined
                        }
                        onClick={() => navigateFromOutline(item)}
                      >
                        <span>{item.title}</span>
                        {item.hidden && <small>Restore</small>}
                      </button>
                    ))
                  ) : (
                    <span>No document sections yet.</span>
                  )}
                </nav>
              </details>
              <span>{previewZoom}% zoom</span>
            </div>
          </div>
          <div className="pcv-context-toolbar" role={selection ? "toolbar" : "status"} aria-label={selection ? "Selected document content actions" : undefined}>
            {!selection && <span>Select a section or entry for document actions.</span>}
            {selection?.type === "section" && (
              <>
                <strong>{model.sections.find((item) => item.key === selection.sectionKey)?.title || selection.sectionKey}</strong>
                {selectedSectionIndex >= 0 && (
                  <>
                    <button type="button" disabled={selectedSectionIndex === 0} onClick={() => applyContextAction((currentVariant) => moveDocumentSection(currentVariant, selection.sectionKey, -1))}>Move up</button>
                    <button type="button" disabled={selectedSectionIndex === variant.sectionOrder.length - 1} onClick={() => applyContextAction((currentVariant) => moveDocumentSection(currentVariant, selection.sectionKey, 1))}>Move down</button>
                  </>
                )}
                <button type="button" onClick={() => { setTab(["summary", "skills", "experience", "projects", "education"].includes(selection.sectionKey) ? "Content" : "Order"); setView("edit"); }}>Open inspector</button>
                <button type="button" onClick={() => {
                  edit((currentVariant) => setDocumentSectionHidden(currentVariant, selection.sectionKey, true));
                  setSelection(null);
                  window.requestAnimationFrame(() => previewRef.current?.focus());
                }}>Hide section</button>
              </>
            )}
            {selection?.type === "entry" && (
              <>
                <strong>Selected entry</strong>
                <button type="button" onClick={() => focusSelection(selection, true)}>Edit</button>
                <button type="button" disabled={!selectedEntryOrder?.canMoveUp} onClick={() => applyContextAction((currentVariant) => moveDocumentEntry(currentVariant, selection.collection, selection.id, -1))}>Move up</button>
                <button type="button" disabled={!selectedEntryOrder?.canMoveDown} onClick={() => applyContextAction((currentVariant) => moveDocumentEntry(currentVariant, selection.collection, selection.id, 1))}>Move down</button>
                <button type="button" onClick={duplicateSelectedEntry} title="Creates a new source copy in your Master Profile or Project Library">Duplicate</button>
                <button type="button" disabled={!selectedHasOverride} onClick={() => applyContextAction((currentVariant) => resetDocumentEntryOverride(currentVariant, selection.collection, selection.id))}>Reset customization</button>
                <button type="button" onClick={() => {
                  const nextSelection = sectionSelection(selection.sectionKey);
                  edit((currentVariant) => removeDocumentEntry(currentVariant, selection.collection, selection.id));
                  setSelection(nextSelection);
                  focusSelection(nextSelection);
                }} title="Keeps the source record in your Master Profile or Project Library">Remove from this document</button>
              </>
            )}
            {selection && (
              <button type="button" className="pcv-context-close" onClick={() => { setSelection(null); previewRef.current?.focus(); }} aria-label="Clear document selection" title="Clear selection (Escape)">×</button>
            )}
          </div>
          <div className="pcv-preview-canvas" onClick={(event) => {
            if (event.target === event.currentTarget) setSelection(null);
          }}>
            <ResumePreview model={model} zoom={previewZoom} onEdit={directEdit} selection={selection} onSelect={setSelection} onClearSelection={() => setSelection(null)} />
          </div>
        </div>
      </div>
    </main>
  );
}
