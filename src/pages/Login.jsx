import React from "react";

const Login = () => {
  return (
    <fieldset className="fieldset">
      <h2 className="text-[20px] mt-3 font-bold text-[#191C1E]">Welcome Back</h2>
      <p className="text-[#464554]">
        Please enter your details to access your dashboard.
      </p>

      <label className="label mt-4 text-[#464554] font-semibold">
        EMAIL ADDRESS
      </label>
      <input
        type="email"
        className="input w-full text-black bg-[#F2F4F6] rounded-xl"
        placeholder="Email"
      />

      <label className="label mt-4 text-[#464554] font-semibold flex justify-between items-center">
        <span>PASSWORD</span>
        <span className="text-[#4648D4] cursor-pointer hover:underline">FORGET</span>
      </label>
      <input
        type="password"
        className="input w-full text-black bg-[#F2F4F6] rounded-xl"
        placeholder="Password"
      />

      <button className="btn bg-gradient-to-r from-[#4648D4] to-[#8127CF] text-white rounded-xl border-none mt-4">
        Login
      </button>

      <div className="flex gap-2 mt-4 justify-center items-center">
        <div className="h-px w-[80px] bg-[#767586]"></div>
        <p className="text-[10px] font-semibold text-[#767586]">
          OR CONTINUE WITH
        </p>
        <div className="h-px w-[90px] bg-[#767586]"></div>
      </div>

      <button className="btn rounded-xl border-none bg-[#F2F4F6] flex justify-center items-center gap-3 text-[#191C1E] mt-4">
        <img src="/src/assets/google.png" alt="Google" />
        <span>Continue with Google</span>
      </button>

      {/* এখানে কালার এবং হোভার ইফেক্ট ঠিক করা হয়েছে */}
      <p className="text-center mt-4 text-sm text-[#464554]">
        By continuing, you agree to PersonaCV AI's{" "}
        <span className="text-[#8127CF] font-bold cursor-pointer hover:underline">Terms of Service</span>{" "}
        and{" "}
        <span className="text-[#8127CF] font-bold cursor-pointer hover:underline">Privacy Policy.</span>
      </p>
    </fieldset>
  );
};

export default Login;