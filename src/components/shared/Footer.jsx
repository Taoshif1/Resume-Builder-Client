import { Link } from "react-router";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // ছবির মতো লিংকগুলোর লিস্ট
  const footerLinks = [
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms of Service", path: "/terms-of-service" },
    { name: "Contact", path: "/contact" },
    { name: "Twitter", path: "#" },
    { name: "LinkedIn", path: "#" },
  ];

  return (
    <footer className="bg-[#fcfcfc] border-t border-gray-100 py-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Left Side: Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          {/* আপনার দেওয়া লোগোটি হুবহু রাখা হয়েছে */}
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-[#000000] hover:opacity-80 transition-opacity"
          >
            PERSONA<span className="text-[#4A70A9]">CV</span>
          </Link>
          <p className="text-[#71717A] text-[14px] font-medium mt-1">
            © {currentYear} PersonaCV AI. All rights reserved.
          </p>
        </div>

        {/* Right Side: Links */}
        <nav>
          <ul className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {footerLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className="text-[#71717A] text-[15px] font-medium hover:text-[#191C1E] transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

      </div>
    </footer>
  );
};

export default Footer;