import { Link, NavLink } from "react-router";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const linkStyle = ({ isActive }) =>
    `transition-all duration-300 font-medium ${
      isActive ? "text-[#4A70A9] underline decoration-2 underline-offset-4" : "text-[#000000] hover:text-[#4A70A9]"
    }`;

  return (
    <footer className="bg-[#EFECE3] border-t border-[#8FABD4]/30 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Left Side: Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-[#000000] hover:opacity-80 transition-opacity"
          >
            PERSONA<span className="text-[#4A70A9]">CV</span>
          </Link>
          <p className="text-[#000000]/60 text-sm font-medium">
            © {currentYear} PersonaCV. All rights reserved.
          </p>
        </div>

        {/* Right Side: 4 Links in a row */}
        <nav>
          <ul className="flex flex-wrap justify-center gap-6 md:gap-8">
            <li>
              <NavLink to="/" className={linkStyle}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard" className={linkStyle}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={linkStyle}>
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={linkStyle}>
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

      </div>
    </footer>
  );
};

export default Footer;