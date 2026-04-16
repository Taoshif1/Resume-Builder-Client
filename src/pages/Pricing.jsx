import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const Pricing = () => {
  const containerRef = useRef();
  const sliderRef = useRef();
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: yearly ? "$0" : "$0",
      features: ["1 Resume Build", "Standard Templates", "Basic AI Support"],
      button: "Start Free",
      bg: "bg-[#EFECE3]",
      text: "text-black",
    },
    {
      name: "Professional",
      price: yearly ? "$15" : "$19",
      features: [
        "Unlimited Resumes",
        "Premium Templates",
        "Advanced AI Writer",
        "Priority Support",
      ],
      button: "Upgrade Now",
      bg: "bg-[#4A70A9]",
      text: "text-white",
      popular: true,
    },
    {
      name: "Enterprise",
      price: yearly ? "$39" : "$49",
      features: [
        "Team Access",
        "Custom Branding",
        "API Integration",
        "Dedicated Account Manager",
      ],
      button: "Contact Sales",
      bg: "bg-[#8FABD4]",
      text: "text-black",
    },
    {
      name: "Ultimate",
      price: yearly ? "$79" : "$99",
      features: [
        "Everything in Enterprise",
        "Lifetime Updates",
        "1-on-1 Coaching",
      ],
      button: "Go Elite",
      bg: "bg-black",
      text: "text-white",
      premium: true,
    },
  ];

  useGSAP(
    () => {
      // 1. Entry Animation
      gsap.from(".pricing-card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      const cards = gsap.utils.toArray(".pricing-card");

      // 2. Scroll/Drag Effects
      const updateEffects = () => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const distance = Math.abs(containerCenter - cardCenter);

          // Dynamic focus effect based on center distance
          const opacity = gsap.utils.mapRange(0, 400, 1, 0.6, distance);
          const scaleValue = card.classList.contains("premium-scale") ? 1.1 : 1;
          const scale = gsap.utils.mapRange(0, 400, scaleValue, 0.85, distance);

          gsap.set(card, {
            opacity: opacity,
            scale: scale,
            overwrite: "auto",
          });
        });
      };

      Draggable.create(sliderRef.current, {
        type: "x",
        edgeResistance: 0.8,
        bounds: containerRef.current,
        inertia: true,
        onDrag: updateEffects,
        onThrowUpdate: updateEffects,
        onRelease: updateEffects,
      });

      updateEffects();
      window.addEventListener("resize", updateEffects);
      return () => window.removeEventListener("resize", updateEffects);
    },
    { scope: containerRef },
  );

  return (
    <div
      className="py-24 px-6 bg-[#EFECE3]/30 mb-20 overflow-hidden"
      ref={containerRef}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black lg:text-7xl text-black tracking-tighter">
          Simple, Transparent <span className="glow">Pricing</span>
        </h1>
        <p className="mt-6 text-gray-600 font-semibold text-lg">
          Drag to find your perfect plan.
        </p>
      </div>

      {/* Yearly Toggle */}
      <div className="flex justify-center items-center gap-4 mb-16">
        <span
          className={`font-bold ${!yearly ? "text-black" : "text-gray-400"}`}
        >
          Monthly
        </span>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={yearly}
          onChange={() => setYearly(!yearly)}
        />
        <span
          className={`font-bold ${yearly ? "text-black" : "text-gray-400"}`}
        >
          Yearly
        </span>
        <span className="badge badge-success gap-2 py-3 font-bold">
          Save 20%
        </span>
      </div>

      {/* Slider Wrapper */}
      <div
        ref={sliderRef}
        className="flex gap-10 cursor-grab active:cursor-grabbing w-max px-[10vw]"
      >
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`pricing-card flex-shrink-0 w-[300px] md:w-[400px] h-[550px] ${plan.bg} ${plan.text} p-12 rounded-[50px] shadow-2xl flex flex-col justify-between relative border transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(74,112,169,0.25)] select-none 
            ${plan.premium ? "border-yellow-400 premium-scale" : "border-black/5"}`}
          >
            {plan.popular && (
              <span className="absolute top-4 right-10 bg-black text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                Most Popular
              </span>
            )}

            {plan.premium && (
              <span className="absolute top-4 left-6 bg-yellow-400 text-black text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                Best Value 💎
              </span>
            )}

            <div>
              <h3 className="text-sm font-black mb-6 uppercase tracking-[0.3em] opacity-60">
                {plan.name}
              </h3>
              <h2 className="text-7xl font-black mb-12 flex items-baseline tracking-tighter">
                {plan.price}
                <span className="text-xl font-medium opacity-40 ml-2">
                  /{yearly ? "yr" : "mo"}
                </span>
              </h2>
              <ul className="space-y-6 mb-12">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 font-bold text-sm"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.text === "text-white" ? "bg-white/20" : "bg-black/10"}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="4"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${
                plan.bg === "bg-black" || plan.bg === "bg-[#4A70A9]"
                  ? "bg-white text-black"
                  : "bg-black text-white"
              }`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
