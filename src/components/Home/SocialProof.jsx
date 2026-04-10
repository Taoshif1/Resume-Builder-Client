import React from "react";
import { Link } from "react-router";

const SocialProof = () => {
  return (
    <>
      <div className="p-10">
        <div className="bg-[#4A70A9] rounded-2xl p-15">
          <h1 className="text-3xl font-bold lg:text-5xl">
            Ready to build your professional empire?
          </h1>
          <p className="text-black my-5 font-md">
            Join 50,000+ top-tier professionals who have revolutionized their job
search with PersonaCV AI.
          </p>
          <div className="flex gap-3 justify-center items-center">
            <Link
              to="/dashboard"
              style={{ backgroundColor: '#EFECE3' }}
              className="btn btn-sm border-none text-[#4A70A9] rounded-xl px-6 lg:btn-md shadow-md hover:brightness-110 hover:scale-105 transition-all duration-300"
            >
              Book a Demo
            </Link>
            <Link
              to="/dashboard"
              style={{ backgroundColor: '#EFECE3' }}
              className="btn btn-sm border-none text-[#4A70A9] rounded-xl px-6 lg:btn-md shadow-md hover:brightness-110 hover:scale-105 transition-all duration-300"
            >
              Build Resume
            </Link>
          
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialProof;
