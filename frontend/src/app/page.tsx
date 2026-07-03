import Link from "next/link";
import Image from "next/image";
import ContactPanel from "@/components/ContactPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans overflow-x-hidden relative selection:bg-[#F97316] selection:text-white">
      {/* 1. NAVIGATION (Fixed, Stark) */}
      <header className="fixed w-full bg-white py-4 px-4 md:px-8 lg:px-16 flex items-center justify-between top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#0B1F4A] flex items-center justify-center transition-transform group-hover:rotate-12">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l4-2 4 2zM13 6h5l3 4v6a1 1 0 01-1 1h-1M6 20a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <span className="text-[#0B1F4A] text-2xl font-black tracking-tighter uppercase">Bowmenn</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[#0B1F4A] uppercase tracking-wide">
          <Link href="/" className="hover:text-[#F97316] transition-colors">Home</Link>
          <Link href="#about" className="hover:text-[#F97316] transition-colors">About Us</Link>
          <Link href="#services" className="hover:text-[#F97316] transition-colors">Our Services</Link>
          <Link href="#contact" className="hover:text-[#F97316] transition-colors">Contact Us</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-sm font-bold text-[#0B1F4A] hover:text-[#F97316] uppercase tracking-wide transition-colors">
            Log In
          </Link>
          <Link href="/register" className="bg-[#F97316] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#e06512] transition-colors border border-[#F97316]">
            Sign Up
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION (Webflow Style + Brand Colors) */}
      <section className="relative min-h-[90vh] bg-[#0B1F4A] flex flex-col justify-end pt-40 pb-16 overflow-hidden mt-[76px]">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600')" }}
        ></div>
        
        <div className="relative z-10 px-4 md:px-8 lg:px-16 w-full">
          <h1 className="text-[3rem] sm:text-[5rem] md:text-[7rem] lg:text-[8rem] font-black text-white leading-[0.9] tracking-tighter uppercase max-w-[1400px]">
            Wherever the <br /> destination,<br />
            <span className="text-[#F97316]">there's no</span><br />
            <span className="text-[#F97316]">stopping for us.</span>
          </h1>
          
          <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-t border-white/20 pt-8">
            <p className="text-lg md:text-xl text-gray-300 max-w-xl font-medium">
              With instant unified price, instant booking, and access to multiple trucks, Bowmenn puts you in the driver's seat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-[#F97316] text-white px-8 py-4 font-bold text-center hover:bg-white hover:text-[#0B1F4A] transition-colors uppercase tracking-widest min-h-[56px] flex items-center justify-center">
                Book a Shipment
              </Link>
              <Link href="/login" className="bg-transparent border border-white text-white px-8 py-4 font-bold text-center hover:bg-white/10 transition-colors uppercase tracking-widest min-h-[56px] flex items-center justify-center">
                Drive With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MARQUEE TICKER */}
      <div className="bg-[#F97316] text-[#0B1F4A] py-6 border-y-4 border-[#0B1F4A] flex overflow-hidden whitespace-nowrap">
        <div className="flex gap-16 font-black text-3xl uppercase tracking-widest w-max" style={{ animation: "marquee 20s linear infinite" }}>
          <span>1,000+ Vetted Carriers</span>
          <span>•</span>
          <span>Real-Time Tracking</span>
          <span>•</span>
          <span>GIT Insurance</span>
          <span>•</span>
          <span>Nationwide Coverage</span>
          <span>•</span>
          {/* Duplicate for seamless loop */}
          <span>1,000+ Vetted Carriers</span>
          <span>•</span>
          <span>Real-Time Tracking</span>
          <span>•</span>
          <span>GIT Insurance</span>
          <span>•</span>
          <span>Nationwide Coverage</span>
          <span>•</span>
        </div>
      </div>

      {/* 4. ABOUT SECTION (Editorial Grid) */}
      <section id="about" className="bg-white py-24 md:py-32 px-4 md:px-8 lg:px-16 border-b-4 border-[#0B1F4A]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          <div className="lg:col-span-5 relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#F5F5F5] -z-10"></div>
            <Image 
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800" 
              alt="Delivery professional" 
              width={800}
              height={1000}
              className="w-full h-auto aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl border border-gray-200"
            />
          </div>
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-[#F97316] text-sm tracking-[0.2em] font-black uppercase mb-6 border-l-2 border-[#F97316] pl-4">Who We Are</span>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#0B1F4A] mb-10 leading-[0.9] tracking-tighter uppercase">
              About Our <br />Company
            </h2>
            <div className="text-xl text-gray-700 leading-relaxed font-medium space-y-6 max-w-2xl">
              <p>
                Bowmenn is a tech-enabled last-mile logistics platform that connects truck owners with businesses and individuals to provide on-demand delivery of goods and household equipment conveniently from the shortest distance to the last-mile.
              </p>
              <p>
                On our on-demand platform, you are never short of options — Trucks, Pickups, and Vans — for your moving and hauling needs.
              </p>
            </div>
            <Link href="#about" className="mt-12 inline-flex items-center gap-4 text-[#0B1F4A] font-black uppercase tracking-widest hover:text-[#F97316] transition-colors group">
              Read More 
              <span className="w-12 h-1 bg-[#0B1F4A] group-hover:bg-[#F97316] transition-colors group-hover:w-16"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SERVICES SECTION (Bold Cards) */}
      <section id="services" className="bg-[#F5F5F5] py-24 md:py-32 px-4 md:px-8 lg:px-16 border-b-4 border-[#0B1F4A]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <div>
              <span className="text-[#F97316] text-sm tracking-[0.2em] font-black uppercase mb-4 block">Our Services</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B1F4A] leading-[0.9] tracking-tighter uppercase">
                With Bowmenn <br/>you can track all <br/>your shipments.
              </h2>
            </div>
            <div className="flex items-end pb-2">
              <p className="text-2xl text-gray-600 font-medium leading-snug border-l-4 border-[#0B1F4A] pl-6">
                Your cargo is protected by our GIT Insurance policy. Experience seamless logistics across Nigeria.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-[#0B1F4A] bg-[#0B1F4A]">
            <div className="bg-white p-12 lg:p-16 border-b md:border-b-0 md:border-r border-[#0B1F4A] hover:bg-[#F97316] hover:text-white transition-colors group">
              <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mb-8 border-2 border-[#0B1F4A] group-hover:border-white group-hover:bg-transparent transition-colors">
                <svg className="w-8 h-8 text-[#0B1F4A] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-[#0B1F4A] mb-4 group-hover:text-white uppercase tracking-tighter">For Business</h3>
              <p className="text-gray-600 text-lg font-medium group-hover:text-white/90">Bowmenn is enthusiastic about the adoption of smart business solutions for enterprises of all sizes.</p>
            </div>
            <div className="bg-white p-12 lg:p-16 hover:bg-[#F97316] hover:text-white transition-colors group">
              <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mb-8 border-2 border-[#0B1F4A] group-hover:border-white group-hover:bg-transparent transition-colors">
                <svg className="w-8 h-8 text-[#0B1F4A] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-[#0B1F4A] mb-4 group-hover:text-white uppercase tracking-tighter">Fleet Owners</h3>
              <p className="text-gray-600 text-lg font-medium group-hover:text-white/90">Earn more money driving with Bowmenn. Find more loads in your preferred routes.</p>
            </div>
            <div className="bg-white p-12 lg:p-16 border-t md:border-r border-[#0B1F4A] hover:bg-[#F97316] hover:text-white transition-colors group">
              <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mb-8 border-2 border-[#0B1F4A] group-hover:border-white group-hover:bg-transparent transition-colors">
                <svg className="w-8 h-8 text-[#0B1F4A] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-[#0B1F4A] mb-4 group-hover:text-white uppercase tracking-tighter">Drivers</h3>
              <p className="text-gray-600 text-lg font-medium group-hover:text-white/90">Find preferred loads, assign drivers, do the work — all from the app.</p>
            </div>
            <div className="bg-white p-12 lg:p-16 border-t border-[#0B1F4A] hover:bg-[#F97316] hover:text-white transition-colors group">
              <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mb-8 border-2 border-[#0B1F4A] group-hover:border-white group-hover:bg-transparent transition-colors">
                <svg className="w-8 h-8 text-[#0B1F4A] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-[#0B1F4A] mb-4 group-hover:text-white uppercase tracking-tighter">Individuals</h3>
              <p className="text-gray-600 text-lg font-medium group-hover:text-white/90">Bowmenn helps you save time, money and stress dealing with the usual logistics headaches.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY SHIPPERS CHOOSE US */}
      <section className="bg-white py-24 md:py-32 px-4 md:px-8 lg:px-16 border-b-4 border-[#0B1F4A]">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="w-full lg:w-2/3">
            <span className="text-[#F97316] text-sm tracking-[0.2em] font-black uppercase mb-4 block">More About Us</span>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#0B1F4A] mb-16 leading-[0.9] tracking-tighter uppercase">
              Why Shippers <br/>Choose Us
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
              {[
                { title: "Fast Shipping", desc: "Get 24/7 access to over one thousand qualified carriers to avoid delays." },
                { title: "Convenience", desc: "Our technology makes it easier than ever to set a time that works for you, track, communicate, and pay all in one app." },
                { title: "Hassle Free", desc: "Putting an end to all phone calls. Requesting for a truck is now placed in your palm, with instant pricing." },
                { title: "Smart Technology", desc: "We have simplified the complexity of trucking and keeping you informed when moving your cargo." },
                { title: "True Partnership", desc: "As we grow, our customers grow too. We develop our technology to create efficiency." },
                { title: "You Are Protected", desc: "Your cargo is protected by our comprehensive cargo insurance." },
              ].map((item, idx) => (
                <div key={idx} className="relative pl-6 border-l-4 border-[#F5F5F5] hover:border-[#F97316] transition-colors">
                  <h3 className="text-2xl font-black text-[#0B1F4A] mb-3 uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full lg:w-1/3 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#0B1F4A] translate-x-4 translate-y-4 border-2 border-[#0B1F4A]"></div>
              <Image 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600" 
                alt="Bowmenn Mobile App" 
                width={600}
                height={800}
                className="relative z-10 w-full max-w-[360px] h-auto border-4 border-[#0B1F4A] shadow-2xl grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. DOWNLOAD APP SECTION */}
      <section className="bg-[#0B1F4A] py-32 px-4 md:px-8 lg:px-16 text-center relative overflow-hidden border-b-4 border-white">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <span className="text-[#F97316] text-sm tracking-[0.2em] font-black uppercase mb-8 block">Download Our App</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter uppercase mb-16">
            Control your supply chain, Get Real-time updates and Manage your entire logistics process.
          </h2>
          <a 
            href="https://play.google.com/store/apps/details?id=com.bowmenn.trucking.droid" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:scale-105 transition-transform"
          >
            <Image 
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
              alt="Get it on Google Play" 
              width={240}
              height={96}
              className="h-24 w-auto"
            />
          </a>
        </div>
      </section>

      {/* 8. PARTNERS SECTION */}
      <section className="bg-white py-24 px-4 md:px-8 lg:px-16 text-center border-b-4 border-[#0B1F4A]">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-[#0B1F4A] font-black text-2xl uppercase tracking-widest mb-16">
            Over 100 businesses use our logistics solution to move cargo
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 items-center">
            {[
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888839/p7_b99vae.png",
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888839/p9_zphwwq.png",
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888839/p8_noadb4.png",
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888838/p2_g4kua1.png",
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888839/p3_sgp3vg.png",
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888838/p4_yvdq4z.png",
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888838/p1_rvlss8.png",
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888838/p7_1_zvssdm.png",
              "https://res.cloudinary.com/dtxtk0u9u/image/upload/v1782888838/p5_cm99ss.png"
            ].map((url, i) => (
              <div key={i} className="px-6 py-4 transition-transform hover:scale-105">
                <Image src={url} alt={`Partner ${i + 1}`} width={160} height={48} className="h-12 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA SECTION */}
      <section className="bg-[#F97316] py-32 px-4 md:px-8 lg:px-16 text-center border-b-4 border-[#0B1F4A]">
        <h2 className="text-5xl md:text-7xl font-black text-[#0B1F4A] mb-12 uppercase tracking-tighter leading-[0.9]">
          Ready to Ship<br />Your Cargo?
        </h2>
        <Link href="/register" className="inline-flex bg-[#0B1F4A] text-white font-black uppercase tracking-widest px-12 py-5 hover:bg-white hover:text-[#0B1F4A] border-4 border-transparent hover:border-[#0B1F4A] transition-colors">
          Book a Shipment
        </Link>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#0B1F4A] pt-24 pb-12 px-4 md:px-8 lg:px-16 text-gray-300">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Col 1 */}
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-[#F97316] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l4-2 4 2zM13 6h5l3 4v6a1 1 0 01-1 1h-1M6 20a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <span className="text-white text-3xl font-black tracking-tighter uppercase">Bowmenn</span>
            </div>
            <p className="text-lg leading-relaxed mb-8 text-gray-400 font-medium">
              Nigeria's No.1 Freight Shipping and Delivery Company, where Shippers pay less and Carriers Earn More.
            </p>
          </div>
          
          {/* Col 2 */}
          <div>
            <h4 className="text-white font-black text-xl uppercase tracking-widest mb-8 border-b-2 border-white/10 pb-4">Social</h4>
            <ul className="flex gap-4 font-bold text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" aria-label="X (formerly Twitter)">
                  <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" aria-label="YouTube">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 011.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418zM15.194 12L10 15V9l5.194 3z" clipRule="evenodd" /></svg>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"/></svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-black text-xl uppercase tracking-widest mb-8 border-b-2 border-white/10 pb-4">Site Links</h4>
            <ul className="space-y-4 font-bold text-gray-400">
              <li><a href="#about" className="hover:text-[#F97316] transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-[#F97316] transition-colors">Our Services</a></li>
              <li><a href="#" className="hover:text-[#F97316] transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-[#F97316] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div id="contact">
            <h4 className="text-white font-black text-xl uppercase tracking-widest mb-8 border-b-2 border-white/10 pb-4">Contact</h4>
            <ul className="space-y-6 font-bold text-gray-400">
              <li className="flex items-start gap-4">
                <div className="text-[#F97316] mt-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <span>6 Ladipo Kuku Street,<br/>Ikeja Lagos</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="text-[#F97316] mt-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <span>ICS Drive, Jabi Airport Junction,<br/>Abuja</span>
              </li>
              <li className="flex items-center gap-4 text-white">
                <div className="text-[#F97316]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.362-.271.527-.733.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <span className="text-xl tracking-wider">(+234) 9166770000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto pt-12 border-t-2 border-white/10 text-center font-bold text-gray-500 uppercase tracking-widest text-xs">
          Copyright 2026 &copy; Bowmenn. All Rights Reserved.
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="https://wa.me/2349166770000?text=Hello%20Bowmenn,%20I%20want%20to%20move%20goods"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 border-4 border-white"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      <ContactPanel />
    </div>
  );
}
