import { createWorkspace } from "../../src/resume/data/workspace.js";
export function documentFixture({
  template = "modern",
  documentType = "resume",
  paperSize = "A4",
  fontSize = 11,
  long = false,
  design = {},
} = {}) {
  const w = createWorkspace("fixture-user", () => "document-one");
  Object.assign(w.profile.personalInfo, {
    fullName: "Alex Morgan",
    title: "Full Stack Developer",
    email: "alex@example.test",
    phone: "+1 555 0100",
    location: "Dhaka, Bangladesh",
    summary:
      "Developer building accessible interfaces and reliable services. Combines thoughtful product design with practical engineering to deliver useful software.",
  });
  w.profile.links = [
    { id: "github", label: "GitHub", url: "https://github.com/example" },
    {
      id: "portfolio",
      label: "Portfolio",
      url: "https://example.test/portfolio/" + "long-path/".repeat(15),
    },
  ];
  w.profile.skills = [
    "React",
    "JavaScript",
    "Node.js",
    "PostgreSQL",
    "Accessibility",
    "Git",
  ].map((name, i) => ({ id: `skill-${i}`, name }));
  w.profile.experience = [
    {
      id: "experience-one",
      role: "Full Stack Developer",
      company: "Example Studio",
      startDate: "January 2025",
      endDate: "Present",
      description:
        "Built accessible workflows for 3 product teams.\nReduced response times by 25% through measured query improvements.",
    },
  ];
  w.profile.education = [
    {
      id: "education-one",
      degree: "B.Sc. in Computer Science and Engineering",
      institution: "Example University, Dhaka",
      startDate: "2023",
      endDate: "2027",
    },
    {
      id: "education-two",
      degree: "Higher Secondary Certificate",
      institution: "Example College",
      startDate: "2020",
      endDate: "2022",
    },
  ];
  w.profile.languages = [
    { id: "language-one", title: "Bangla", description: "Native" },
    { id: "language-two", title: "English", description: "Professional" },
  ];
  w.profile.achievements = [
    {
      id: "achievement-one",
      title: "Completed an accessible open-source project",
      description: "Documented keyboard workflows and regression checks.",
    },
  ];
  w.profile.certifications = [
    {
      id: "cert-one",
      title: "Web Accessibility",
      description: "Example Learning Programme, 2025",
    },
  ];
  for (let i = 0; i < (long ? 18 : 2); i++)
    w.projects.push({
      id: `project-${i}`,
      source: "github",
      sourceData: { repoUrl: `https://github.com/example/project-${i}` },
      metadata: {
        role: "Developer",
        startDate: "2025",
        endDate: long
          ? "September 2026 (ongoing maintenance and research)"
          : "2026",
      },
      resumeData: {
        title: i === 0 ? "Career Workspace" : `Community Platform ${i}`,
        techStack: "React, Node.js, Express, PostgreSQL",
        liveLink: `https://example.test/project-${i}/` + "deep/".repeat(15),
        description: long
          ? Array.from(
              { length: 8 },
              (_, j) =>
                `Feature ${j + 1}: ` +
                "Built and tested accessible flows for shared project data. ".repeat(
                  4,
                ),
            ).join("\n")
          : "Built a reusable library of career records.\nAdded keyboard navigation and clear form validation.\nPreserved authored content during source refreshes.",
      },
    });
  const v = w.resumeVariants[0];
  Object.assign(v, {
    template,
    documentType,
    paperSize,
    fontSize,
    ...design,
  });
  for (const [key, records] of Object.entries({
    projectIds: w.projects,
    experienceIds: w.profile.experience,
    educationIds: w.profile.education,
    skillIds: w.profile.skills,
  }))
    v[key] = records.map((r) => r.id);
  return w;
}
