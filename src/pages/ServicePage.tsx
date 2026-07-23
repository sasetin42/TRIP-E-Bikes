import { useState, useEffect } from "react";
import {
  Shield, Wrench, MapPin, Package, BookOpen, Phone, CheckCircle,
  Clock, ChevronDown, ChevronUp, Navigation, Calendar, User,
  Mail, Bike, AlertCircle, Send, Loader2, Star, X
} from "lucide-react";
import { SERVICE_CENTERS } from "@/constants/data";
import SectionObserver from "@/components/features/SectionObserver";
import ParticleField from "@/components/features/ParticleField";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

const WARRANTY_ITEMS = [
  { title: "Frame Warranty", duration: "3 Years", desc: "Full coverage on frame, welds, and structural components" },
  { title: "Motor Warranty", duration: "1 Year", desc: "Hub motor, controller, and electrical system coverage" },
  { title: "Battery Warranty", duration: "1 Year", desc: "Lithium-ion battery pack with capacity guarantee (80%+)" },
  { title: "Components", duration: "6 Months", desc: "Brakes, gears, display, lighting, and accessories" },
];

const MAINTENANCE_PLANS = [
  { title: "Basic Care", price: "₱2,500/year", features: ["2 tune-up visits", "Brake inspection", "Tire pressure check", "Basic cleaning"] },
  { title: "Pro Care", price: "₱5,000/year", highlight: true, features: ["4 tune-up visits", "Full drivetrain service", "Battery health check", "Priority scheduling", "Free brake pads"] },
  { title: "Fleet Care", price: "Custom pricing", features: ["On-site maintenance", "Monthly fleet inspection", "Dedicated technician", "24hr emergency support", "Full parts coverage"] },
];

const SERVICE_TYPES = [
  "General Tune-Up", "Battery Check & Replacement", "Motor Service",
  "Brake Adjustment", "Tire Replacement", "Electrical Diagnostics",
  "Warranty Claim", "Accident Repair", "Software Update",
];

const EXTENDED_CENTERS = [
  { city: "Mandaluyong City", address: "123 Electric Avenue, Barangay TRIP", phone: "+63 2 8888-8747", hours: "Mon–Sat 8am–6pm", services: ["Full service", "Test rides", "Parts"], technicians: 4, landmark: "Near SM Megamall", maps: "https://maps.google.com/?q=Mandaluyong+City", rating: 4.9 },
  { city: "Quezon City", address: "456 E-Mobility Blvd, Brgy. Commonwealth", phone: "+63 2 8999-9876", hours: "Mon–Sat 9am–6pm", services: ["Service & repair", "Battery replacement"], technicians: 3, landmark: "Near Fairview Terraces", maps: "https://maps.google.com/?q=Quezon+City", rating: 4.8 },
  { city: "Cebu City", address: "789 Green Transport Hub, Labangon", phone: "+63 32 888-7654", hours: "Mon–Sat 8am–5pm", services: ["Full service", "Fleet maintenance"], technicians: 3, landmark: "Near SM City Cebu", maps: "https://maps.google.com/?q=Cebu+City", rating: 4.7 },
  { city: "Davao City", address: "321 Clean Energy Park, Bajada", phone: "+63 82 777-6543", hours: "Mon–Fri 8am–5pm", services: ["Service & repair", "Parts sales"], technicians: 2, landmark: "Near Abreeza Mall", maps: "https://maps.google.com/?q=Davao+City", rating: 4.8 },
  { city: "Iloilo City", address: "654 Eco Transport Zone, Mandurriao", phone: "+63 33 666-5432", hours: "Mon–Sat 9am–5pm", services: ["Service & repair"], technicians: 2, landmark: "Near SM Iloilo", maps: "https://maps.google.com/?q=Iloilo+City", rating: 4.6 },
  { city: "Pampanga", address: "987 Angeles City Tech Park, Clark", phone: "+63 45 555-4321", hours: "Mon–Sat 8am–5pm", services: ["Fleet service", "Corporate accounts"], technicians: 3, landmark: "Clark Freeport Zone", maps: "https://maps.google.com/?q=Pampanga", rating: 4.9 },
];

const TIMES = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

