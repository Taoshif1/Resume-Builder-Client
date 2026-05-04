import React from "react";
import { NavLink, Outlet, Link } from "react-router";
import bgStarted from "../assets/bg-started.png";
import googleLogo from "../assets/google.png";

const GetStarted = () => {
  return (
    // মেইন কন্টেইনার
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#d5d8db] py-8 px-4">
      {/* Back Button Container */}
      <div className="w-full max-w-5xl mb-4 flex justify-start">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-[#4648D4] font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-white/50"
        >
          {/* Back Arrow SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* মূল কার্ড */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden min-h-[550px]">
        {/* LEFT SIDE (Image & Info) */}
        <div className="w-full lg:w-1/2 bg-[#f8f9f8] relative flex flex-col">
          <div className="h-[250px] lg:h-[70%] w-full">
            <img
              className="h-full w-full object-cover"
              src={bgStarted}
              alt="Background"
            />
          </div>

          {/* Text Content */}
          <div className="p-6 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:bg-gradient-to-t lg:from-[#f8f9f8] lg:via-[#f8f9f8] lg:to-transparent lg:pt-12">
            <h2 className="text-[#4648D4] font-bold text-[22px] lg:text-[28px]">
              PersonaCV AI
            </h2>
            <p className="text-[#464554] mt-1 mb-4 text-[13px] lg:text-[14px]">
              The digital atelier for your professional identity. <br />
              Curated by AI, designed by you.
            </p>

            <div className="bg-[#a69a9a20] rounded-xl p-3 backdrop-blur-sm">
              <h4 className="text-[10px] flex items-center gap-2">
                <img
                  className="w-[12px]"
                  src={googleLogo}
                  alt="Icon"
                />
                <span className="font-bold text-[#8127CF] tracking-wide">
                  AI INSIGHT
                </span>
              </h4>
              <p className="mt-2 text-[11px] italic font-medium text-[#191C1E]">
                "Your profile strength is in the top 5% of Creative Directors.
                <br /> Add three more project links to reach 100%."
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Tabs & Form Outlet) */}
        <div className="w-full lg:w-1/2 bg-white p-6 sm:p-8 flex flex-col items-center">
          {/* Toggle Tabs */}
          <div className="w-full max-w-sm mb-6">
            <ul className="flex w-full bg-[#F2F4F6] items-center rounded-full justify-between p-1">
              <NavLink
                to="/get-started"
                end
                className={({ isActive }) =>
                  `w-1/2 text-center py-2.5 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? "text-[#4648D4] bg-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/get-started/register"
                className={({ isActive }) =>
                  `w-1/2 text-center py-2.5 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? "text-[#4648D4] bg-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`
                }
              >
                SignUp
              </NavLink>
            </ul>
          </div>

          {/* Form Outlet */}
          <div className="w-full max-w-sm flex-1 flex flex-col justify-center">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
