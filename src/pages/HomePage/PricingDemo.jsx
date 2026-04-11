import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin"; // যদি আপনার কাছে ইনপুট করা থাকে

gsap.registerPlugin(Draggable);

const PricingDemo = () => {
  const containerRef = useRef();
  const sliderRef = useRef();

  const plans = [
    {
      name: "Starter",
      price: "$0",
      features: ["1 Resume Build", "Standard Templates", "Basic AI Support"],
      button: "Get Started",
      bg: "bg-[#EFECE3]",
      text: "text-black",
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
      text: "text-black",
    },
    {
      name: "Ultimate",
      price: "$99",
      features: ["Everything in Enterprise", "Lifetime Updates", "1-on-1 Coaching"],
      button: "Go Ultimate",
      bg: "bg-[#000000]",
      text: "text-white",
    },
  ];

  useGSAP(() => {
    const cards = gsap.utils.toArray(".pricing-card");

    const updateEffects = () => {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        const opacity = gsap.utils.mapRange(0, 400, 1, 0.6, distance);
        const scale = gsap.utils.mapRange(0, 400, 1, 0.85, distance);

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
  }, { scope: containerRef });

  return (
    <div className="py-24 px-6 bg-[#EFECE3]/30 mb-20 overflow-hidden" ref={containerRef}>
      {/* Header */}
      <div className="text-center mb-20">
        <h1 className="text-5xl font-black lg:text-7xl text-black tracking-tighter">
          Simple, Transparent <span className="text-[#4A70A9]">Pricing</span>
        </h1>
        <p className="mt-6 text-[#4A70A9] font-semibold text-lg">Drag to find your perfect plan.</p>
      </div>

      {/* Slider Wrapper */}
      <div 
        ref={sliderRef} 
        className="flex gap-10 cursor-grab active:cursor-grabbing  w-max"
      >
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`pricing-card flex-shrink-0 w-[300px] md:w-[400px] h-[550px] ${plan.bg} ${plan.text} p-12 rounded-[50px] shadow-2xl flex flex-col justify-between relative border border-black/5 select-none`}
          >
            {plan.popular && (
              <span className="absolute top-4 right-10 bg-black text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                Most Popular
              </span>
            )}
            
            <div>
              <h3 className="text-sm font-black mb-6 uppercase tracking-[0.3em] opacity-60">
                {plan.name}
              </h3>
              <h2 className="text-7xl font-black mb-12 flex items-baseline tracking-tighter">
                {plan.price}<span className="text-xl font-medium opacity-40 ml-2">/mo</span>
              </h2>
              <ul className="space-y-6 mb-12">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 font-bold text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${plan.popular ? "bg-white/20" : "bg-black/10"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-90 shadow-xl ${
                plan.popular ? "bg-white text-[#4A70A9]" : "bg-black text-white"
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

export default PricingDemo;