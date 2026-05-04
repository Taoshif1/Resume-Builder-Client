import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableProjectItem = ({ project, updateProject, removeProject }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        border border-gray-200 rounded-2xl p-4 bg-white space-y-3
        transition-shadow
        ${isDragging ? "shadow-2xl opacity-80 z-50" : ""}
      `}
    >
      {/* Drag Handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        className="
          cursor-grab active:cursor-grabbing
          text-sm text-gray-400 font-bold
          select-none touch-none
        "
      >
        Drag
      </button>

      <input
        type="text"
        placeholder="Project Title"
        value={project.title}
        onChange={(e) => updateProject(project.id, "title", e.target.value)}
        className="input input-bordered w-full bg-white text-black"
      />

      <input
        type="text"
        placeholder="Tech Stack"
        value={project.techStack}
        onChange={(e) => updateProject(project.id, "techStack", e.target.value)}
        className="input input-bordered w-full bg-white text-black"
      />

      <input
        type="text"
        placeholder="Live Link"
        value={project.liveLink}
        onChange={(e) => updateProject(project.id, "liveLink", e.target.value)}
        className="input input-bordered w-full bg-white text-black"
      />

      <textarea
        placeholder="Description"
        value={project.description}
        onChange={(e) =>
          updateProject(project.id, "description", e.target.value)
        }
        className="textarea textarea-bordered w-full bg-white text-black"
      />

      <button
        onClick={() => removeProject(project.id)}
        className="btn btn-sm btn-error text-white"
      >
        Remove
      </button>
    </div>
  );
};

export default SortableProjectItem;
