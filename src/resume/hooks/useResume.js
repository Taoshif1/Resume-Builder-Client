import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  createWorkspace,
  newId,
  requireValid,
} from "../data/workspace.js";
import { resolveResume } from "../data/resolveResume.js";
import {
  createLegacyMigrationCandidate,
} from "../data/legacyMigration.js";
import { loadWorkspace, saveWorkspace } from "../storage/workspaceStorage.js";

const emptyResume = {
  template: "modern",
  personalInfo: {
    fullName: "", title: "", email: "", phone: "", location: "", summary: "",
  },
  experience: [], education: [], skills: [], projects: [],
};

export const useResume = ({ storage } = {}) => {
  const { user, loading } = useContext(AuthContext);
  const [workspace, setWorkspace] = useState(null);
  const [migrationCandidate, setMigrationCandidate] = useState(null);
  const [storageError, setStorageError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user?.uid) {
      // Auth transitions must clear the previous account before another can load.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkspace(null);
      setMigrationCandidate(null);
      return;
    }
    try {
      const loaded = loadWorkspace(user.uid, storage);
      const next = loaded ?? createWorkspace(user.uid);
      setWorkspace(next);
      if (!loaded) saveWorkspace(next, storage);
      setMigrationCandidate(createLegacyMigrationCandidate(storage));
      setStorageError(null);
    } catch (error) {
      console.error("Unable to initialize resume workspace.", error);
      setWorkspace(null);
      setMigrationCandidate(null);
      setStorageError(error);
    }
  }, [loading, user?.uid, storage]);

  useEffect(() => {
    if (!workspace || loading || !user?.uid || workspace.ownerUid !== user.uid) return;
    try {
      saveWorkspace(workspace, storage);
    } catch (error) {
      console.error("Unable to persist resume workspace.", error);
      // Surface persistence failure without treating the edit as saved.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError(error);
    }
  }, [workspace, loading, user?.uid, storage]);

  const variant = workspace?.resumeVariants[0];
  const resume = useMemo(
    () => (workspace ? resolveResume(workspace, variant?.id) : emptyResume),
    [workspace, variant?.id],
  );

  const updateWorkspace = (updater) => {
    setWorkspace((current) => (current ? updater(current) : current));
  };
  const updateVariant = (updater) => updateWorkspace((current) => ({
    ...current,
    resumeVariants: current.resumeVariants.map((item, index) =>
      index === 0 ? updater(item) : item),
  }));

  const updatePersonalInfo = (field, value) =>
    updateWorkspace((current) => ({
      ...current,
      profile: {
        ...current.profile,
        personalInfo: { ...current.profile.personalInfo, [field]: value },
      },
    }));
  const updateTemplate = (template) => updateVariant((current) => ({ ...current, template }));

  const addExperience = () => {
    const item = { id: newId(), company: "", role: "", startDate: "", endDate: "", description: "" };
    updateWorkspace((current) => ({
      ...current,
      profile: { ...current.profile, experience: [...current.profile.experience, item] },
    }));
    updateVariant((current) => ({ ...current, experienceIds: [...current.experienceIds, item.id] }));
  };
  const updateExperience = (id, field, value) => updateWorkspace((current) => ({
    ...current,
    profile: {
      ...current.profile,
      experience: current.profile.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item),
    },
  }));
  const removeExperience = (id) => {
    updateWorkspace((current) => ({
      ...current,
      profile: { ...current.profile, experience: current.profile.experience.filter((item) => item.id !== id) },
    }));
    updateVariant((current) => ({
      ...current,
      experienceIds: current.experienceIds.filter((itemId) => itemId !== id),
      overrides: { ...current.overrides, experience: Object.fromEntries(Object.entries(current.overrides.experience).filter(([itemId]) => itemId !== id)) },
    }));
  };
  const reorderExperience = (newOrder) => setWorkspace((current) => {
    if (!current) return current;
    const ids = newOrder.map((item) => item.id);
    return {
      ...current,
      profile: { ...current.profile, experience: newOrder },
      resumeVariants: current.resumeVariants.map((item, index) =>
        index === 0 ? { ...item, experienceIds: ids } : item),
    };
  });

  const addEducation = () => {
    const item = { id: newId(), institution: "", degree: "", startDate: "", endDate: "" };
    updateWorkspace((current) => ({
      ...current,
      profile: { ...current.profile, education: [...current.profile.education, item] },
    }));
    updateVariant((current) => ({ ...current, educationIds: [...current.educationIds, item.id] }));
  };
  const updateEducation = (id, field, value) => updateWorkspace((current) => ({
    ...current,
    profile: { ...current.profile, education: current.profile.education.map((item) =>
      item.id === id ? { ...item, [field]: value } : item) },
  }));
  const removeEducation = (id) => {
    updateWorkspace((current) => ({ ...current, profile: { ...current.profile, education: current.profile.education.filter((item) => item.id !== id) } }));
    updateVariant((current) => ({ ...current, educationIds: current.educationIds.filter((itemId) => itemId !== id) }));
  };

  const addSkill = (skill) => {
    if (!skill.trim()) return;
    const item = { id: newId(), name: skill.trim() };
    updateWorkspace((current) => ({ ...current, profile: { ...current.profile, skills: [...current.profile.skills, item] } }));
    updateVariant((current) => ({ ...current, skillIds: [...current.skillIds, item.id] }));
  };
  const removeSkill = (skill) => {
    const removedIds = new Set(
      workspace?.profile.skills
        .filter((item) => item.name === skill)
        .map((item) => item.id),
    );
    updateWorkspace((current) => ({ ...current, profile: { ...current.profile, skills: current.profile.skills.filter((item) => item.name !== skill) } }));
    updateVariant((current) => ({ ...current, skillIds: current.skillIds.filter((id) => !removedIds.has(id)) }));
  };

  const addProject = () => {
    const item = { id: newId(), source: "manual", sourceData: {}, resumeData: { title: "", techStack: "", liveLink: "", description: "" } };
    updateWorkspace((current) => ({ ...current, projects: [...current.projects, item] }));
    updateVariant((current) => ({ ...current, projectIds: [...current.projectIds, item.id] }));
  };
  const updateProject = (id, field, value) => updateWorkspace((current) => ({
    ...current,
    projects: current.projects.map((project) => project.id === id
      ? { ...project, resumeData: { ...project.resumeData, [field]: value } } : project),
  }));
  const removeProject = (id) => {
    updateWorkspace((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== id) }));
    updateVariant((current) => ({ ...current, projectIds: current.projectIds.filter((itemId) => itemId !== id) }));
  };
  const reorderProjects = (newOrder) => setWorkspace((current) => {
    if (!current) return current;
    const projects = newOrder
      .map((project) => current.projects.find((item) => item.id === project.id))
      .filter(Boolean);
    return {
      ...current,
      projects,
      resumeVariants: current.resumeVariants.map((item, index) =>
        index === 0 ? { ...item, projectIds: projects.map((project) => project.id) } : item),
    };
  });

  const setResume = (nextResume) => {
    const value = typeof nextResume === "function" ? nextResume(resume) : nextResume;
    requireValid(value && value.personalInfo, "Invalid resume update.");
    updateWorkspace((current) => ({
      ...current,
      profile: { ...current.profile, personalInfo: { ...current.profile.personalInfo, ...value.personalInfo } },
    }));
    updateVariant((current) => ({ ...current, template: value.template || current.template }));
  };

  return {
    resume,
    workspace,
    loading,
    authenticated: Boolean(user?.uid) && !loading,
    storageError,
    migrationCandidate,
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
