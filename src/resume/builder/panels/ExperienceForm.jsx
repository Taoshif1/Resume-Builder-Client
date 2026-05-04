import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableExperienceItem from "../../components/sortable/SortableExperienceItem";

const ExperienceForm = ({
  experience,
  addExperience,
  updateExperience,
  removeExperience,
  reorderExperience,
}) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = experience.findIndex((item) => item.id === active.id);

    const newIndex = experience.findIndex((item) => item.id === over.id);

    reorderExperience(arrayMove(experience, oldIndex, newIndex));
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-black text-black">Experience</h3>

        <button
          onClick={addExperience}
          className="btn btn-sm bg-[#4A70A9] text-white border-none"
        >
          Add
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={experience.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {experience.map((item) => (
              <SortableExperienceItem
                key={item.id}
                item={item}
                updateExperience={updateExperience}
                removeExperience={removeExperience}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ExperienceForm;
