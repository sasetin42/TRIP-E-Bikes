import { Link } from "react-router-dom";
import {
  Zap,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Package,
  Bike,
  Mountain,
  ArrowLeftRight,
  Info,
  BookOpen,
  MessageSquare
} from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import logoMain from "@/assets/logo-main.png";

export default function Footer() {
  const { settings } = useSystemSettings();
  const siteTitle = settings?.site_title || "TRIP Mobility";
  const words = siteTitle.split(" ");
  const firstWord = words[0] || "TRIP";
  const remainingWords = words.slice(1).join(" ") || "MOBILITY";

  return (
    <footer className="bg-black border-t border-black/5">
      {/* CTA Band */}
      <div className="border-b border-white/10 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-zinc-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
              Ready to Ride Electric?
            </p>
            <h3 className="text-3xl font-bold text-white tracking-tight uppercase">
              Join the E-Mobility Revolution
            </h3>
          </div>
          <Link
            to="/contact"
            className="bg-white text-black hover:bg-zinc-200 active:scale-[0.98] transition-all whitespace-nowrap text-xs py-4 px-8 font-bold uppercase tracking-widest rounded-[2px]"
          >
            Get Your Free Consultation
          </Link>
        </div>
      </div>

      <div className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-8 group">
                {settings?.brand_logo_main || logoMain ? (
                  <img
                    src={settings?.brand_logo_main || logoMain}
                    alt={siteTitle}
                    className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="w-14 h-14 flex items-center justify-center bg-black border border-black/10 rounded-[2px] transition-colors group-hover:border-black">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-2xl text-black uppercase tracking-tight">
                        {firstWord}
                      </span>
                      <span className="block text-[10px] text-[#707070] tracking-[0.25em] font-bold -mt-1 uppercase">
                        {remainingWords}
                      </span>
                    </div>
                  </>
                )}
              </Link>
              <p className="text-[#707070] text-[15px] leading-relaxed mb-8 max-w-sm font-medium">
                Philippines' leading premium electric bike brand. Delivering exceptional quality, competitive pricing, and unmatched after-sales support.
              </p>
              <div className="flex gap-4">
                {[
                  { Icon: Facebook, href: "https://facebook.com" },
                  { Icon: Instagram, href: "https://instagram.com" },
                  { Icon: Youtube, href: "https://youtube.com" },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-[2px] border border-black/10 text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <item.Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <h5 className="text-[15px] font-bold tracking-widest text-black uppercase mb-6">Products</h5>
              <ul className="space-y-4">
                {[
                  { label: "TRIP Cargo Pro", href: "/products/delivery-ebike", icon: Package },
                  { label: "TRIP Fold X", href: "/products/folding-ebike", icon: Bike },
                  { label: "TRIP Ranger 750", href: "/products/mountain-ebike", icon: Mountain },
                  { label: "Compare Models", href: "/compare", icon: ArrowLeftRight },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className="text-[15px] font-medium text-[#707070] hover:text-black transition-colors duration-300 flex items-center gap-2.5"
                      >
                        <Icon className="w-4 h-4 text-black shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="text-[15px] font-bold tracking-widest text-black uppercase mb-6">Company</h5>
              <ul className="space-y-4">
                {[
                  { label: "About Us", href: "/about", icon: Info },
                  { label: "Blog", href: "/blog", icon: BookOpen },
                  { label: "Contact", href: "/contact", icon: MessageSquare },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className="text-[15px] font-medium text-[#707070] hover:text-black transition-colors duration-300 flex items-center gap-2.5"
                      >
                        <Icon className="w-4 h-4 text-black shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-[15px] font-bold tracking-widest text-black uppercase mb-6">Contact</h5>
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-black mt-0.5 shrink-0" />
                  <span className="text-[15px] font-medium text-[#707070] leading-relaxed">
                    105 Maryland Street, Cubao, Quezon City, Metro Manila
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-black shrink-0" />
                  <a
                    href="tel:09171228212"
                    className="text-[15px] font-medium text-[#707070] hover:text-black transition-colors"
                  >
                    0917 122 8212 / 0917 169 2711
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-black shrink-0" />
                  <a
                    href="mailto:gobindra@ggii.com.ph"
                    className="text-[15px] font-medium text-[#707070] hover:text-black transition-colors break-all"
                  >
                    gobindra@ggii.com.ph
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[#707070] text-[13px] font-medium uppercase tracking-wider">
              © 2026 {siteTitle}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              {[
                { label: "Privacy Policy", tab: "privacy" },
                { label: "Terms of Service", tab: "terms" },
                { label: "Cookie Policy", tab: "cookies" },
              ].map((item) => (
                <Link
                  key={item.tab}
                  to={`/legal?tab=${item.tab}`}
                  className="text-[13px] font-bold uppercase tracking-wider text-[#707070] hover:text-black transition-colors duration-300"
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/admin" className="text-[13px] font-bold uppercase tracking-wider text-[#707070] hover:text-black transition-colors">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
