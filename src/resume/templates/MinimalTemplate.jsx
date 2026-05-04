const MinimalTemplate = ({ data }) => {
  const {
    personalInfo = {},
    experience = [],
    education = [],
    skills = [],
    projects = [],
  } = data;

  return (
    <div className="bg-white text-black p-14 min-h-[1100px] border border-gray-200">
      {/* Header */}
      <div className="border-b pb-8">
        <h1 className="text-5xl text-black font-bold tracking-tight">
          {personalInfo.fullName}
        </h1>

        <p className="text-gray-500 text-xl mt-2">{personalInfo.title}</p>

        <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-500">
          <span>{personalInfo.email}</span>
          <span>{personalInfo.phone}</span>
          <span>{personalInfo.location}</span>
        </div>
      </div>

      <div className="space-y-10 mt-10">
        {/* Summary */}
        <section>
          <h2 className="text-xl font-bold mb-3">Summary</h2>

          <p className="text-gray-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-xl text-black font-bold mb-3">Skills</h2>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="border border-gray-300 px-4 py-2 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-xl font-bold mb-5">Experience</h2>

          <div className="space-y-6">
            {experience.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{item.role}</h3>

                    <p className="text-gray-600">{item.company}</p>
                  </div>

                  <p className="text-gray-500 text-sm">
                    {item.startDate} - {item.endDate}
                  </p>
                </div>

                <p className="mt-2 text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-xl font-bold mb-5">Projects</h2>

          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{project.title}</h3>

                    <p className="text-gray-600 mt-1">{project.techStack}</p>
                  </div>

                  {project.liveLink && (
                    <a
                      href={project.liveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#4A70A9] underline shrink-0"
                    >
                      Live
                    </a>
                  )}
                </div>

                <p className="mt-2 text-gray-700 leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className="text-xl font-bold mb-5">Education</h2>

          <div className="space-y-4">
            {education.map((item) => (
              <div key={item.id}>
                <h3 className="font-bold">{item.degree}</h3>

                <p className="text-gray-600">{item.institution}</p>

                <p className="text-sm text-gray-500 mt-1">
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

export default MinimalTemplate;
