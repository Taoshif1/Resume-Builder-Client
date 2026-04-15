const steps = [
  "Add your career details",
  "Select job role",
  "AI generates optimized resume",
  "Apply with confidence 🚀",
];

const Workflow = () => {
  return (
    <section className="text-center">
      <h2 className="text-4xl font-bold text-black mb-12">How It Works</h2>

      <div className="flex flex-col md:flex-row justify-center gap-8">
        {steps.map((step, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-md">
            <p className="font-semibold text-gray-700">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Workflow;
