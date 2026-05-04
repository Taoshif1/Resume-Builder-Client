const EducationForm = ({
  education,
  addEducation,
  updateEducation,
  removeEducation,
}) => {
  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-black text-black">Education</h3>

        <button
          onClick={addEducation}
          className="btn btn-sm bg-[#4A70A9] text-white border-none"
        >
          Add
        </button>
      </div>

      <div className="space-y-6">
        {education.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-2xl p-4 space-y-3"
          >
            <input
              type="text"
              placeholder="Institution"
              value={item.institution}
              onChange={(e) =>
                updateEducation(item.id, "institution", e.target.value)
              }
              className="input input-bordered w-full bg-white text-black"
            />

            <input
              type="text"
              placeholder="Degree"
              value={item.degree}
              onChange={(e) =>
                updateEducation(item.id, "degree", e.target.value)
              }
              className="input input-bordered w-full bg-white text-black"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Start Date"
                value={item.startDate}
                onChange={(e) =>
                  updateEducation(item.id, "startDate", e.target.value)
                }
                className="input input-bordered w-full bg-white text-black"
              />

              <input
                type="text"
                placeholder="End Date"
                value={item.endDate}
                onChange={(e) =>
                  updateEducation(item.id, "endDate", e.target.value)
                }
                className="input input-bordered w-full bg-white text-black"
              />
            </div>

            <button
              onClick={() => removeEducation(item.id)}
              className="btn btn-sm btn-error text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationForm;
