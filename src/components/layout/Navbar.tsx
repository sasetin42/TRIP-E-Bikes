import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Zap, User, LogOut, LayoutDashboard, Wrench } from "lucide-react";
import QuoteModal from "@/components/features/QuoteModal";
import CustomerAuthModal from "@/components/features/CustomerAuthModal";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import logoMain from "@/assets/logo-main.png";

const NAV_LINKS = [
  { label: "Home", href: "/", settingKey: "nav_home_enabled" },
  { label: "Products", href: "/products", settingKey: "nav_products_enabled" },
  { label: "About", href: "/about", settingKey: "nav_about_enabled" },
  { label: "Blog", href: "/blog", settingKey: "nav_blog_enabled" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, logout } = useCustomerAuth();
  const { settings } = useSystemSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await apiClient.post("/auth.php?action=logout");
    localStorage.removeItem("token");
    logout();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const title = settings?.site_title || "TRIP Mobility";
  const words = title.split(" ");
  const firstWord = words[0] || "TRIP";
  const remainingWords = words.slice(1).join(" ") || "MOBILITY";

  const visibleNavLinks = NAV_LINKS.filter(link => {
    if (!settings) return true;
    return settings[link.settingKey] !== false && settings[link.settingKey] !== "false";
  });

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-black/5 py-1.5 sm:py-2 shadow-sm"
            : "bg-white/80 backdrop-blur-sm py-1.5 sm:py-2"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center justify-between transition-all duration-500 ${
            scrolled ? "h-9 sm:h-11" : "h-10 sm:h-12"
          }`}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              {settings?.brand_logo_main || logoMain ? (
                <img
                  src={settings?.brand_logo_main || logoMain}
                  alt={title}
                  className={`w-auto object-contain transition-all duration-500 group-hover:scale-110 ${
                    scrolled ? "h-9 sm:h-11" : "h-10 sm:h-12"
                  }`}
                />
              ) : (
                <>
                  <div className="relative w-8 h-8 flex items-center justify-center border border-black/20 rounded-[2px] transition-colors group-hover:border-black">
                    <Zap className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <span className="font-sans font-bold text-lg text-black tracking-tight uppercase">
                      {firstWord}
                    </span>
                    <span className="block text-[8px] text-[#707070] tracking-[0.25em] font-medium -mt-1 uppercase">
                      {remainingWords}
                    </span>
                  </div>
                </>
              )}
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              {visibleNavLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`text-[13px] uppercase tracking-wider transition-colors duration-300 py-1.5 relative group ${
                      isActive ? "text-black font-semibold" : "text-[#707070] hover:text-black font-medium"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[1.5px] bg-black transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* CTA + Account */}
            <div className="hidden lg:flex items-center gap-5">

              <button
                onClick={() => setQuoteOpen(true)}
                className="bg-black text-white font-medium px-6 py-2.5 rounded-[2px] text-xs uppercase tracking-widest transition-all duration-300 hover:bg-[#2C2C2C] active:scale-95 h-10 flex items-center justify-center shadow-premium"
              >
                Get a Quote
              </button>

              {customer ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="w-10 h-10 rounded-[2px] bg-white border border-black/10 hover:border-black/30 transition-all flex items-center justify-center font-semibold text-black shadow-sm"
                  >
                    {customer.username[0].toUpperCase()}
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-black/10 shadow-premium rounded-[2px] overflow-hidden z-50 animate-fade-up">
                      <div className="px-5 py-4 border-b border-black/5 bg-[#FAFAFA]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[2px] bg-white border border-black/10 flex items-center justify-center font-semibold text-black">
                            {customer.username[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-black truncate">
                              {customer.username}
                            </p>
                            <p className="text-xs text-[#707070] truncate mt-0.5">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/my-quotes"
                        className="flex items-center gap-3 px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#707070] hover:text-black hover:bg-[#FAFAFA] transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Quotations
                        <span className="ml-auto text-[9px] px-2 py-0.5 bg-black/5 text-black rounded-[2px] font-bold">
                          Portal
                        </span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-medium uppercase tracking-wider text-[#707070] hover:text-red-600 hover:bg-red-50 transition-all border-t border-black/5 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-[2px] border border-black/10 text-black hover:border-black/30 hover:bg-[#FAFAFA] transition-all shadow-sm"
                  aria-label="Sign In"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-[2px] border border-black/10 text-black hover:border-black/30 hover:bg-[#FAFAFA] transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-black/5 py-6 px-6 shadow-premium absolute w-full animate-fade-up">
            <div className="flex flex-col gap-2">
              {visibleNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-semibold uppercase tracking-widest py-3 border-b border-black/5 transition-colors ${
                    location.pathname === link.href ? "text-black" : "text-[#707070] hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {customer ? (
                <>
                  <div className="flex items-center gap-3 py-4 border-b border-black/5 bg-[#FAFAFA] px-4 -mx-4 mt-4">
                    <div className="w-10 h-10 rounded-[2px] bg-white border border-black/10 flex items-center justify-center font-semibold text-black">
                      {customer.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">{customer.username}</p>
                      <p className="text-xs text-[#707070] mt-0.5">{customer.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/my-quotes"
                    className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#707070] py-4 border-b border-black/5 hover:text-black transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Quotations
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#707070] py-4 hover:text-red-600 transition-colors text-left border-b border-black/5"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-black py-4 border-b border-black/5 hover:text-[#707070] transition-colors text-left mt-4"
                >
                  <User className="w-4 h-4" />
                  Sign In / Create Account
                </button>
              )}

              <button
                onClick={() => {
                  setQuoteOpen(true);
                  setMobileOpen(false);
                }}
                className="btn-primary mt-6 w-full text-center py-4"
              >
                Get a Personalized Quote
              </button>
            </div>
          </div>
        )}
      </nav>

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
      <CustomerAuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />
    </>
  );
}
