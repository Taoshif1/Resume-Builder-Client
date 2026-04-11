import React from "react";
import PricingDemo from "./HomePage/PricingDemo";
import SocialProof from "./HomePage/SocialProf";
import AsistantModes from "./HomePage/AssistantModes";

const Home = () => {
  return (
    <div className="p-10 text-center">
     <AsistantModes></AsistantModes>
     <PricingDemo></PricingDemo>
     <SocialProof></SocialProof>
    </div>
  );
};

export default Home;
