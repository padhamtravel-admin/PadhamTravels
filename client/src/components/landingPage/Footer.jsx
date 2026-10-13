import Logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { BiPhoneCall } from "react-icons/bi";
import { MdEmail } from "react-icons/md";
import { BsFacebook, BsLinkedin } from "react-icons/bs";
import { FaWhatsapp, FaInstagram, FaThreads } from "react-icons/fa6";

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Column 1 - Logo + About */}
          <div className="flex flex-col gap-4">
            <img
              src={Logo}
              alt="Padham Travels logo"
              className="w-36 h-auto mx-auto md:mx-0 brightness-110"
            />
            <p className="text-xs leading-relaxed text-slate-400">
              Padham Travels is your trusted travel showcase platform, offering customized tour packages, spiritual yatras, and international holidays with 24/7 dedicated support.
            </p>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 text-center md:text-left">
                Follow Us
              </p>
              <div className="flex gap-4 items-center justify-center md:justify-start text-lg text-slate-300">
                <a
                  href="https://whatsapp.com/channel/0029VbBqia1Fi8xiWsa9pv1r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  <FaWhatsapp />
                </a>
                <a
                  href="https://www.instagram.com/padham_travels?igsh=dHkxbnB0aHdiZHIz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  <BsFacebook />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  <FaThreads />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  <BsLinkedin />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2 - Get In Touch */}
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-sm text-cyan-400 uppercase tracking-wider">
              Get In Touch
            </h2>
            <div className="flex items-start gap-3">
              <BiPhoneCall size={18} className="mt-1 text-cyan-400 shrink-0" />
              <div>
                <a
                  href="tel:+919944229209"
                  className="text-sm font-semibold hover:text-cyan-400 transition-colors"
                >
                  +91 99442 29209
                </a>
                <p className="text-xs text-slate-400">
                  Call or WhatsApp for package inquiries
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MdEmail size={18} className="mt-1 text-cyan-400 shrink-0" />
              <div>
                <a
                  href="mailto:info@padhamtravel.com"
                  className="text-sm font-semibold hover:text-cyan-400 transition-colors"
                >
                  info@padhamtravel.com
                </a>
                <p className="text-xs text-slate-400">
                  Quick support & lead response
                </p>
              </div>
            </div>
          </div>

          {/* Column 3 - Policies */}
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-sm text-cyan-400 uppercase tracking-wider">
              Policies & Legal
            </h2>
            <nav className="flex flex-col gap-2 text-xs text-slate-400">
              <Link
                to="/terms-and-conditions"
                className="hover:text-cyan-400 transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/terms-and-conditions"
                className="hover:text-cyan-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-and-conditions#section-3"
                className="hover:text-cyan-400 transition-colors"
              >
                Cancellation Policy
              </Link>
            </nav>
          </div>

          {/* Column 4 - Quick Links */}
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-sm text-cyan-400 uppercase tracking-wider">
              Quick Links
            </h2>
            <nav className="flex flex-col gap-2 text-xs text-slate-400">
              <a href="/" className="hover:text-cyan-400 transition-colors">
                Home Showcase
              </a>
              <a
                href="/tours-and-packages"
                className="hover:text-cyan-400 transition-colors"
              >
                Tour Packages
              </a>
              <a
                href="/about-us"
                className="hover:text-cyan-400 transition-colors"
              >
                About Us
              </a>
              <a
                href="/about-us#contact"
                className="hover:text-cyan-400 transition-colors"
              >
                Contact Us
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-slate-800/80 mt-10 pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 <span className="text-cyan-400 font-medium">Padham Travels</span>. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1.5">
            <span>Designed & Developed by</span>
            <Link className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition" to="/developer">
              Vinod Solanki
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
