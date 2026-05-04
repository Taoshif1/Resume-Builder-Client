import { useResume } from "../hooks/useResume";
import ResumeEditor from "../builder/ResumeEditor";
import TemplateRenderer from "../renderer/TemplateRenderer";
const ResumeBuilder = () => {
  const {
    resume,
    setResume,

    addExperience,
    updateExperience,
    removeExperience,

    addEducation,
    updateEducation,
    removeEducation,
    reorderExperience,

    addSkill,
    removeSkill,

    addProject,
    updateProject,
    removeProject,
    reorderProjects,
  } = useResume();
  return (
    <div className="h-screen overflow-hidden bg-[#F5F7FA] grid grid-cols-12">
      {/* LEFT */}
      <div className="col-span-3 border-r bg-white overflow-hidden">
        <ResumeEditor
          resumeData={resume}
          setResumeData={setResume}
          addExperience={addExperience}
          updateExperience={updateExperience}
          removeExperience={removeExperience}
          addEducation={addEducation}
          updateEducation={updateEducation}
          removeEducation={removeEducation}
          reorderExperience={reorderExperience}
          addSkill={addSkill}
          removeSkill={removeSkill}
          addProject={addProject}
          updateProject={updateProject}
          removeProject={removeProject}
          reorderProjects={reorderProjects}
        />
      </div>
      {/* RIGHT */}
      <div className="col-span-9 overflow-y-auto overflow-x-hidden p-10">
        <TemplateRenderer template={resume.template} data={resume} />
      </div>
    </div>
  );
};
export default ResumeBuilder;
