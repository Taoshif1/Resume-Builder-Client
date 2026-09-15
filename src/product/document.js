import { resolveResume } from "../resume/data/resolveResume.js";
import { safeUrl } from "./operations.js";

export function resumeDocument(workspace, variantId) {
  const variant = workspace.resumeVariants.find((v) => v.id === variantId);
  if (!variant) throw new Error("Resume not found.");
  const resume = resolveResume(workspace, variantId);
  const p = resume.personalInfo;
  const sections = {
    summary: { title: "Professional Summary", items: [{ text: p.summary }] },
    skills: { title: "Skills", items: [{ text: resume.skills.join(" · ") }] },
    experience: {
      title: "Work Experience",
      items: resume.experience.map((x) => ({
        heading: [x.role, x.company].filter(Boolean).join(" — "),
        dates: [x.startDate, x.endDate].filter(Boolean).join(" – "),
        text: x.description,
      })),
    },
    education: {
      title: "Education",
      items: resume.education.map((x) => ({
        heading: x.degree,
        text: x.institution,
        dates: [x.startDate, x.endDate].filter(Boolean).join(" – "),
      })),
    },
    projects: {
      title: "Projects",
      items: resume.projects.map((x, index) => {
        const project = workspace.projects.find(p => p.id === variant.projectIds[index]);
        const metadata = project?.metadata || {};
        return {
          heading: [x.title, metadata.role].filter(Boolean).join(' - '),
          dates: [metadata.startDate, metadata.endDate].filter(Boolean).join(' - '),
          text: [x.techStack, x.description].filter(Boolean).join("\n"),
          url: safeUrl(x.liveLink) || safeUrl(metadata.githubUrl) || safeUrl(project?.sourceData.repoUrl),
        };
      }),
    },
  };
  for (const [key, title] of Object.entries({
    certifications: "Certifications",
    achievements: "Achievements",
    languages: "Languages",
    volunteering: "Volunteering",
    customSections: "Additional Information",
  }))
    sections[key] = {
      title,
      items: (workspace.profile[key] || []).map((x) => ({
        heading: x.title,
        text: x.description,
      })),
    };
  return {
    name: p.fullName,
    title: p.title,
    contact: [p.email, p.phone, p.location].filter(Boolean).join(" | "),
    links: workspace.profile.links.filter((x) => safeUrl(x.url)),
    paperSize: variant.paperSize || "A4",
    fontSize: variant.fontSize || 11,
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
        items: sections[key].items.filter((x) => x.heading || x.text || x.url),
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
  if (summary.split(/\s+/).length > 100)
    checks.push("Shorten the summary to about 100 words or fewer.");
  if (text.split(/\s+/).length > 1000)
    checks.push("Review length; prioritize the most relevant content.");
  if (
    !document.sections.some(
      (s) =>
        ["projects", "experience"].includes(s.key) &&
        s.items.some((i) => /\d/.test(i.text)),
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
            `${i.heading} ${i.text}`.toLowerCase().includes(w),
          ).length,
        })),
      )
      .filter((i) => i.title && i.matches)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5),
  };
}
export function pdfFilename(name, title) {
  return `${`${name || "resume"}-${title || "PersonaCV"}`
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)}.pdf`;
}
