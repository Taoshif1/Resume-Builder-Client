import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const SortableExperienceItem = ({
  item,
  updateExperience,
  removeExperience,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className=" border border-gray-200 rounded-2xl p-4 space-y-3 bg-white w-full max-w-full overflow-hidden"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-sm text-gray-400 font-bold select-none w-fit"
      >
        Drag
      </div>

      <input
        type="text"
        placeholder="Company"
        value={item.company}
        onChange={(e) => updateExperience(item.id, "company", e.target.value)}
        className="input input-bordered w-full bg-white text-black"
      />

      <input
        type="text"
        placeholder="Role"
        value={item.role}
        onChange={(e) => updateExperience(item.id, "role", e.target.value)}
        className="input input-bordered w-full bg-white text-black"
      />

      <button
        onClick={() => removeExperience(item.id)}
        className="btn btn-sm btn-error text-white"
      >
        Remove
      </button>
    </div>
  );
};

export default SortableExperienceItem;
