import React, { useRef } from "react";
import { Link } from "react-router";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const SocialProof = () => {
  const containerRef = useRef();

  useGSAP(() => {
    gsap.to('.bg-line', {
      rotation: 360, 
      duration: 15, 
      repeat: -1, 
      ease: 'none'
    });
    gsap.from('.content-card', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    });
  }, { scope: containerRef }); 

  return (
    <div ref={containerRef} className="p-10 relative overflow-hidden">
      {/* মেইন কন্টেনার */}
      <div className="content-card bg-[#4A70A9] rounded-2xl p-10 lg:p-20 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="bg-line absolute -top-1/2 -left-1/4 w-full h-[200%] border-[1px] border-[#EFECE3]/20 rounded-[40%]"></div>
          <div className="bg-line absolute -bottom-1/2 -right-1/4 w-full h-[200%] border-[1px] border-[#8FABD4]/30 rounded-[35%]"></div>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="bg-line absolute -top-1/5 -left-1/4 w-full h-[200%] border-[1px] border-[#EFECE3]/20 rounded-[40%]"></div>
          <div className="bg-line absolute -bottom-1/5 -right-1/4 w-full h-[200%] border-[1px] border-[#8FABD4]/30 rounded-[35%]"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold lg:text-5xl text-[#EFECE3]">
            Ready to build your professional empire?
          </h1>
          <p className="text-[#EFECE3]/80 my-5 font-medium max-w-xl mx-auto">
            Join 50,000+ top-tier professionals who have revolutionized their job
            search with PersonaCV AI.
          </p>
          
          <div className="flex gap-4 justify-center items-center mt-8">
            <Link
              to="/dashboard"
              className="btn btn-sm lg:btn-md border-none bg-[#EFECE3] text-[#4A70A9] rounded-xl px-8 shadow-md hover:scale-105 transition-all"
            >
              Book a Demo
            </Link>
            <Link
              to="/dashboard"
              className="btn btn-sm lg:btn-md border-none bg-[#8FABD4] text-white rounded-xl px-8 shadow-md hover:scale-105 transition-all"
            >
              Build Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProof;