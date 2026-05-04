const ModernTemplate = ({ data }) => {
  const {
    personalInfo = {},
    experience = [],
    education = [],
    skills = [],
    projects = [],
  } = data;
  return (
    <div className="bg-white text-black rounded-3xl shadow-xl overflow-hidden min-h-[1100px]">
      {/* Header */}
      <div className="bg-[#4A70A9] text-white p-10">
        <h1 className="text-5xl font-black tracking-tight">
          {personalInfo.fullName}
        </h1>

        <p className="text-xl mt-2 opacity-90">{personalInfo.title}</p>

        <div className="flex flex-wrap gap-4 mt-6 text-sm opacity-80">
          <span>{personalInfo.email}</span>
          <span>{personalInfo.phone}</span>
          <span>{personalInfo.location}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-10 space-y-10">
        {/* Summary */}
        <section>
          <h2 className="text-[#4A70A9] text-xl font-black uppercase mb-3">
            Professional Summary
          </h2>

          <p className="text-gray-600 leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-[#4A70A9] text-xl font-black uppercase mb-4">
            Skills
          </h2>

          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-[#4A70A9]/10 text-[#4A70A9] px-4 py-2 rounded-full text-sm font-bold"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-[#4A70A9] text-xl font-black uppercase mb-5">
            Experience
          </h2>

          <div className="space-y-6">
            {experience.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black">{item.role}</h3>

                    <p className="text-[#4A70A9] font-semibold">
                      {item.company}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    {item.startDate} - {item.endDate}
                  </p>
                </div>

                <p className="mt-3 text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section>
          <h2 className=" text-xl text-[#4A70A9] font-bold uppercase mb-5">Projects</h2>

          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black">{project.title}</h3>

                    <p className="text-[#4A70A9] font-medium">
                      {project.techStack}
                    </p>
                  </div>

                  {project.liveLink && (
                    <a
                      href={project.liveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#4A70A9] underline"
                    >
                      Live
                    </a>
                  )}
                </div>

                <p className="mt-2 text-gray-600">{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className="text-[#4A70A9] text-xl font-black uppercase mb-5">
            Education
          </h2>

          <div className="space-y-4">
            {education.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-black">{item.degree}</h3>

                  <p className="text-[#4A70A9]">{item.institution}</p>
                </div>

                <p className="text-sm text-gray-500">
                  {item.startDate} - {item.endDate}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ModernTemplate;
