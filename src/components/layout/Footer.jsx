import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-2.5 px-6 bg-white border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-500">
      {/* Left: Copyright & Version */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-slate-600 font-medium">
          © {currentYear} Tecmi Vyapti. All rights reserved.
        </span>
        <span className="font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs text-[10.5px]">
          v1.0.0
        </span>
      </div>

      {/* Right: Design & Developed by TeCMi Vyapti */}
      <div className="flex items-center gap-2 font-medium text-slate-500">
        <span>Design &amp; Developed by</span>
        <img
          src="/assets/site-logo1.png"
          alt="TeCMi Vyapti"
          className="h-6 sm:h-7 w-auto object-contain inline-block"
        />
      </div>
    </footer>
  );
};

export default Footer;
