import React, { useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Sponsors = () => {
  const containerRef = useRef();
  const sliderRef = useRef();
  const sponsors = [
    { name: "MICROSOFT" },
    { name: "STRIPE" },
    { name: "GOOGLE" },
    { name: "AIRBNB" },
    { name: "NOTION" },
    { name: "AMAZON" },
    { name: "TESLA" },
    { name: "META" },
    { name: "ADOBE" },
  ];

  useGSAP(() => {
    const slider = sliderRef.current;
    const totalWidth = slider.scrollWidth;
    gsap.to(slider, {
      x: `-${totalWidth / 2}`, 
      duration: 20,
      ease: "none",
      repeat: -1,
      onReverseComplete: () => {
        gsap.set(slider, { x: 0 });
      }
    });
  }, { scope: containerRef });

  return (
    <section className="bg-[#EFECE3]/20 py-24 overflow-hidden border-y border-black/5" ref={containerRef}>
      <div className="flex flex-col items-center gap-14">
        <p className="text-[#4A70A9]/60 text-xs font-black tracking-[0.4em] uppercase">
          Trusted by Professionals Hired at
        </p>
        
        <div className="relative w-full overflow-hidden flex">
          <div 
            ref={sliderRef}
            className="flex items-center gap-20 whitespace-nowrap"
          >
            {sponsors.map((sponsor, index) => (
              <span 
                key={index} 
                className="text-3xl md:text-4xl font-black text-black hover:text-[#4A70A9] transition-colors cursor-default tracking-tighter"
              >
                {sponsor.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;