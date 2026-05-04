import PersonalInfoForm from "./panels/PersonalInfoForm";
import ExperienceForm from "./panels/ExperienceForm";
import EducationForm from "./panels/EducationForm";
import SkillsForm from "./panels/SkillsForm";
import ProjectsForm from "./panels/ProjectsForm";

const ResumeEditor = ({
  resumeData,
  setResumeData,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  reorderExperience,
  addSkill,
  removeSkill,
  updateTemplate,
  addProject,
  updateProject,
  removeProject,
  reorderProjects,
}) => {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden p-6 bg-white border-r relative">
      <h2 className="text-2xl font-black text-black mb-6">Resume Editor</h2>

      {/* 1. Template Selection Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Select Resume Design
        </label>
        <select
          value={resumeData.template}
          onChange={(e) => {
            const newTemplate = e.target.value;
            // Update the main state
            setResumeData({ ...resumeData, template: newTemplate });
            // Call the helper function if it exists
            if (updateTemplate) updateTemplate(newTemplate);
          }}
          className="select select-bordered w-full font-medium"
        >
          <option value="modern">Modern Professional</option>
          <option value="minimal">Minimalist Clean</option>
          <option value="corporate">Corporate Executive</option>
        </select>
      </div>

      <hr className="my-6 border-gray-100" />

      {/* 2. Personal Info Section */}
      <PersonalInfoForm resumeData={resumeData} setResumeData={setResumeData} />

      {/* 3. Experience Section */}
      <ExperienceForm
        experience={resumeData.experience}
        addExperience={addExperience}
        updateExperience={updateExperience}
        removeExperience={removeExperience}
        reorderExperience={reorderExperience}
      />

      {/* 4. Projects Section */}
      <ProjectsForm
        projects={resumeData.projects || []}
        addProject={addProject}
        updateProject={updateProject}
        removeProject={removeProject}
        reorderProjects={reorderProjects}
      />

      {/* 5. Education Section */}
      <EducationForm
        education={resumeData.education}
        addEducation={addEducation}
        updateEducation={updateEducation}
        removeEducation={removeEducation}
      />

      {/* 6. Skills Section */}
      <SkillsForm
        skills={resumeData.skills}
        addSkill={addSkill}
        removeSkill={removeSkill}
      />

      {/* Extra padding at bottom for scroll room */}
      <div className="h-5"></div>
    </div>
  );
};

export default ResumeEditor;
