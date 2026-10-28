import { useState, useEffect } from "react";
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
  ArrowLeftRight
} from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { getWhatsAppDirectUrl, openWhatsAppDirect } from "@/utils/whatsapp";
import { PRODUCTS, syncLiveProducts } from "@/constants/products";
import type { Product } from "@/types";
import logoMain from "@/assets/logo-main.png";

export default function Footer() {
  const { settings } = useSystemSettings();
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    syncLiveProducts().then((list) => {
      if (list && list.length > 0) {
        setProductsList([...list]);
      }
    });
  }, []);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
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
                <a
                  href="https://www.facebook.com/tripmobilityph"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 flex items-center justify-center rounded-[2px] border border-black/10 text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={getWhatsAppDirectUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => openWhatsAppDirect(undefined, undefined, e)}
                  aria-label="WhatsApp"
                  title="Chat on WhatsApp (0917 122 8212)"
                  className="w-10 h-10 flex items-center justify-center rounded-[2px] border border-black/10 text-black hover:border-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Products */}
            <div className="lg:col-span-1">
              <h5 className="text-[15px] font-bold tracking-widest text-black uppercase mb-6">Products</h5>
              <ul className="space-y-4">
                {productsList.length > 0 ? (
                  productsList.slice(0, 4).map((p) => {
                    const cat = (p.category || "").toLowerCase();
                    const Icon = cat.includes("fold")
                      ? Bike
                      : cat.includes("mountain")
                      ? Mountain
                      : Package;
                    return (
                      <li key={p.id}>
                        <Link
                          to={`/products/${p.id}`}
                          className="text-[15px] font-medium text-[#707070] hover:text-black transition-colors duration-300 flex items-center gap-2.5"
                        >
                          <Icon className="w-4 h-4 text-black shrink-0" />
                          {p.name}
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  [
                    { label: "Trip Delivery Electric Bike", href: "/products/delivery-electronic-bike", icon: Package },
                    { label: "Trip Folding Electric Fat Bike", href: "/products/sadsa", icon: Bike },
                    { label: "Trip Ranger Electric Fat Bike", href: "/products/folding-electric-fat-bike---black_copy_qq2x", icon: Mountain },
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
                  })
                )}
                <li>
                  <Link
                    to="/compare"
                    className="text-[15px] font-medium text-[#707070] hover:text-black transition-colors duration-300 flex items-center gap-2.5"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-black shrink-0" />
                    Compare Models
                  </Link>
                </li>
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
                  <div className="w-4 h-4 text-[#25D366] shrink-0 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <a
                    href={getWhatsAppDirectUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => openWhatsAppDirect(undefined, undefined, e)}
                    className="text-[15px] font-medium text-[#707070] hover:text-[#25D366] transition-colors cursor-pointer"
                  >
                    WhatsApp: 0917 122 8212
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
