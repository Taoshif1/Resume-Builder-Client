import { useState } from "react";

const SkillsForm = ({ skills, addSkill, removeSkill }) => {
  const [input, setInput] = useState("");

  const handleAddSkill = () => {
    addSkill(input);
    setInput("");
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-black text-black mb-5">Skills</h3>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Add Skill"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input input-bordered flex-1 bg-white text-black"
        />

        <button
          onClick={handleAddSkill}
          className="btn bg-[#4A70A9] text-white border-none"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        {skills.map((skill) => (
          <div
            key={skill}
            className="bg-[#4A70A9]/10 text-[#4A70A9] px-4 py-2 rounded-full flex items-center gap-2"
          >
            <span>{skill}</span>

            <button onClick={() => removeSkill(skill)} className="font-black">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsForm;
