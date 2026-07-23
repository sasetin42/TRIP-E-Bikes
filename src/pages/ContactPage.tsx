import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Navigation, ExternalLink, ChevronDown, MessageSquare, Info, FileText, Truck, Wrench, Briefcase, Newspaper, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import SectionObserver from "@/components/features/SectionObserver";
import ParticleField from "@/components/features/ParticleField";
import { apiClient } from "@/lib/api-client";
import { trackContactFormSubmit, trackCTAClick, trackPageView } from "@/hooks/useTracking";

const INQUIRY_OPTIONS = [
  { value: "General Inquiry", label: "General Inquiry", icon: MessageSquare },
  { value: "Product Information", label: "Product Information", icon: Info },
  { value: "Quote Request", label: "Quote Request", icon: FileText },
  { value: "Fleet Solutions", label: "Fleet Solutions", icon: Truck },
  { value: "Service & Warranty", label: "Service & Warranty", icon: Wrench },
  { value: "Partnership / Dealership", label: "Partnership / Dealership", icon: Briefcase },
  { value: "Media & Press", label: "Media & Press", icon: Newspaper },
  { value: "Careers", label: "Careers", icon: GraduationCap },
];

const SERVICE_CENTERS = [
  {
    city: "Mandaluyong City — Head Office & Flagship Showroom",
    address: "123 EDSA, Mandaluyong City, Metro Manila 1550",
    hours: "Mon–Sat: 8:00 AM – 6:00 PM · Sun: 9:00 AM – 3:00 PM",
    phone: "+63 2 8123 4567",
    mapsUrl: "https://maps.google.com/?q=Mandaluyong+City+EDSA+Metro+Manila",
    flagship: true,
  },
  {
    city: "Quezon City — North Branch",
    address: "456 Commonwealth Ave., Quezon City, Metro Manila",
    hours: "Mon–Sat: 9:00 AM – 6:00 PM",
    phone: "+63 2 8234 5678",
    mapsUrl: "https://maps.google.com/?q=Commonwealth+Ave+Quezon+City",
    flagship: false,
  },
  {
    city: "Cebu City — Visayas Hub",
    address: "789 Osmeña Blvd., Cebu City, Cebu 6000",
    hours: "Mon–Sat: 9:00 AM – 5:30 PM",
    phone: "+63 32 234 5678",
    mapsUrl: "https://maps.google.com/?q=Osmena+Boulevard+Cebu+City",
    flagship: false,
  },
  {
    city: "Davao City — Mindanao Hub",
    address: "321 Quirino Ave., Davao City, Davao del Sur 8000",
    hours: "Mon–Sat: 9:00 AM – 5:30 PM",
    phone: "+63 82 345 6789",
    mapsUrl: "https://maps.google.com/?q=Quirino+Avenue+Davao+City",
    flagship: false,
  },
  {
    city: "Pampanga — Central Luzon",
    address: "654 MacArthur Hwy., Angeles City, Pampanga 2009",
    hours: "Mon–Fri: 9:00 AM – 5:00 PM · Sat: 9:00 AM – 3:00 PM",
    phone: "+63 45 345 6789",
    mapsUrl: "https://maps.google.com/?q=MacArthur+Highway+Angeles+City+Pampanga",
    flagship: false,
  },
  {
    city: "Iloilo City — Western Visayas",
    address: "987 Iznart St., Iloilo City, Iloilo 5000",
    hours: "Mon–Sat: 9:00 AM – 5:00 PM",
    phone: "+63 33 456 7890",
    mapsUrl: "https://maps.google.com/?q=Iznart+Street+Iloilo+City",
    flagship: false,
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "General Inquiry",
    message: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    trackPageView("/contact", "Contact Us — TRIP Mobility");
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".custom-dropdown-container")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    trackCTAClick("Contact Form Submit", "contact_page", "contact_form");

    const { data, error } = await apiClient.post("/contact-form.php", {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      inquiry_type: form.inquiryType,
      message: form.message,
    });

    if (error) {
      console.error("Contact form error:", error.message);
      toast.error("Failed to send. Please try again or email us directly.");
      setLoading(false);
      return;
    }

    trackContactFormSubmit(form.inquiryType);
    setSubmitted(true);
    setLoading(false);
    toast.success("Message sent! We will respond within 24 hours.");
  };

  const inputCls = "w-full bg-white border border-black/10 rounded-[2px] px-4 py-3 text-black placeholder-[#707070] font-medium focus:outline-none focus:border-black transition-all text-[11px] uppercase tracking-wider";
  const labelCls = "block text-[10px] text-black mb-2 uppercase tracking-widest font-bold";

  return (
    <div className="bg-white min-h-screen text-black">
      {/* BreadcrumbList Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tripmobility.ph" },
          { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://tripmobility.ph/contact" },
        ]
      })}} />

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#FAFAFA]">
        <ParticleField />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-[0.3em] mb-4">Get in Touch</p>
          <h1 className="text-[35px] font-bold text-black mb-6 uppercase tracking-tight">
            Contact Specialist
          </h1>
          <p className="text-[#707070] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Our technical support and logistics fleet coordinators are standing by to configure your proposal.
          </p>
        </div>
      </section>

      {/* Quick Contact Bar */}
      <div className="bg-white border-y border-black/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Phone, label: "Phone / Viber / WhatsApp", value: "0917 122 8212 / 0917 169 2711", href: "tel:09171228212" },
              { icon: Mail, label: "Email Address", value: "gobindra@ggii.com.ph", href: "mailto:gobindra@ggii.com.ph" },
              { icon: MapPin, label: "Store Location", value: "105 Maryland Street, Cubao, QC", href: "https://maps.google.com/?q=105+Maryland+Street,+Cubao,+Quezon+City" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 border border-black/5 bg-[#FAFAFA] hover:border-black transition-colors">
                <div className="w-10 h-10 rounded-[2px] bg-white border border-black/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-[#707070] uppercase tracking-widest font-bold mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-[11px] text-black font-bold uppercase tracking-wider hover:underline truncate block">{item.value}</a>
                  ) : (
                    <p className="text-[11px] text-black font-bold uppercase tracking-wider">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="py-[50px]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            
            {/* Form */}
            <SectionObserver className="lg:col-span-3">
              <div className="border border-black/5 p-8 bg-[#FAFAFA]">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">Send Us a Message</h2>
                <p className="text-[#707070] text-[11px] font-medium mb-8">We process and respond to direct specifications inquiries within 24 business hours.</p>
                
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-[2px] bg-white border border-black/10 flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <CheckCircle className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-black uppercase tracking-tight mb-3">Message Sent</h3>
                    <p className="text-[#707070] text-sm leading-relaxed mb-6 font-medium">
                      Thank you, <span className="text-black font-bold">{form.name}</span>. A copy was routed to <span className="text-black font-bold">{form.email}</span>.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", inquiryType: "General Inquiry", message: "" }); }}
                      className="btn-outline text-xs font-bold uppercase tracking-widest h-12 px-6"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="contact-name" className={labelCls}>Full Name <span className="text-black">*</span></label>
                        <input id="contact-name" name="name" required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Dela Cruz" className={inputCls} />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className={labelCls}>Email Address <span className="text-black">*</span></label>
                        <input id="contact-email" name="email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@company.ph" className={inputCls} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="contact-phone" className={labelCls}>Phone / Mobile</label>
                        <input id="contact-phone" name="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+63 917 000 0000" className={inputCls} />
                      </div>
                      <div className="relative custom-dropdown-container">
                        <label htmlFor="contact-inquiry" className={labelCls}>Inquiry Type <span className="text-black">*</span></label>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className={`${inputCls} w-full flex items-center justify-between text-left hover:border-black transition-all bg-white`}
                        >
                          <span className="flex items-center gap-2.5">
                            {(() => {
                              const opt = INQUIRY_OPTIONS.find(o => o.value === form.inquiryType) || INQUIRY_OPTIONS[0];
                              const Icon = opt.icon;
                              return (
                                <>
                                  <Icon className="w-3.5 h-3.5 text-black" />
                                  <span>{opt.label}</span>
                                </>
                              );
                            })()}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-[#707070] transition-transform duration-300 ${dropdownOpen ? "rotate-180 text-black" : ""}`} />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1.5 rounded-[2px] border border-black/10 bg-white shadow-premium z-50 py-1 max-h-60 overflow-y-auto">
                            {INQUIRY_OPTIONS.map((opt) => {
                              const Icon = opt.icon;
                              const isSelected = form.inquiryType === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setForm({ ...form, inquiryType: opt.value });
                                    setDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-left transition-colors ${
                                    isSelected 
                                      ? "bg-black text-white" 
                                      : "text-[#707070] hover:bg-[#FAFAFA] hover:text-black"
                                  }`}
                                >
                                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-black"}`} />
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className={labelCls}>Your Message <span className="text-black">*</span></label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us how we can help — include details like quantity, use case, timeline, or any specific requirements..."
                        rows={5}
                        className={`${inputCls} resize-none lowercase normal-case placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !form.name || !form.email || !form.message}
                      className="btn-primary w-full h-14 text-xs font-bold uppercase tracking-widest"
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </SectionObserver>

            {/* Sidebar Details */}
            <SectionObserver className="lg:col-span-2">
              <div className="space-y-6">
                <div className="border border-black/5 p-8 bg-[#FAFAFA]">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-5">Verification Standards</h3>
                  <div className="space-y-4">
                    {[
                      { q: "Technical Quoting Speed", a: "Within 2 business hours" },
                      { q: "Demo Availability", a: "Schedule with a technical sales designer" },
                      { q: "Servicing Center Turnaround", a: "Max 72 hours diagnostic audit" },
                      { q: "Custom Delivery Options", a: "Available nationwide" },
                    ].map((item, i) => (
                      <div key={i} className="py-2 border-b border-black/5 last:border-0">
                        <p className="text-[10px] font-bold text-black uppercase tracking-wider">{item.q}</p>
                        <p className="text-[11px] font-medium text-[#707070] mt-1">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-black/5 p-8 bg-[#FAFAFA]">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-5">Other Channels</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Facebook Page", handle: "@TRIPMobilityPH", href: "https://facebook.com" },
                      { label: "Instagram Grid", handle: "@tripmobility.ph", href: "https://instagram.com" },
                      { label: "WhatsApp Business", handle: "0917 122 8212", href: "https://wa.me/639171228212" },
                      { label: "Viber Support Channel", handle: "0917 169 2711", href: "viber://chat?number=639171692711" },
                    ].map((item, i) => (
                      <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 border border-black/5 hover:border-black transition-colors bg-white shadow-sm"
                      >
                        <div>
                          <p className="text-[10px] font-bold text-black uppercase tracking-wider">{item.label}</p>
                          <p className="text-[9px] font-bold text-[#707070] tracking-widest uppercase mt-1">{item.handle}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-black" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </SectionObserver>
          </div>

          {/* Store Locations Map Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 items-stretch border-t border-black/5 pt-16">
            <SectionObserver>
              <div className="border border-black/5 p-10 flex flex-col justify-between h-full space-y-10 bg-[#FAFAFA]">
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-[2px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#707070] mb-2">Phone No. / Viber / WhatsApp</h4>
                    <p className="text-black text-sm font-bold tracking-tight">0917 122 8212 / 0917 169 2711</p>
                  </div>
                </div>

                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-[2px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#707070] mb-2">Email Address</h4>
                    <p className="text-black text-[13px] font-bold tracking-tight">gobindra@ggii.com.ph</p>
                  </div>
                </div>

                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-[2px] bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#707070] mb-2">Flagship Store Location</h4>
                    <p className="text-black font-medium text-[13px] leading-relaxed max-w-xs">
                      105 Maryland Street, Cubao, Quezon City, Metro Manila
                    </p>
                  </div>
                </div>
              </div>
            </SectionObserver>

            <SectionObserver>
              <div className="border border-black/5 h-[320px] lg:h-full relative min-h-[300px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.8415843468574!2d121.0422967!3d14.625187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7afca100b73%3A0xe5107e3bd2623e1!2s105%20Maryland%20St%2C%20Cubao%2C%20Quezon%20City%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 object-cover"
                />
              </div>
            </SectionObserver>
          </div>
        </div>
      </section>



      {/* Test ride demo */}
      <section className="py-[50px] border-t border-black/5 text-center bg-white">
        <div className="max-w-2xl mx-auto px-6">
          <SectionObserver>
            <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight mb-6">Book A Test Ride</h2>
            <p className="text-[#707070] font-medium text-sm max-w-sm mx-auto mb-10 leading-relaxed">
              Visit any regional service center Monday through Saturday to experience a TRIP vehicle firsthand.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+6328123456" className="btn-primary text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 h-14 px-8">
                <Phone className="w-4 h-4" /> Book a Visit
              </a>
              <a href="mailto:fleet@tripmobility.ph" className="btn-outline text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 h-14 px-8">
                <Mail className="w-4 h-4" /> Request Fleet Demo
              </a>
            </div>
          </SectionObserver>
        </div>
      </section>
    </div>
  );
}

