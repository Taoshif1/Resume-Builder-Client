import React from "react";

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            {title}
          </p>
          <h2 className="text-3xl font-black text-black mt-1">{value}</h2>
        </div>
        {icon && (
          <div className="text-[#4A70A9] text-xl opacity-80">{icon}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
