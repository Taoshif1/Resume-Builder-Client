import React from "react";
import { useState } from "react";
import { registerUser, googleLogin } from "../services/auth";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [photoUrl, setPhotoUrl] = useState("");
  const navigate = useNavigate();


  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error("Error registering.");
      console.error("Error registering:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      toast.success("Google login successful!");
      navigate("/login");
    } catch (error) {
      toast.error("Error with Google login.");
      console.error("Error with Google login:", error);
    }
  };

  return (
    <fieldset className="fieldset">
      <h2 className="text-[20px] mt-3 font-bold">Create Account</h2>
      <p className="text-[#464554] mb-3">
        Start building your professional identity today.
      </p>

      <label className="label  text-[#464554] font-semibold">
        EMAIL ADDRESS
      </label>
      <input
        type="email"
        className="input w-full bg-[#F2F4F6] rounded-xl text-black "
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="label  text-[#464554] font-semibold">PHOTO URL</label>
      <input
        type="text"
        className="input w-full bg-[#F2F4F6] rounded-xl text-black"
        placeholder="Photo Url"
      />

      <label className="label  text-[#464554] font-semibold flex justify-between items-center">
        <span>PASSWORD</span>
      </label>
      <input
        type="password"
        className="input w-full bg-[#F2F4F6] rounded-xl text-black "
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button 
        className="btn rounded-xl bg-gradient-to-r from-[#4648D4] to-[#8127CF] border-none mt-4"
        onClick={handleRegister}
      >
        SignUp
      </button>

      <div className="flex gap-2 mt-4 justify-center items-center">
        <div className="h-px w-[80px] bg-[#767586]"></div>
        <p className="text-[10px] font-semibold text-[#767586]">
          OR CONTINUE WITH
        </p>
        <div className="h-px w-[90px] bg-[#767586]"></div>
      </div>

      <button 
        className="btn border-none bg-[#F2F4F6] rounded-xl flex justify-center items-center gap-3 text-[#191C1E]  mt-4"
        onClick={handleGoogleLogin}
      >
        <img src="/src/assets/google.png" />
        <span>Continue with Google</span>
      </button>

      {/* <p className="text-center mt-1">
        By continuing, you agree to PersonaCV AI's{" "}
        <span className="text-[#4648D4] font-semibold">Terms of Service</span>{" "}
        and{" "}
        <span className="text-[#4648D4] font-semibold">Privacy Policy.</span>
      </p> */}
    </fieldset>
  );
};

export default Register;
