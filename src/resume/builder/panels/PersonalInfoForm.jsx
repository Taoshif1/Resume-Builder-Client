const PersonalInfoForm = ({ resumeData, setResumeData }) => {
  const updateField = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-bold text-gray-600">Full Name</label>

        <input
          type="text"
          value={resumeData.personalInfo.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          className="input input-bordered w-full bg-white text-black"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-gray-600">
          Professional Title
        </label>

        <input
          type="text"
          value={resumeData.personalInfo.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="input input-bordered w-full bg-white text-black"
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
