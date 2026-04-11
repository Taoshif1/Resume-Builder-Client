import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Pricing = () => {
  const containerRef = useRef();

  useGSAP(() => {
    // animation for heading and cards
    gsap.from(".pricing-header", {
      y: -30,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
    gsap.from(".pricing-card", {
      y: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2, 
      ease: "power2.out",
      delay: 0.5
    });
  }, { scope: containerRef });

  const plans = [
    {
      name: "Starter",
      price: "$0",
      features: ["1 Resume Build", "Standard Templates", "Basic AI Support"],
      button: "Get Started",
      bg: "bg-[#EFECE3]",
      text: "text-[#000000]",
    },
    {
      name: "Professional",
      price: "$19",
      features: ["Unlimited Resumes", "Premium Templates", "Advanced AI Writer", "Priority Support"],
      button: "Try Pro",
      bg: "bg-[#4A70A9]", 
      text: "text-white",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$49",
      features: ["Team Access", "Custom Branding", "API Integration", "Dedicated Account Manager"],
      button: "Contact Sales",
      bg: "bg-[#8FABD4]",
      text: "text-[#000000]",
    },
  ];

  return (
    <div ref={containerRef} className="py-20 px-6 bg-[#EFECE3]/30 mb-20">
      {/* Header */}
      <div className="pricing-header text-center ">
        <h1 className="text-4xl font-black lg:text-6xl text-black tracking-tighter">
          Simple, Transparent <span className="text-[#4A70A9]">Pricing</span>
        </h1>
        <p className="mt-4 text-[#4A70A9] font-medium">Choose the plan that fits your career goals.</p>
      </div>

      {/* Pricing Cards Container */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`pricing-card ${plan.bg} ${plan.text} p-8 rounded-3xl shadow-xl flex flex-col justify-between relative transition-transform hover:scale-105 duration-300 border border-black/5`}
          >
            {plan.popular && (
              <span className="absolute top-4 right-4 bg-[#000000] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                Most Popular
              </span>
            )}
            
            <div>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-widest">{plan.name}</h3>
              <h2 className="text-5xl font-black mb-6">{plan.price}<span className="text-lg font-normal">/mo</span></h2>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 font-medium opacity-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
              plan.popular ? "bg-[#EFECE3] text-[#4A70A9]" : "bg-[#000000] text-white"
            }`}>
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;