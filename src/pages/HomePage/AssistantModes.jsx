import { Link } from "react-router";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import assistant from '../../assets/aisistant.jpg'

const AsistantModes = () => {
  const container = useRef();

  useGSAP(() => {
    // সেকশন লোডিং অ্যানিমেশন
    gsap.from(".canvas-card", {
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.3,
      ease: "power3.out"
    });
  }, { scope: container });

  return (
    <div ref={container} className="bg-[#EFECE3]/20 py-20 px-6 min-h-screen flex flex-col items-center">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">The Persona Canvas</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Watch your CV morph in real-time as you switch between job roles. Our split-screen builder lets you see the magic as it happens.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-[#DCE2F7] rounded-[40px] p-8 lg:p-12 w-full max-w-6xl shadow-2xl border border-white/20 relative overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Side: Persona Selection */}
          <div className="canvas-card bg-white rounded-3xl p-8 shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-800">Persona Selection</h3>
              <span className="bg-[#4A70A9]/10 text-[#4A70A9] text-[10px] font-bold px-3 py-1 rounded-full uppercase">Illustrative example</span>
            </div>

            <div className="space-y-4">
              {/* Creative Lead Option */}
              <div className="flex items-center justify-between p-4 bg-[#4A70A9] text-white rounded-xl ">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="font-semibold text-sm">Creative Lead Role</span>
                </div>
              </div>

              {/* Startup Founder Option */}
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl  hover:bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <span className="font-semibold text-sm text-gray-500">Startup Founder Role</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-600">Illustrative resume content. In your workspace, paste a job description to compare existing skills on Pro.</p>
            <Link to="/dashboard/resumes" className="block w-full mt-6 bg-[#4A70A9] text-white py-4 rounded-xl font-bold">Open your resume workspace</Link>
          </div>

          {/* Right Side: Preview Section */}
          <div className="canvas-card bg-white rounded-3xl p-8 shadow-lg">
             <div className="flex items-center gap-4 mb-8">
                <img 
                    src={assistant}
                    alt="profile" 
                    className="w-16 h-16 rounded-2xl object-cover"
                />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Alex Rivera</h2>
                    <p className="text-xs font-bold text-[#4A70A9]">Creative Lead & Brand Strategist</p>
                </div>
             </div>

             <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-[2px] w-8 bg-[#4A70A9]"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Summary</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Visionary design leader with 8+ years experience scaling creative teams for Fortune 500 tech companies. Specialized in bridging the gap between high-level brand strategy and engineering feasibility.
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="bg-gray-50 p-6 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Review guidance</span>
                    <h4 className="text-3xl font-bold text-[#4A70A9]">Review</h4>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Target role</span>
                    <h4 className="text-3xl font-bold text-[#4A70A9]">Selected</h4>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AsistantModes;