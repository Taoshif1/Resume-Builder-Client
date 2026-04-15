import React from 'react';
import heroIMG from '../../assets/heroIMG.png'
import { HiOutlineUserAdd } from "react-icons/hi"; 
import { VscFileSymlinkFile } from "react-icons/vsc";
import { Link } from 'react-router';

const HeroSection = () => {
  return (
    <section className="bg-[#EFECE3]/30 pt-6 md:pt-4 pb-12 ">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
{/* left side */}
        <div className="space-y-8 max-w-2xl lg:max-w-none">
          <div className="inline-flex items-center gap-2 bg-[#EFECE3] border border-black/10 px-4 py-1.5 rounded-full shadow-inner">
            <span className="text-[#4A70A9] text-xs font-bold tracking-[0.15em] uppercase">
              The Future of Career Identity
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-black tracking-tighter leading-[1.05]">
            Input Once. <br /> Build Many. <span className="text-[#4A70A9]">Tailor</span> Perfectly.
          </h1>

          <p className="text-[#4A70A9]/80 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
            Stop starting from scratch. Your <span className="font-bold text-black">Career Vault</span> centralizes every achievement, skill, and role—ready to be deployed into AI-tailored personas for any job.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <Link className="btn  lg:btn-md border-[#4A70A9] bg-[#EFECE3] text-[#4A70A9] rounded-xl px-8 shadow-md hover:scale-105 transition-all ">
              <HiOutlineUserAdd className="text-2xl" />
              Get Started for Free
            </Link>
            <Link className="btn  lg:btn-md border-[#4A70A9] bg-[#4A70A9] text-[#EFECE3] rounded-xl px-8 shadow-md hover:scale-105 transition-all ">
              <VscFileSymlinkFile className="text-2xl opacity-60" />
              View Templates
            </Link>
          </div>
        </div>

    {/* right side */}
        <div className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center">
          {/* main card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[450px] lg:w-[420px] lg:h-[520px] bg-black/80 rounded-[40px] shadow-2xl overflow-hidden border border-white/10 [transform:rotateX(15deg)_rotateY(-15deg)] transition-transform duration-500 hover:rotate-0">
<div className="absolute inset-0 bg-black/80 rounded-[40px] shadow-2xl overflow-hidden border border-white/10 [transform:rotateX(5deg)] transition-transform duration-500 hover:rotate-0">
  <img 
    src={heroIMG} 
    alt="Hero" 
    className="absolute inset-0 w-full h-full object-cover" 
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
  <div className="absolute bottom-0 left-0 w-full p-5 z-10">
    <div className=" h-1 bg-[#4A70A9] rounded-full mb-6" />
    <h4 className="text-2xl lg:text-3xl font-bold text-white mb-2 mr-22">
      Software Engineer Persona
    </h4>
    <p className="text-white/70 text-sm font-medium tracking-wide mr-10">
      Skills, Projects, & Results
    </p>
  </div>
</div>
            <div className="absolute top-10 right-10 w-24 h-32 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm" />
          </div>
          <div className="absolute -top-10 lg:-top-20 -left-10 w-[180px] h-[220px] bg-white rounded-3xl p-6 shadow-2xl border border-black/5 [transform:translateZ(50px)_rotate(10deg)]">
            <div className="w-10 h-10 bg-[#7E57C2] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-black">AI</span>
            </div>
            <div className="mt-8 space-y-2">
                <div className="w-full h-3 bg-gray-200 rounded-full" />
                <div className="w-[80%] h-3 bg-gray-200 rounded-full opacity-60" />
                <div className="w-[60%] h-3 bg-gray-200 rounded-full opacity-40" />
            </div>
          </div>
          <div className="absolute -bottom-10 lg:-bottom-20 -right-10 w-[200px] h-[250px] bg-white rounded-3xl p-8 shadow-2xl border border-black/5 [transform:translateZ(60px)_rotate(-8deg)]">
             <div className="w-full h-10 bg-[#1A1A1A] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold uppercase tracking-widest">Connect</span>
            </div>
            <div className="mt-10 space-y-3">
                <div className="w-full h-2.5 bg-gray-200 rounded-full" />
                <div className="w-[90%] h-2.5 bg-gray-200 rounded-full opacity-60" />
                <div className="w-[70%] h-2.5 bg-gray-200 rounded-full opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;