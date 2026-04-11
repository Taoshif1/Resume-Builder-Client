import React from "react";
import PricingDemo from "./HomePage/PricingDemo";
import SocialProof from "./HomePage/SocialProf";
import AsistantModes from "./HomePage/AssistantModes";
import CareerVault from "./HomePage/CareerVault";
import Sponsors from "./HomePage/Sponsors";
import HeroSection from "./HomePage/HeroSection";

const Home = () => {
  return (
    <div className="p-10 text-center">
      <HeroSection></HeroSection>
      <Sponsors></Sponsors>
      <CareerVault></CareerVault>
      <AsistantModes></AsistantModes>
      <PricingDemo></PricingDemo>
      <SocialProof></SocialProof>
    </div>
  );
};

export default Home;
