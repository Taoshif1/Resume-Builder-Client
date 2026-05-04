const ResumeHeader = ({ resumeData }) => {
  const { personalInfo } = resumeData;

  return (
    <div className="border-b pb-6">
      <h1 className="text-5xl font-black text-gray-900">
        {personalInfo.fullName}
      </h1>

      <p className="text-xl text-[#4A70A9] mt-2 font-medium">
        {personalInfo.title}
      </p>
    </div>
  );
};

export default ResumeHeader;
