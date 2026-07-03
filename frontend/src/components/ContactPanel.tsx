"use client";

import { useEffect, useState } from "react";

export default function ContactPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if URL already has the hash
    const handleHashChange = () => {
      if (window.location.hash === "#contact") {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleHashChange();
    
    window.addEventListener("hashchange", handleHashChange);
    
    // Intercept clicks on links pointing to #contact
    const handleMouseClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement;
      // Traverse up to find the closest A tag if clicked on child elements
      while (target && target.tagName !== "A" && target.parentElement) {
        target = target.parentElement as HTMLElement;
      }
      if (target && target.tagName === "A" && target.getAttribute("href") === "#contact") {
        e.preventDefault();
        setIsOpen(true);
        window.history.pushState(null, "", "#contact");
      }
    };
    
    document.addEventListener("click", handleMouseClick);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleMouseClick);
    };
  }, []);

  const closePanel = () => {
    setIsOpen(false);
    // Remove the hash from URL without reloading the page
    window.history.pushState(null, "", window.location.pathname + window.location.search);
  };

  // Keep it hidden in SSR and until hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closePanel}
      />
      
      {/* Slide-over Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[101] transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 md:p-8 flex flex-col min-h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-black text-[#0B1F4A] uppercase tracking-wider">Contact Us</h2>
            <button 
              onClick={closePanel} 
              className="text-gray-400 hover:text-[#F97316] transition-colors p-2 -mr-2"
              aria-label="Close panel"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Form */}
          <form 
            className="flex flex-col gap-5 flex-1" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              setIsOpen(false);
              setIsSubmitted(true);
              e.currentTarget.reset();
              window.history.pushState(null, "", window.location.pathname + window.location.search);
            }}
          >
            <div>
              <label className="block text-sm font-bold text-[#0B1F4A] mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full border border-gray-300 rounded px-4 py-3 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors text-gray-800" 
                placeholder="John Doe" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#0B1F4A] mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full border border-gray-300 rounded px-4 py-3 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors text-gray-800" 
                placeholder="john@example.com" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#0B1F4A] mb-1">Enquiry Type</label>
              <select className="w-full border border-gray-300 rounded px-4 py-3 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors text-gray-800 bg-white">
                <option value="general">General Enquiry</option>
                <option value="shipping">Freight Shipping</option>
                <option value="carrier">Carrier Opportunities</option>
                <option value="support">Support</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#0B1F4A] mb-1">Message</label>
              <textarea 
                required 
                rows={5} 
                className="w-full border border-gray-300 rounded px-4 py-3 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors text-gray-800 resize-none" 
                placeholder="How can we help you today?"
              ></textarea>
            </div>
            
            <div className="mt-auto pt-8">
              <button 
                type="submit" 
                className="w-full bg-[#F97316] text-white font-bold text-lg uppercase tracking-wider py-4 rounded hover:bg-[#e06512] transition-colors shadow-lg shadow-orange-500/30"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <div 
        className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-300 ${
          isSubmitted ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Modal Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSubmitted(false)}></div>
        
        {/* Modal Content */}
        <div className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-500 delay-100 ${
          isSubmitted ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        }`}>
          <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            {/* Outer animated rings */}
            <div className="absolute inset-0 bg-[#F97316]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-2 bg-[#F97316]/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-[#F97316]/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Core glowing circle */}
            <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-[#F97316] to-[#ff984a] rounded-full flex items-center justify-center shadow-2xl shadow-[#F97316]/40">
              <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[pulse_2s_ease-in-out_infinite]" />
              </svg>
            </div>

            {/* Orbiting confetti / sparks */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100">
              <circle cx="15" cy="50" r="3" fill="#0B1F4A" className="animate-pulse" />
              <circle cx="85" cy="30" r="4" fill="#0B1F4A" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <circle cx="50" cy="10" r="2.5" fill="#F97316" className="animate-bounce" />
              <circle cx="70" cy="85" r="3.5" fill="#F97316" className="animate-pulse" style={{ animationDelay: '1s' }} />
              <circle cx="30" cy="80" r="2" fill="#0B1F4A" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-[#0B1F4A] uppercase tracking-wide mb-2">Message Sent!</h3>
          <p className="text-gray-600 font-medium mb-8">
            Thank you for reaching out. We've received your enquiry and our team will get back to you shortly.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-[#0B1F4A] text-white font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-[#152e61] transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