export default function ServicePage() {
  const { customer } = useCustomerAuth();
  const [expandedCenter, setExpandedCenter] = useState<number | null>(null);
  const [showAppointment, setShowAppointment] = useState(false);
  const [prefilledCenter, setPrefilledCenter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: customer?.username || "",
    email: customer?.email || "",
    phone: "",
    service_center: "",
    service_type: SERVICE_TYPES[0],
    preferred_date: "",
    preferred_time: TIMES[0],
    bike_model: "",
    issue_description: "",
  });

  // Pre-fill customer info when auth state changes
  useEffect(() => {
    if (customer) {
      setForm(f => ({
        ...f,
        name: f.name || customer.username || "",
        email: f.email || customer.email || "",
      }));
    }
  }, [customer]);

  // Handle #appointment hash
  useEffect(() => {
    if (window.location.hash === '#appointment') {
      setTimeout(() => {
        document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' });
        setShowAppointment(true);
      }, 500);
    }
  }, []);

  const openAppointment = (center: string) => {
    setPrefilledCenter(center);
    setForm(f => ({ ...f, service_center: center }));
    setShowAppointment(true);
    window.scrollTo({ top: document.getElementById("appointment")?.offsetTop || 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.service_center || !form.preferred_date) {
      toast.error("Please fill in all required fields."); return;
    }
    setSubmitting(true);
    const { error } = await apiClient.post("/appointments.php", {
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      service_center: form.service_center,
      service_type: form.service_type,
      appointment_date: form.preferred_date,
      appointment_time: form.preferred_time,
      bike_model: form.bike_model || null,
      issue_description: form.issue_description || null,
    });
    if (error) { toast.error("Booking failed: " + error.message); setSubmitting(false); return; }
    setSubmitted(true);
    setSubmitting(false);
    toast.success("Appointment booked! We'll confirm within 24 hours.");
  };

  const inp = "w-full border border-black/10 bg-white rounded-[2px] px-4 py-3.5 text-black placeholder-[#707070] text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-black transition-all";
  const inpStyle = { style: { background: "#FFFFFF" } };

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#FAFAFA]">
        <ParticleField />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-[0.3em] mb-4">Service & Support</p>
          <h1 className="text-[35px] font-bold text-black mb-6 uppercase tracking-tight">
            We've Got You <span className="text-[#707070]">Covered</span>
          </h1>
          <p className="text-[#707070] text-sm sm:text-base max-w-2xl mx-auto mb-10 font-medium">
            Industry-leading warranty, 6 nationwide service centers, and a dedicated support team.
          </p>
          <button onClick={() => { setShowAppointment(true); document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth" }); }}
            className="btn-primary flex items-center gap-2 mx-auto h-12 text-[10px] uppercase tracking-widest font-bold px-8">
            <Calendar className="w-4 h-4" />Book Service Appointment
          </button>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: "Warranty" },
            { icon: Wrench, label: "Service Centers" },
            { icon: Package, label: "Spare Parts" },
            { icon: BookOpen, label: "User Manuals" },
          ].map((item, i) => (
            <div key={i} className="bg-[#FAFAFA] rounded-[2px] p-6 text-center border border-black/5 hover:border-black hover:shadow-premium cursor-pointer transition-all group">
              <item.icon className="w-5 h-5 text-black mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-black">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Warranty */}
      <section className="py-[50px] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">Warranty Coverage</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">
                Philippines' Best <span className="text-[#707070]">E-Bike Warranty</span>
              </h2>
            </div>
          </SectionObserver>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WARRANTY_ITEMS.map((item, i) => (
              <SectionObserver key={i}>
                <div className="bg-[#FAFAFA] rounded-[2px] p-8 border border-black/5 hover:border-black transition-all h-full shadow-sm">
                  <div className="w-12 h-12 bg-white border border-black/10 flex items-center justify-center mb-5">
                    <Shield className="w-5 h-5 text-black" />
                  </div>
                  <p className="font-bold text-2xl tracking-tighter text-black mb-2">{item.duration}</p>
                  <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#707070] mb-3">{item.title}</h3>
                  <p className="text-[#707070] font-medium text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Centers ── */}
      <section className="py-[50px] bg-[#FAFAFA] border-y border-black/5" id="service-centers">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">Nationwide Network</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">
                6 Service <span className="text-[#707070]">Centers</span>
              </h2>
              <p className="text-[#707070] font-medium text-sm mt-4 max-w-xl mx-auto">Strategically located across the Philippines for fast, convenient access to expert TRIP technicians.</p>
            </div>
          </SectionObserver>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXTENDED_CENTERS.map((center, i) => {
              const isExpanded = expandedCenter === i;
              return (
                <SectionObserver key={i}>
                  <div className={`bg-white rounded-[2px] border transition-all duration-300 overflow-hidden ${isExpanded ? "border-black shadow-premium" : "border-black/5 hover:border-black/20"}`}>
                    <div className="p-8 cursor-pointer" onClick={() => setExpandedCenter(isExpanded ? null : i)}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-black" />
                            <h3 className="font-bold text-[11px] uppercase tracking-wider text-black">{center.city}</h3>
                          </div>
                          <p className="text-[11px] font-medium text-[#707070]">{center.address}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 bg-[#FAFAFA] px-2 py-1 border border-black/5">
                          <Star className="w-3 h-3 text-black fill-black" />
                          <span className="text-[10px] font-bold text-black">{center.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {center.services.map((s, j) => (
                          <span key={j} className="px-2 py-1 bg-[#FAFAFA] border border-black/10 text-[9px] font-bold uppercase tracking-widest text-[#707070]">{s}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-black" />{center.phone}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-black" />{center.hours}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-[#707070]" />}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-8 pb-8 border-t border-black/5 pt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-[#FAFAFA] border border-black/5">
                            <p className="text-[9px] font-bold text-[#707070] uppercase tracking-widest mb-1">Technicians</p>
                            <p className="font-bold text-2xl tracking-tighter text-black">{center.technicians}</p>
                          </div>
                          <div className="p-4 bg-[#FAFAFA] border border-black/5">
                            <p className="text-[9px] font-bold text-[#707070] uppercase tracking-widest mb-1">Rating</p>
                            <p className="font-bold text-2xl tracking-tighter text-black">{center.rating}/5.0</p>
                          </div>
                        </div>
                        <p className="text-[11px] font-medium text-[#707070]"><span className="text-black font-bold uppercase tracking-widest text-[9px]">Landmark:</span> {center.landmark}</p>

                        {/* Inline Google Maps embed */}
                        <div className="border border-black/10 h-32">
                          <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(center.city + " Philippines")}&output=embed&zoom=13`}
                            className="w-full h-full grayscale"
                            loading="lazy"
                            title={`${center.city} Service Center`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <a href={center.maps} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-3 bg-[#FAFAFA] border border-black/10 text-[9px] font-bold uppercase tracking-widest text-black hover:border-black transition-all"
                            onClick={e => e.stopPropagation()}>
                            <Navigation className="w-3 h-3" />Directions
                          </a>
                          <button onClick={e => { e.stopPropagation(); openAppointment(center.city); }}
                            className="flex items-center justify-center gap-2 py-3 bg-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
                            <Calendar className="w-3 h-3" />Book Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionObserver>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Appointment Booking Form ── */}
      <section className="py-[50px] bg-white" id="appointment">
        <div className="max-w-3xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">Book Service</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">
                Schedule an <span className="text-[#707070]">Appointment</span>
              </h2>
              <p className="text-[#707070] font-medium text-sm mt-4">Book your service slot online. We'll confirm within 24 hours.</p>
            </div>
          </SectionObserver>

          <div className="bg-[#FAFAFA] border border-black/5 shadow-premium">
            <div className="h-1 w-full bg-black" />

            {submitted ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-white border border-black/10 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle className="w-8 h-8 text-black" />
                </div>
                <h3 className="font-bold text-2xl uppercase tracking-tight text-black mb-4">Appointment Requested!</h3>
                <p className="text-[#707070] font-medium text-sm leading-relaxed mb-3">
                  Your service appointment at <span className="text-black font-bold">{form.service_center}</span> has been submitted.
                </p>
                <p className="text-[#707070] font-medium text-sm mb-8">Our team will confirm your slot at <span className="text-black font-bold">{form.email}</span> within 24 hours.</p>
                <div className="bg-white border border-black/5 p-6 mb-8 text-left">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: "Service Center", val: form.service_center },
                      { label: "Service Type", val: form.service_type },
                      { label: "Preferred Date", val: form.preferred_date },
                      { label: "Preferred Time", val: form.preferred_time },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-[9px] font-bold text-[#707070] uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-black">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, preferred_date: "", issue_description: "", bike_model: "" })); }} className="btn-outline text-[10px] uppercase tracking-widest h-12 px-8">
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <div className="p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="sm:col-span-2 mb-2">
                    <p className="text-[10px] text-black font-bold tracking-widest uppercase pb-2 border-b border-black/10">Personal Information</p>
                  </div>
                  <div>
                    <label htmlFor="service-name" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Full Name <span className="text-black">*</span></label>
                    <div className="relative"><User className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2" />
                      <input id="service-name" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Juan Dela Cruz" className={inp + " pl-12"} {...inpStyle} autoComplete="name" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="service-email" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Email <span className="text-black">*</span></label>
                    <div className="relative"><Mail className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2" />
                      <input id="service-email" name="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="juan@email.com" className={inp + " pl-12"} {...inpStyle} autoComplete="email" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="service-phone" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Phone <span className="text-black">*</span></label>
                    <div className="relative"><Phone className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2" />
                      <input id="service-phone" name="phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+63 917 000 0000" className={inp + " pl-12"} {...inpStyle} autoComplete="tel" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="service-bike-model" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Bike Model</label>
                    <div className="relative"><Bike className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2" />
                      <input id="service-bike-model" name="bike_model" value={form.bike_model} onChange={e => setForm(f => ({ ...f, bike_model: e.target.value }))} placeholder="e.g. TRIP Cargo Pro" className={inp + " pl-12"} {...inpStyle} />
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="sm:col-span-2 mt-6 mb-2">
                    <p className="text-[10px] text-black font-bold tracking-widest uppercase pb-2 border-b border-black/10">Service Details</p>
                  </div>
                  <div>
                    <label htmlFor="service-center" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Service Center <span className="text-black">*</span></label>
                    <select id="service-center" name="service_center" value={form.service_center} onChange={e => setForm(f => ({ ...f, service_center: e.target.value }))} className={inp} style={{ background: "#FFFFFF" }}>
                      <option value="">Select a center...</option>
                      {EXTENDED_CENTERS.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="service-type" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Service Type</label>
                    <select id="service-type" name="service_type" value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} className={inp} style={{ background: "#FFFFFF" }}>
                      {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="service-date" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Preferred Date <span className="text-black">*</span></label>
                    <input id="service-date" name="preferred_date" type="date" value={form.preferred_date} onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))} min={new Date().toISOString().split("T")[0]} className={inp} {...inpStyle} />
                  </div>
                  <div>
                    <label htmlFor="service-time" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Preferred Time</label>
                    <select id="service-time" name="preferred_time" value={form.preferred_time} onChange={e => setForm(f => ({ ...f, preferred_time: e.target.value }))} className={inp} style={{ background: "#FFFFFF" }}>
                      {TIMES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="service-issue" className="block text-[9px] text-[#707070] font-bold mb-2 uppercase tracking-widest">Issue Description</label>
                    <textarea id="service-issue" name="issue_description" value={form.issue_description} onChange={e => setForm(f => ({ ...f, issue_description: e.target.value }))} rows={4} placeholder="Describe the issue or what service you need..." className={inp + " resize-none normal-case lowercase placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"} style={{ background: "#FFFFFF" }} />
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-2 flex items-center justify-center gap-2 disabled:opacity-50 h-14 text-[10px] font-bold uppercase tracking-widest">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Calendar className="w-4 h-4 text-white" />}
                    {submitting ? "Booking..." : "Book Service Appointment"}
                  </button>
                  <a href="tel:+6281234567" className="btn-outline flex-1 flex items-center justify-center gap-2 h-14 text-[10px] font-bold uppercase tracking-widest">
                    <Phone className="w-4 h-4" />Call Instead
                  </a>
                </div>
                <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest text-center mt-5">Free booking · Confirmation within 24 hours · Cancel anytime</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Maintenance Plans */}
      <section className="py-[50px] bg-[#FAFAFA] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">Keep It Running</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">
                Maintenance <span className="text-[#707070]">Plans</span>
              </h2>
            </div>
          </SectionObserver>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MAINTENANCE_PLANS.map((plan, i) => (
              <SectionObserver key={i}>
                <div className={`p-10 h-full flex flex-col transition-all duration-300 ${plan.highlight ? "bg-black text-white shadow-premium relative" : "bg-white border border-black/5 hover:border-black"}`}>
                  {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-[9px] font-bold uppercase tracking-widest rounded-[2px] shadow-sm">Most Popular</div>}
                  <Wrench className={`w-6 h-6 mb-5 ${plan.highlight ? "text-white" : "text-black"}`} />
                  <h3 className={`text-xl font-bold uppercase tracking-tight mb-2 ${plan.highlight ? "text-white" : "text-black"}`}>{plan.title}</h3>
                  <p className={`font-bold text-2xl tracking-tighter mb-8 ${plan.highlight ? "text-white" : "text-[#707070]"}`}>{plan.price}</p>
                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className={`flex items-start gap-3 text-[11px] font-bold uppercase tracking-wider ${plan.highlight ? "text-[#D0D0D0]" : "text-[#707070]"}`}>
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-white" : "text-black"}`} />{feat}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => openAppointment("")} className={`mt-10 w-full h-12 text-[10px] font-bold uppercase tracking-widest ${plan.highlight ? "bg-white text-black hover:bg-gray-200 transition-colors" : "btn-outline"}`}>
                    Get This Plan
                  </button>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-[50px] bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionObserver>
            <div className="w-16 h-16 bg-[#FAFAFA] border border-black/5 flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight mb-4">
              Need <span className="text-[#707070]">Help Now?</span>
            </h2>
            <p className="text-[#707070] font-medium text-sm mb-10">Our support team is available Monday–Saturday, 8am–6pm PHT</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+6281234567" className="btn-primary h-14 text-[11px] font-bold uppercase tracking-widest px-10 flex items-center justify-center">Call +63 2 8123 4567</a>
              <a href="mailto:support@tripmobility.ph" className="btn-outline h-14 text-[11px] font-bold uppercase tracking-widest px-10 flex items-center justify-center">Email Support</a>
            </div>
          </SectionObserver>
        </div>
      </section>
    </div>
  );
}

