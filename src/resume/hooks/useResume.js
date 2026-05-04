import { useState, useEffect } from "react";
import { defaultResume } from "../data/defaultResume";

const getInitialResume = () => {
  const savedResume = localStorage.getItem("resume-data");
  try {
    return savedResume
      ? {
          ...defaultResume,
          ...JSON.parse(savedResume),
        }
      : defaultResume;
  } catch (error) {
    console.error("Error parsing local storage", error);
    return defaultResume;
  }
};

export const useResume = () => {
  const [resume, setResume] = useState(getInitialResume);

  useEffect(() => {
    localStorage.setItem("resume-data", JSON.stringify(resume));
  }, [resume]);

  // ===============================
  // PERSONAL INFO
  // ===============================

  const updatePersonalInfo = (field, value) => {
    setResume((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  // ===============================
  // TEMPLATE
  // ===============================

  const updateTemplate = (template) => {
    setResume((prev) => ({
      ...prev,
      template,
    }));
  };

  // ===============================
  // EXPERIENCE
  // ===============================

  const addExperience = () => {
    const newExperience = {
      id: crypto.randomUUID(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    };

    setResume((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  };

  const updateExperience = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeExperience = (id) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  const reorderExperience = (newOrder) => {
    setResume((prev) => ({
      ...prev,
      experience: newOrder,
    }));
  };

  // ===============================
  // EDUCATION
  // ===============================

  const addEducation = () => {
    const newEducation = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      startDate: "",
      endDate: "",
    };

    setResume((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  };

  const updateEducation = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeEducation = (id) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  // ===============================
  // SKILLS
  // ===============================

  const addSkill = (skill) => {
    if (!skill.trim()) return;

    setResume((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
  };

  const removeSkill = (skillToRemove) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // ===============================
  // PROJECTS
  // ===============================

  const addProject = () => {
    const newProject = {
      id: crypto.randomUUID(),
      title: "",
      techStack: "",
      liveLink: "",
      description: "",
    };

    setResume((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const updateProject = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project,
      ),
    }));
  };

  const removeProject = (id) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }));
  };

  const reorderProjects = (newOrder) => {
    setResume((prev) => ({
      ...prev,
      projects: newOrder,
    }));
  };

  return {
    resume,
    setResume,

    updatePersonalInfo,
    updateTemplate,

    addExperience,
    updateExperience,
    removeExperience,
    reorderExperience,

    addEducation,
    updateEducation,
    removeEducation,

    addSkill,
    removeSkill,

    addProject,
    updateProject,
    removeProject,
    reorderProjects,
  };
};
