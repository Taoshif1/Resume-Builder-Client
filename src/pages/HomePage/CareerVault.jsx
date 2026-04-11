import React from 'react';
import { VscShield, VscServerProcess, VscCloudDownload } from "react-icons/vsc";

const CareerVault = () => {
  const vaultFeatures = [
    {
      icon: <VscShield className="text-3xl text-[#4A70A9]" />, // মেইন কালার আইকন
      title: "Immutable Identity",
      description: "Encrypted storage for your entire career history. No data loss, ever."
    },
    {
      icon: <VscServerProcess className="text-3xl text-[#4A70A9]" />,
      title: "Dynamic Linking",
      description: "Connect results to specific skills. The AI learns which stories win interviews."
    },
    {
      icon: <VscCloudDownload className="text-3xl text-[#4A70A9]" />,
      title: "Auto-Update",
      description: "Sync with LinkedIn or GitHub to automatically ingest new accomplishments."
    }
  ];

  return (
    <section className="bg-[#EFECE3]/20 py-24 px-6 md:px-12 flex flex-col items-center">
      <div className="text-center mb-16 max-w-2xl">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-black tracking-tighter leading-tight">
          The Career Vault: <span className="text-[#4A70A9]">Your Single Source of Truth</span>
        </h2>
        <p className="text-gray-600 mt-6 text-lg leading-relaxed font-medium">
          A repository that grows with your career. Store project details, obscure skills, and key results once. Never hunt for bullet points again.
        </p>
      </div>

      {/* (Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        {vaultFeatures.map((feature, index) => (
          <div 
            key={index}
            className="bg-[#DCE2F7] rounded-3xl p-10 shadow-lg border border-white/40 flex flex-col gap-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
          >
            {/*icon*/}
            <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center shadow-inner border border-white/20">
              {feature.icon}
            </div>

            {/*content */}
            <div className="space-y-3 text-left">
              <h4 className="text-2xl font-bold text-black tracking-tight leading-snug">
                {feature.title}
              </h4>
              <p className="text-gray-700 text-base leading-relaxed font-medium opacity-90">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

export default CareerVault;