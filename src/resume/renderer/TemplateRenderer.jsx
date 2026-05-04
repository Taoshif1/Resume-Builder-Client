import ModernTemplate from "../templates/ModernTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";
import CorporateTemplate from "../templates/CorporateTemplate";

const TemplateRenderer = ({ template, data }) => {
  switch (template) {
    case "minimal":
      return <MinimalTemplate data={data} />;

    case "corporate":
      return <CorporateTemplate data={data} />;

    case "modern":
    default:
      return <ModernTemplate data={data} />;
  }
};

export default TemplateRenderer;
