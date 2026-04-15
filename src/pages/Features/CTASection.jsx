import { Link } from "react-router";

const CTASection = () => {
  return (
    <section className="text-center py-20">
      <h2 className="text-4xl font-bold text-black">
        Ready to upgrade your career?
      </h2>

      <Link
        to="/get-started"
        className="btn mt-6 bg-[#4A70A9] text-white px-8 rounded-xl"
      >
        Get Started Free
      </Link>
    </section>
  );
};

export default CTASection;
