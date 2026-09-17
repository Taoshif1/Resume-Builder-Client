import { VscSparkle, VscGraph, VscRepo } from "react-icons/vsc";

const features = [
  {
    icon: <VscSparkle />,
    title: "Resume variants",
    desc: "Choose content from your master profile and tailor it to each opportunity.",
  },
  {
    icon: <VscGraph />,
    title: "Resume checks",
    desc: "Review editorial guidance and ATS-friendly formatting. Pro adds keyword comparison, without a hiring score.",
  },
  {
    icon: <VscRepo />,
    title: "Career Vault",
    desc: "Store and reuse your entire career history in one place.",
  },
];

const CoreFeatures = () => {
  return (
    <section className="grid md:grid-cols-3 gap-8 px-6">
      {features.map((f, i) => (
        <div
          key={i}
          className="bg-white p-8 rounded-3xl shadow-lg hover:scale-105 transition-all"
        >
          <div className="text-3xl text-[#4A70A9] mb-4">{f.icon}</div>
          <h3 className="text-xl font-bold text-black">{f.title}</h3>
          <p className="text-gray-600 mt-3">{f.desc}</p>
        </div>
      ))}
    </section>
  );
};

export default CoreFeatures;
