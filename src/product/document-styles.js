// Shared document tokens for the HTML preview and PDF renderer.
export const FONT_FAMILIES = {
  sans: {
    label: "Clean Sans",
    css: "PersonaResume, Arial, sans-serif",
    pdfRegular: "Regular",
    pdfBold: "Bold",
  },
  serif: {
    label: "Classic Serif",
    css: "Georgia, 'Times New Roman', serif",
    pdfRegular: "Times-Roman",
    pdfBold: "Times-Bold",
  },
  mono: {
    label: "Developer Mono",
    css: "'Courier New', Courier, monospace",
    pdfRegular: "Courier",
    pdfBold: "Courier-Bold",
  },
};

export const ACCENT_PRESETS = [
  { label: "Persona Blue", value: "#345b91" },
  { label: "Ink", value: "#172033" },
  { label: "Slate", value: "#4b5563" },
  { label: "Teal", value: "#176b68" },
  { label: "Forest", value: "#315f46" },
  { label: "Burgundy", value: "#7a3344" },
  { label: "Purple", value: "#5d4a8a" },
];

export const DOCUMENT_STYLES = {
  modern: {
    label: "Modern",
    align: "center",
    accent: "#345b91",
    fontFamily: "sans",
    nameSize: 23,
    nameBold: true,
    uppercase: true,
    rule: 0.6,
    headerRule: 0,
    sectionGap: 6,
    entryGap: 3,
    lineSpacing: 1.12,
    pageMargin: 44,
    sectionStyle: "line",
  },
  minimal: {
    label: "Minimal",
    align: "left",
    accent: "#242424",
    fontFamily: "sans",
    nameSize: 25,
    nameBold: false,
    uppercase: false,
    rule: 0.3,
    headerRule: 0,
    sectionGap: 12,
    entryGap: 7,
    lineSpacing: 1.24,
    pageMargin: 50,
    sectionStyle: "line",
  },
  corporate: {
    label: "Corporate",
    align: "left",
    accent: "#172033",
    fontFamily: "sans",
    nameSize: 25,
    nameBold: true,
    uppercase: true,
    rule: 1.4,
    headerRule: 2,
    sectionGap: 8,
    entryGap: 4,
    lineSpacing: 1.12,
    pageMargin: 44,
    sectionStyle: "line",
  },
  compact: {
    label: "Compact Developer",
    align: "left",
    accent: "#244c85",
    fontFamily: "sans",
    nameSize: 21,
    nameBold: true,
    uppercase: true,
    rule: 0.5,
    headerRule: 0,
    sectionGap: 4,
    entryGap: 1.5,
    lineSpacing: 1.02,
    pageMargin: 34,
    sectionStyle: "line",
  },
  classic: {
    label: "Classic",
    align: "center",
    accent: "#272727",
    fontFamily: "serif",
    nameSize: 24,
    nameBold: true,
    uppercase: false,
    rule: 0.45,
    headerRule: 0.8,
    sectionGap: 9,
    entryGap: 5,
    lineSpacing: 1.17,
    pageMargin: 48,
    sectionStyle: "line",
  },
  academic: {
    label: "Academic CV",
    align: "left",
    accent: "#2f4058",
    fontFamily: "serif",
    nameSize: 24,
    nameBold: true,
    uppercase: false,
    rule: 0,
    headerRule: 1,
    sectionGap: 10,
    entryGap: 6,
    lineSpacing: 1.2,
    pageMargin: 50,
    sectionStyle: "underline",
  },
};

const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};

export function resolvedDocumentStyle(model) {
  const base = DOCUMENT_STYLES[model.template] || DOCUMENT_STYLES.modern;
  const fontFamily = FONT_FAMILIES[model.fontFamily] ? model.fontFamily : base.fontFamily;
  const accent = /^#[0-9a-f]{6}$/i.test(model.accentColor || "")
    ? model.accentColor
    : base.accent;
  const sectionStyle = ["line", "underline", "plain"].includes(model.sectionStyle)
    ? model.sectionStyle
    : base.sectionStyle;
  return {
    ...base,
    align: ["left", "center"].includes(model.headerAlign)
      ? model.headerAlign
      : base.align,
    accent,
    fontFamily,
    font: FONT_FAMILIES[fontFamily],
    sectionStyle,
    sectionGap: clamp(model.sectionGap, 0, 24, base.sectionGap),
    entryGap: clamp(model.entryGap, 0, 16, base.entryGap),
    lineSpacing: clamp(model.lineSpacing, 0.9, 2, base.lineSpacing),
    pageMargin: clamp(model.pageMargin, 20, 80, base.pageMargin),
  };
}

export const DESIGN_PRESETS = {
  compact: {
    fontSize: 9.5,
    lineSpacing: 1,
    sectionGap: 3,
    entryGap: 1,
    pageMargin: 32,
  },
  balanced: {
    fontSize: 11,
    lineSpacing: 1.15,
    sectionGap: 7,
    entryGap: 4,
    pageMargin: 44,
  },
  spacious: {
    fontSize: 11.5,
    lineSpacing: 1.35,
    sectionGap: 13,
    entryGap: 8,
    pageMargin: 54,
  },
};
