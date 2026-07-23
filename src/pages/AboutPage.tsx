import { Link } from "react-router-dom";
import { Target, Eye, Heart, Award, Users, TrendingUp, ArrowRight, Zap, Flag, Rocket, MapPin, Briefcase, Package, Globe, Star } from "lucide-react";
import ParticleField from "@/components/features/ParticleField";
import SectionObserver from "@/components/features/SectionObserver";

const TIMELINE = [
  { year: "2020", title: "Founded", desc: "TRIP Mobility established with a mission to electrify Philippine transportation.", icon: Flag },
  { year: "2021", title: "First Product Launch", desc: "TRIP Cargo Pro launched — instantly adopted by major delivery platforms.", icon: Rocket },
  { year: "2022", title: "500 Units Deployed", desc: "Reached 500 e-bikes on Metro Manila roads. Opened Cebu service center.", icon: MapPin },
  { year: "2023", title: "Corporate Partnerships", desc: "Secured partnerships with 3 Fortune 500 companies for fleet solutions.", icon: Briefcase },
  { year: "2024", title: "3,000+ Units", desc: "Expanded to 12 LGUs nationwide. Launched Ranger 750 mountain e-bike.", icon: Package },
  { year: "2025", title: "Series A Funding", desc: "Raised funding to accelerate nationwide expansion and R&D programs.", icon: Globe },
  { year: "2026", title: "Market Leader", desc: "Recognized as Philippines' #1 premium commercial e-bike brand.", icon: Star },
];

const TEAM = [
  { name: "Miguel Torres", title: "CEO & Co-Founder" },
  { name: "Sarah Lim", title: "CTO & Co-Founder" },
  { name: "Carlos Reyes", title: "VP of Sales" },
  { name: "Ana Santos", title: "Head of Operations" },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen text-black">
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#FAFAFA]">
        <ParticleField />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-[0.3em] mb-4">Our Story</p>
          <h1 className="text-[35px] font-bold text-black mb-6 uppercase tracking-tight">
            Electrifying the <span className="text-[#707070]">Philippines</span>
          </h1>
          <p className="text-[#707070] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            TRIP Mobility was founded on a simple but powerful belief: that every Filipino deserves access to premium, sustainable, and economically smart transportation. We started in 2020 with a single model and a vision to transform how the Philippines moves.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-[50px] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Target,
                title: "Our Mission",
                desc: "Deliver the highest quality electric bikes at competitive prices while providing exceptional customer service and after-sales support — making e-mobility accessible to every Filipino.",
              },
              {
                icon: Eye,
                title: "Our Vision",
                desc: "To be the Philippines' most trusted e-mobility brand by 2030 — with 100,000 TRIP e-bikes replacing petrol vehicles on Philippine roads.",
              },
              {
                icon: Heart,
                title: "Our Values",
                desc: "Quality without compromise. Innovation in every iteration. Customer success as our metric. Sustainability as our responsibility to the Philippines.",
              },
            ].map((item, i) => (
              <SectionObserver key={i} className="h-full">
                <div className="h-full flex flex-col border border-black/5 p-8 hover:border-black hover:shadow-premium transition-all duration-300 bg-[#FAFAFA]">
                  <div className="w-14 h-14 rounded-[2px] bg-black/5 flex items-center justify-center mb-6 group hover:bg-black transition-colors duration-300">
                    <item.icon className="w-7 h-7 text-black group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-[18px] font-bold uppercase tracking-wider text-black mb-4">{item.title}</h3>
                  <p className="text-[14px] font-normal text-[#707070] leading-relaxed flex-1">{item.desc}</p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-[50px] bg-[#FAFAFA] border-t border-b border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">Milestones</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">Our Journey</h2>
            </div>
          </SectionObserver>
          <div className="relative">
            <div className="absolute left-[7px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-black/10" />
            <div className="space-y-12">
              {TIMELINE.map((item, i) => (
                <SectionObserver key={i}>
                  <div className={`relative flex gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-row`}>
                    {/* Dot */}
                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-4 w-4 h-4 rounded-full bg-black border-4 border-[#FAFAFA] z-10 shadow-sm" />
                    {/* Content */}
                    <div className={`pl-10 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-12 md:w-1/2" : "md:text-left md:pl-12 md:w-1/2 md:ml-auto"} w-full`}>
                      <div className="p-2 inline-block w-full">
                        <div className={`flex items-center gap-2 mb-2 ${i % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                          <item.icon className="w-5 h-5 text-black" />
                          <span className="text-black font-bold text-lg font-mono tracking-tight">{item.year}</span>
                        </div>
                        <h4 className="font-bold text-black uppercase tracking-wider text-[18px] mt-1 mb-2">{item.title}</h4>
                        <p className="text-[#707070] font-normal text-[14px] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </SectionObserver>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-[50px] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">Recognition</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">Awards & Achievements</h2>
            </div>
          </SectionObserver>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: "Best EV Brand 2024", org: "Philippine Automotive Industry Awards" },
              { icon: TrendingUp, title: "Top Startup 2023", org: "Startup Philippines Summit" },
              { icon: Zap, title: "Green Innovation Award", org: "DENR Environmental Awards" },
              { icon: Users, title: "Best B2B Product", org: "Entrepreneur Philippines" },
            ].map((award, i) => (
              <SectionObserver key={i} className="h-full">
                <div className="h-full flex flex-col border border-black/5 bg-[#FAFAFA] p-8 text-center hover:border-black hover:shadow-premium transition-all duration-300">
                  <div className="w-14 h-14 rounded-[2px] bg-black/5 flex items-center justify-center mx-auto mb-6 group hover:bg-black transition-colors duration-300">
                    <award.icon className="w-7 h-7 text-black group-hover:text-white transition-colors duration-300" />
                  </div>
                  <p className="font-bold text-black text-[18px] uppercase tracking-wider mb-3">{award.title}</p>
                  <p className="text-[14px] font-normal text-[#707070] mt-auto">{award.org}</p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-[50px] bg-[#FAFAFA] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">Leadership</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">The Team Behind TRIP</h2>
            </div>
          </SectionObserver>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <SectionObserver key={i} className="h-full">
                <div className="h-full flex flex-col border border-black/5 bg-white p-8 text-center hover:border-black hover:shadow-premium transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-black border-2 border-white mx-auto mb-5 flex items-center justify-center text-xl font-bold text-white shadow-sm hover:scale-110 transition-transform duration-300">
                    {member.name[0]}
                  </div>
                  <p className="font-bold text-black text-[18px] uppercase tracking-wider mb-2">{member.name}</p>
                  <p className="text-[14px] font-normal text-[#707070] mt-auto">{member.title}</p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[50px] text-center border-t border-black/5 bg-white">
        <SectionObserver>
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-4">Join the Movement</p>
          <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight mb-8">Ready to Ride with TRIP?</h2>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            Talk to Our Team
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </SectionObserver>
      </section>
    </div>
  );
}

