import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableProjectItem from "../../components/sortable/SortableProjectItem";

const ProjectsForm = ({
  projects,
  addProject,
  updateProject,
  removeProject,
  reorderProjects,
}) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((project) => project.id === active.id);

    const newIndex = projects.findIndex((project) => project.id === over.id);

    reorderProjects(arrayMove(projects, oldIndex, newIndex));
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-black text-black">Projects</h3>

        <button
          onClick={addProject}
          className="btn btn-sm bg-[#4A70A9] text-white border-none"
        >
          Add
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={projects.map((project) => project.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {projects.map((project) => (
              <SortableProjectItem
                key={project.id}
                project={project}
                updateProject={updateProject}
                removeProject={removeProject}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ProjectsForm;
