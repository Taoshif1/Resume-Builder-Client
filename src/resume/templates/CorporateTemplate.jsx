const CorporateTemplate = ({ data }) => {
  const {
    personalInfo = {},
    experience = [],
    education = [],
    skills = [],
    projects = [],
  } = data;

  return (
    <div className="bg-white min-h-[1100px] grid grid-cols-3 shadow-xl overflow-hidden">
      {/* Sidebar */}
      <div className="bg-neutral-900 text-black p-8 space-y-10">
        <div>
          <h1 className="text-4xl text-white leading-tight">
            {personalInfo.fullName}
          </h1>

          <p className="text-gray-300 mt-3">{personalInfo.title}</p>
        </div>

        <section>
          <h2 className="uppercase text-sm tracking-[4px] font-black mb-4 text-[#4A70A9]">
            Contact
          </h2>

          <div className="space-y-3 text-sm text-gray-300">
            <p>{personalInfo.email}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.location}</p>
          </div>
        </section>

        <section>
          <h2 className="uppercase text-sm tracking-[4px] font-black mb-4 text-[#4A70A9]">
            Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-white/10 px-3 py-2 rounded-lg text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Main */}
      <div className="col-span-2 p-10 space-y-10 text-black">
        {/* Summary */}
        <section>
          <h2 className="text-2xl font-black mb-4">Professional Summary</h2>

          <p className="text-gray-600 leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-2xl font-black mb-6">Experience</h2>

          <div className="space-y-8">
            {experience.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black">{item.role}</h3>

                    <p className="text-[#4A70A9] font-semibold mt-1">
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

        {/* Education */}
        <section>
          <h2 className="text-2xl font-black mb-6">Education</h2>

          <div className="space-y-5">
            {education.map((item) => (
              <div key={item.id}>
                <h3 className="font-black text-lg">{item.degree}</h3>

                <p className="text-[#4A70A9]">{item.institution}</p>

                <p className="text-sm text-gray-500 mt-1">
                  {item.startDate} - {item.endDate}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-2xl font-black mb-6">Projects</h2>

          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-black text-lg">{project.title}</h3>

                    <p className="text-[#4A70A9] font-medium mt-1">
                      {project.techStack}
                    </p>
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

                <p className="text-gray-600 mt-3 leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CorporateTemplate;
