import HeroFeatures from "./Features/HeroFeatures";
import CoreFeatures from "./Features/CoreFeatures";
import AIHighlight from "./Features/AIHighlight";
import Workflow from "./Features/Workflow";
import CTASection from "./Features/CTASection";

const Features = () => {
  return (
    <div className="space-y-24">
      <HeroFeatures />
      <CoreFeatures />
      <AIHighlight />
      <Workflow />
      <CTASection />
    </div>
  );
};

export default Features;