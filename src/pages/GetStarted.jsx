import React from "react";
import { NavLink, Outlet } from "react-router";

const GetStarted = () => {
  return (
    <div className="min-h-screen text-black bg-[#d5d8db]">
      <div className="border-[#d5d8db] border min-h-screen">
        
        <div className="w-[95%] sm:w-[85%] lg:w-[75%] 
                        h-auto lg:h-[550px] 
                        mx-auto mt-5 
                        flex flex-col lg:flex-row 
                        justify-center items-center">
          
          {/* LEFT */}
          <div className="w-full lg:w-[50%] 
                          h-auto lg:h-full 
                          rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none
                          bg-[#f8f9f8] relative flex flex-col">
            
            <div className="h-[200px] sm:h-[250px] lg:h-[76%] relative">
              <img
                className="h-full w-full object-cover 
                           rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
                src="/src/assets/bg-started.png"
              />
            </div>

            <div className="p-3 
                            lg:absolute lg:bottom-9.5 lg:left-0 lg:right-0">
              
              <h2 className="text-[#4648D4] font-bold text-[22px] lg:text-[28px]">
                PersonaCV AI
              </h2>

              <p className="text-[#464554] mb-3 text-[12px] lg:text-[14px]">
                The digital atelier for your professional identity. <br />
                Curated by AI,
                <br />
                designed by you.
              </p>

              <div className="mt-3 bg-[#a69a9a20] rounded-2xl p-2">
                <h4 className="text-[10px] flex items-center gap-2">
                  <img className="w-[11px]" src="/src/assets/Container.png" />
                  <span className="font-semibold text-[#8127CF]">
                    AI INSIGHT
                  </span>
                </h4>

                <p className="mt-1 text-[11px] italic font-semibold text-[#191C1E]">
                  "Your profile strength is in the top 5% of Creative Directors.
                  <br /> Add three more project links to reach 100%."
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-auto 
                          h-auto lg:h-full 
                          bg-[#FFFFFF] 
                          rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none
                          p-4">
            
            <div className="text-black bg-white rounded-box w-full sm:w-xs  p-2 mx-auto">
              
              <ul className="flex w-full sm:w-[240px] mx-auto bg-[#46455410] items-center rounded-4xl justify-around p-2">
                
                <NavLink
                  to="/get-started"
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "text-[#4648D4] font-bold px-4 lg:px-8 py-2 rounded-2xl bg-[#FFFFFF]"
                      : "px-4 lg:px-8 py-2"
                  }
                >
                  Login
                </NavLink>

                <NavLink
                  to="/get-started/register"
                  className={({ isActive }) =>
                    isActive
                      ? "text-[#4648D4] font-bold px-4 lg:px-8 py-2 rounded-2xl bg-[#FFFFFF]"
                      : "px-4 lg:px-8 py-2"
                  }
                >
                  SignUp
                </NavLink>

              </ul>

              <Outlet />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GetStarted;