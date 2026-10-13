import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LogoImg from "@/assets/logo.png";
import { IoPersonCircle } from "react-icons/io5";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { MessageCircle, User as UserIcon } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import Button from "@/components/common/Button";

const MainNavbar = () => {
  const { user, logout } = useAuthUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_NUMBER || "919944229209";

  const navLinks = [
    { path: "/", label: "HOME" },
    { path: "/tours-and-packages", label: "TOURS & PACKAGES" },
    { path: "/terms-and-conditions", label: "BOOKING TERMS" },
    { path: "/about-us", label: "ABOUT US" },
  ];

  const handleLogout = async () => {
    setIsMenuOpen(false);
    navigate("/", { replace: true });
    await logout(navigate);
  };

  const isActive = (path) => {
    if (path === "/terms-and-conditions") {
      return (
        location.pathname === "/terms-and-conditions" ||
        location.pathname === "/booking-terms" ||
        location.pathname === "/terms"
      );
    }
    return location.pathname === path;
  };

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("Hi Padham Travels, I would like to inquire about your tour packages.");
    window.open(`https://wa.me/${whatsappPhone}?text=${text}`, "_blank");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* --- LEFT: LOGO --- */}
        <div className="shrink-0">
          <Link to="/">
            <img
              src={LogoImg}
              alt="Padham Travels"
              className="w-16 lg:w-20 h-auto object-contain"
            />
          </Link>
        </div>

        {/* --- CENTER: DESKTOP NAVIGATION --- */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold tracking-wide transition-all duration-200 py-1 ${
                isActive(link.path)
                  ? "text-cyan-600 border-b-2 border-cyan-500 font-bold"
                  : "text-slate-600 hover:text-cyan-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* --- RIGHT: ACTIONS & AUTH --- */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Admin Portal Quick Link */}
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Admin Portal</span>
                </Link>
              )}

              {/* User Avatar Badge & Name */}
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
                title="View Profile"
              >
                <div className="h-9 w-9 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 font-bold overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                  {user?.name ? user.name[0]?.toUpperCase() : (user?.email ? user.email[0]?.toUpperCase() : <IoPersonCircle size={26} />)}
                </div>
                <span className="font-semibold text-xs text-slate-800 hidden md:block max-w-[100px] truncate group-hover:text-cyan-600">
                  {user?.name || user?.email}
                </span>
              </Link>

              {/* Cyan WhatsApp CTA Button */}
              <Button
                variant="primary"
                size="sm"
                icon={MessageCircle}
                onClick={handleWhatsAppClick}
                className="hidden sm:inline-flex cursor-pointer"
              >
                Inquire Now
              </Button>

              {/* Logout Action Button */}
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="hidden lg:inline-flex cursor-pointer"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={UserIcon}
                onClick={() => navigate("/login")}
                className="cursor-pointer"
              >
                Sign In
              </Button>

              {/* Cyan WhatsApp CTA Button */}
              <Button
                variant="primary"
                size="sm"
                icon={MessageCircle}
                onClick={handleWhatsAppClick}
                className="hidden sm:inline-flex cursor-pointer"
              >
                Inquire Now
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-slate-800 focus:outline-none p-1.5"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN --- */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 flex flex-col py-4 px-6 gap-3 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`py-2 text-sm font-semibold border-b border-slate-100 last:border-none ${
                isActive(link.path) ? "text-cyan-600 font-bold" : "text-slate-700"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth item in mobile menu */}
          {user ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 py-1">
                <div className="h-8 w-8 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 font-bold text-xs">
                  {user?.name ? user.name[0]?.toUpperCase() : (user?.email ? user.email[0]?.toUpperCase() : "U")}
                </div>
                <span className="font-semibold text-sm text-slate-800 truncate">
                  {user?.name || user?.email}
                </span>
              </div>
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-xs font-bold text-cyan-600"
                >
                  <UserIcon size={16} />
                  <span>Admin Portal</span>
                </Link>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-center cursor-pointer mt-1"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-semibold text-slate-700 border-b border-slate-100 hover:text-cyan-600"
            >
              <UserIcon size={18} className="text-slate-500" />
              <span>Sign In</span>
            </Link>
          )}

          <Button
            variant="primary"
            size="md"
            icon={MessageCircle}
            onClick={() => {
              setIsMenuOpen(false);
              handleWhatsAppClick();
            }}
            className="w-full cursor-pointer mt-2"
          >
            Inquire on WhatsApp
          </Button>
        </div>
      )}
    </header>
  );
};

export default MainNavbar;
