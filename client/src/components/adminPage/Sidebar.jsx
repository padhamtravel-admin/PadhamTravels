import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoImg from "@/assets/logo.png";
import ProfileImg from "@/assets/Profile.png";
import {
  ChevronFirst,
  ChevronLast,
  LayoutDashboard,
  Menu,
  X,
  UserCheck,
  Layers,
} from "lucide-react";
import { MdCardTravel } from "react-icons/md";

const SidebarContext = createContext();

export const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Strictly Tour Showcase Focus Navigation items
  const items = [
    {
      icon: <LayoutDashboard size={20} />,
      text: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: <MdCardTravel size={20} />,
      text: "Manage Tours",
      path: "/admin/manage-tours",
    },
    {
      icon: <UserCheck size={20} />,
      text: "Customer Inquiries",
      path: "/admin/manage-inquiries",
    },
    {
      icon: <Layers size={20} />,
      text: "Hero Carousel",
      path: "/admin/manage-carousel",
    },
  ];

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${baseUrl}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (data.status && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("SIDEBAR FETCH ME ERROR:", err);
      }
    };

    fetchMe();
  }, []);

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON --- */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-4 z-40 p-2 bg-slate-900 text-white rounded-xl shadow-md md:hidden hover:bg-slate-800 transition"
      >
        <Menu size={22} />
      </button>

      {/* --- MOBILE OVERLAY --- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* --- SIDEBAR CONTAINER (Clean Crisp White Light Theme) --- */}
      <aside
        className={`
          h-screen bg-white border-r border-slate-200/80 shadow-xs transition-all duration-300 ease-in-out z-50
          fixed top-0 left-0 md:relative 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        <nav className="h-full flex flex-col justify-between">
          <div>
            {/* HEADER */}
            <div className="p-4 pb-3 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={LogoImg}
                  className={`overflow-hidden transition-all object-contain ${
                    expanded ? "w-16" : "w-0"
                  }`}
                  alt="Logo"
                />
                {expanded && (
                  <span className="font-extrabold text-sm tracking-tight text-slate-800 truncate">
                    Admin Portal
                  </span>
                )}
              </div>

              {/* Desktop: Collapse/Expand Button */}
              <button
                onClick={() => setExpanded((curr) => !curr)}
                className="hidden md:block p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                {expanded ? <ChevronFirst size={18} /> : <ChevronLast size={18} />}
              </button>

              {/* Mobile: Close 'X' Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* MENU ITEMS */}
            <SidebarContext.Provider value={{ expanded }}>
              <ul className="flex-1 px-2.5 py-4 space-y-1.5">
                {items.map((item) => (
                  <SidebarItem
                    key={item.text}
                    icon={item.icon}
                    text={item.text}
                    active={location.pathname === item.path}
                    onClick={() => {
                      if (item.path) navigate(item.path);
                      setMobileOpen(false);
                    }}
                  />
                ))}
              </ul>
            </SidebarContext.Provider>
          </div>

          {/* FOOTER (USER PROFILE) */}
          <div className="border-t border-slate-100 bg-slate-50/60 p-3.5 flex items-center">
            <img
              src={ProfileImg}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
              alt="Profile"
            />
            <div
              className={`flex justify-between items-center overflow-hidden transition-all ${
                expanded ? "w-40 ml-3" : "w-0"
              }`}
            >
              <div className="leading-tight truncate">
                <h4 className="font-bold text-xs text-slate-800 truncate">
                  {user?.name || "Padham Admin"}
                </h4>
                <span className="text-[11px] font-medium text-slate-500 truncate block">
                  {user?.email || "admin@padhamtravels.com"}
                </span>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export function SidebarItem({ icon, text, active, alert, onClick }) {
  const { expanded } = useContext(SidebarContext);
  return (
    <li
      onClick={onClick}
      className={`
        relative flex items-center py-2.5 px-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 group text-sm
        ${
          active
            ? "bg-cyan-50 text-cyan-700 font-bold border-r-4 border-cyan-600 shadow-2xs"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }
      `}
    >
      <div className="flex items-center justify-center shrink-0 w-6 h-6">
        {icon}
      </div>
      <span
        className={`overflow-hidden transition-all whitespace-nowrap ${
          expanded ? "w-40 ml-3 opacity-100" : "w-0 opacity-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2.5 w-2 h-2 rounded-full bg-cyan-500 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {/* Tooltip for collapsed state (Desktop only) */}
      {!expanded && (
        <div
          className={`
            absolute left-full rounded-lg px-3 py-1.5 ml-4
            bg-slate-900 text-white text-xs font-semibold
            invisible opacity-0 -translate-x-2 transition-all whitespace-nowrap 
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            z-50 shadow-md
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}

export default Sidebar;
