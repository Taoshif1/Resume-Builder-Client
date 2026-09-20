import { resolveResume } from "../resume/data/resolveResume.js";
import { safeUrl } from "./operations.js";

function readableLink(label, value) {
  const url = safeUrl(value);
  if (!url) return null;
  const host = new URL(url).hostname.replace(/^www\./, "");
  const requestedLabel = label?.trim() || "";
  const normalizedLabel = requestedLabel.toLowerCase();
  const displayLabel =
    host === "github.com" || normalizedLabel.includes("github")
      ? "GitHub"
      : host.endsWith("linkedin.com") || normalizedLabel.includes("linkedin")
        ? "LinkedIn"
        : requestedLabel || host;
  return { label: displayLabel, url };
}
function uniqueLinks(links) {
  const seen = new Set();
  return links.filter(Boolean).filter((link) => {
    const key = link.url.replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
// Preserve authored prose; only explicit bullets or multiple authored lines become a list.
export function authoredContent(value = "") {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bullet = /^\s*(?:[\u2022*-]|\d+[.)])\s+/;
  return lines.length > 1 || lines.some((line) => bullet.test(line))
    ? { bullets: lines.map((line) => line.replace(bullet, "")), text: "" }
    : { text: value, bullets: [] };
}
export function resumeDocument(workspace, variantId) {
  const variant = workspace.resumeVariants.find((v) => v.id === variantId);
  if (!variant) throw new Error("Document not found.");
  const resume = resolveResume(workspace, variantId);
  const p = resume.personalInfo;
  const sections = {
    summary: {
      title:
        variant.template === "modern"
          ? "Career Objective"
          : "Professional Summary",
      items: [{ text: p.summary, source: { type: "personal", field: "summary" } }],
    },
    skills: { title: "Skills", items: [{ text: resume.skills.join(" | ") }] },
    experience: {
      title: "Experience",
      items: resume.experience.map((x, index) => ({
        sourceId: variant.experienceIds[index],
        sourceCollection: "experience",
        heading: x.role,
        subheading: x.company,
        dates: [x.startDate, x.endDate].filter(Boolean).join(" \u2013 "),
        ...authoredContent(x.description),
      })),
    },
    education: {
      title: "Education",
      items: resume.education.map((x, index) => ({
        sourceId: variant.educationIds[index],
        sourceCollection: "education",
        heading: x.degree,
        subheading: x.institution,
        dates: [x.startDate, x.endDate].filter(Boolean).join(" \u2013 "),
      })),
    },
    projects: {
      title: "Projects",
      items: resume.projects.map((x, index) => {
        const project = workspace.projects.find(
          (p) => p.id === variant.projectIds[index],
        );
        const metadata = project?.metadata || {};
        return {
          sourceId: variant.projectIds[index],
          sourceCollection: "projects",
          heading: [x.title, metadata.role].filter(Boolean).join(" \u2014 "),
          dates: [metadata.startDate, metadata.endDate]
            .filter(Boolean)
            .join(" \u2013 "),
          ...authoredContent(x.description),
          tech: x.techStack,
          links: uniqueLinks([
            readableLink(
              "GitHub",
              safeUrl(metadata.githubUrl) || project?.sourceData.repoUrl,
            ),
            readableLink("Live", x.liveLink),
          ]),
        };
      }),
    },
  };
  for (const [key, title] of Object.entries({
    certifications: "Certifications",
    achievements: "Achievements",
    volunteering: "Volunteering",
    customSections: "Additional Information",
  })) {
    sections[key] = {
      title,
      items: (workspace.profile[key] || []).map((x) =>
        key === "achievements"
          ? {
              bullets: [
                x.title,
                ...authoredContent(x.description).bullets,
                authoredContent(x.description).text,
              ].filter(Boolean),
            }
          : { heading: x.title, ...authoredContent(x.description) },
      ),
    };
  }
  sections.languages = {
    title: "Languages",
    items: [
      {
        text: (workspace.profile.languages || [])
          .map((x) => [x.title, x.description].filter(Boolean).join(": "))
          .join(" | "),
      },
    ],
  };
  return {
    documentType: variant.documentType || "resume",
    name: p.fullName,
    title: p.title,
    personalInfo: p,
    contact: [p.location, p.phone, p.email].filter(Boolean).join(" | "),
    links: uniqueLinks(
      workspace.profile.links.map((x) => readableLink(x.label, x.url)),
    ),
    paperSize: variant.paperSize || "A4",
    fontSize: variant.fontSize || 11,
    fontFamily: variant.fontFamily,
    lineSpacing: variant.lineSpacing,
    sectionGap: variant.sectionGap,
    entryGap: variant.entryGap,
    pageMargin: variant.pageMargin,
    accentColor: variant.accentColor,
    headerAlign: variant.headerAlign,
    sectionStyle: variant.sectionStyle,
    template: variant.template,
    sections: [
      ...variant.sectionOrder,
      "certifications",
      "achievements",
      "languages",
      "volunteering",
      "customSections",
    ]
      .filter((key) => !variant.hiddenSections?.includes(key))
      .map((key) => ({
        ...sections[key],
        key,
        items: sections[key].items.filter(
          (x) =>
            x.heading ||
            x.subheading ||
            x.dates ||
            x.text ||
            x.bullets?.length ||
            x.links?.length ||
            x.tech,
        ),
      }))
      .filter((x) => x.items.length),
  };
}
export function qualityChecks(document) {
  const text = JSON.stringify(document);
  const checks = [];
  if (!document.name) checks.push("Add your full name.");
  if (!document.contact.includes("@")) checks.push("Add a contact email.");
  if (!document.sections.some((s) => s.key === "skills"))
    checks.push("Select relevant skills.");
  const summary =
    document.sections.find((s) => s.key === "summary")?.items[0]?.text || "";
  if (document.documentType !== "cv") {
    if (summary.split(/\s+/).length > 100)
      checks.push("Shorten the summary to about 100 words or fewer.");
    if (text.split(/\s+/).length > 1000)
      checks.push("Review length; prioritize the most relevant content.");
  }
  if (
    !document.sections.some(
      (s) =>
        ["projects", "experience"].includes(s.key) &&
        s.items.some((i) =>
          /\d/.test([i.text, ...(i.bullets || [])].join(" ")),
        ),
    )
  )
    checks.push("Include measurable results where you can substantiate them.");
  if (
    !document.sections.some(
      (s) => s.key === "experience" || s.key === "projects",
    )
  )
    checks.push("Select projects or experience to demonstrate your skills.");
  return checks;
}
const stopwords = new Set(
  "with that this from your have will team work about their they skills experience required role years using ability strong knowledge preferred must and the for are you our can".split(
    " ",
  ),
);
export function matchJob(document, description) {
  const terms = [
    ...new Set(
      (description.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || []).filter(
        (w) => !stopwords.has(w),
      ),
    ),
  ].slice(0, 100);
  const content = JSON.stringify(document).toLowerCase();
  return {
    matched: terms.filter((w) => content.includes(w)),
    missing: terms.filter((w) => !content.includes(w)),
    hints: document.sections
      .flatMap((s) =>
        s.items.map((i) => ({
          title: i.heading,
          matches: terms.filter((w) =>
            JSON.stringify(i).toLowerCase().includes(w),
          ).length,
        })),
      )
      .filter((i) => i.title && i.matches)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5),
  };
}
export function pdfFilename(name, title, documentType = "resume") {
  const stem = `${name || "PersonaCV"}-${title || (documentType === "cv" ? "CV" : "Resume")}`;
  const safe = stem
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename =
    documentType === "cv"
      ? safe.replace(/-CV$/i, "").slice(0, 96).replace(/-+$/g, "") + "-CV"
      : safe.slice(0, 100);
  return `${filename}.pdf`;
}
