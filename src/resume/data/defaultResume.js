export const defaultResume = {
  template: "modern",

  personalInfo: {
    fullName: "John Doe",
    title: "Frontend Developer",
    email: "john@example.com",
    phone: "+880123456789",
    location: "Dhaka, Bangladesh",
    summary:
      "Passionate frontend developer with experience building scalable web applications.",
  },

  experience: [
    {
      id: crypto.randomUUID(),
      company: "Tech Corp",
      role: "Frontend Developer",
      startDate: "2023",
      endDate: "Present",
      description:
        "Built enterprise dashboard systems using React and Tailwind.",
    },
  ],

  projects: [
    {
      id: crypto.randomUUID(),
      title: "AI Resume Builder",
      techStack: "React, Tailwind, Node.js",
      liveLink: "https://yourapp.com",
      description: "Built an AI-powered resume builder with ATS optimization.",
    },
  ],

  education: [
    {
      id: crypto.randomUUID(),
      institution: "East West University",
      degree: "BSc in CSE",
      startDate: "2023",
      endDate: "2027",
    },
  ],

  skills: ["React", "JavaScript", "Tailwind", "Node.js"],
};
