import type { Page } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { FaPhone, FaLocationDot, FaStar, FaArrowRight, FaArrowLeft } from 'react-icons/fa6';

interface FooterProps {
  navigate: (page: Page) => void;
}

export default function Footer({ navigate }: FooterProps) {
  const { dict, isRTL, language } = useLanguage();

  const DAYS = language === 'ar' ? [
    { day: 'الإثنين', h: '09:30 — 19:00' },
    { day: 'الثلاثاء', h: '09:30 — 19:00' },
    { day: 'الأربعاء', h: '09:30 — 19:00' },
    { day: 'الخميس', h: '09:30 — 19:00' },
    { day: 'الجمعة', h: '09:30 — 19:00' },
    { day: 'السبت', h: '09:30 — 13:00' },
    { day: 'الأحد', h: 'مغلق', closed: true },
  ] : [
    { day: 'Lundi', h: '09h30 — 19h00' },
    { day: 'Mardi', h: '09h30 — 19h00' },
    { day: 'Mercredi', h: '09h30 — 19h00' },
    { day: 'Jeudi', h: '09h30 — 19h00' },
    { day: 'Vendredi', h: '09h30 — 19h00' },
    { day: 'Samedi', h: '09h30 — 13h00' },
    { day: 'Dimanche', h: 'Fermé', closed: true },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-auto flex items-center justify-center shrink-0">
              <img
                src="https://res.cloudinary.com/dgv5kksja/image/upload/v1788802839/tifaout-auto-assets/zapfz3h04w4afiwryakn.png"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                alt="TIFAOUT AUTO Logo"
                className="h-full max-h-14 object-contain drop-shadow-md"
              />
            </div>
            <div>
              <div className="text-2xl font-black tracking-wider text-white font-display">TIFAOUT AUTO</div>
              <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-blue-400 mt-0.5">
                {dict.nav.tagline}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {dict.footer.desc}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {['Bosch', 'Delphi', 'Denso', 'Zexel'].map(b => (
              <span key={b} className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-900 text-slate-400 border border-slate-800">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs tracking-widest uppercase font-bold text-white mb-4">{dict.footer.quickLinks}</h4>
          <ul className="space-y-2 text-xs">
            {[
              { label: dict.nav.home, page: 'home' as Page },
              { label: dict.nav.categories.injecteur, page: 'catalog' as Page },
              { label: dict.nav.categories.pompe, page: 'catalog' as Page },
              { label: dict.nav.services, page: 'services' as Page },
              { label: dict.nav.about, page: 'about' as Page },
              { label: dict.nav.quote, page: 'devis' as Page },
              { label: dict.nav.contact, page: 'contact' as Page },
            ].map(l => (
              <li key={l.label}>
                <button
                  onClick={() => navigate(l.page)}
                  className="hover:text-blue-400 transition-colors text-left rtl:text-right font-semibold flex items-center gap-1.5"
                >
                  <span className="text-blue-500 text-[10px]">{isRTL ? '◂' : '▸'}</span>
                  <span>{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Horaires */}
        <div>
          <h4 className="text-xs tracking-widest uppercase font-bold text-white mb-4">{dict.contact.hoursTitle}</h4>
          <table className="w-full text-xs text-slate-400">
            <tbody className="divide-y divide-slate-900">
              {DAYS.map(row => (
                <tr key={row.day}>
                  <td className="py-1.5 font-semibold text-slate-300 text-left rtl:text-right">{row.day}</td>
                  <td className={`py-1.5 text-right rtl:text-left font-mono ${row.closed ? 'text-amber-400 font-bold' : ''}`} dir="ltr">{row.h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contact & Map */}
        <div className="space-y-3 text-xs">
          <h4 className="text-xs tracking-widest uppercase font-bold text-white mb-4">{dict.footer.contact}</h4>
          <p className="flex items-start gap-2 text-slate-300">
            <FaLocationDot className="text-blue-400 text-sm shrink-0 mt-0.5" />
            <span>{dict.footer.address}</span>
          </p>
          <p className="flex items-center gap-2 text-slate-300">
            <FaPhone className="text-blue-400 text-xs shrink-0" />
            <a href={`tel:${dict.common.phoneIntl}`} className="font-mono font-bold text-blue-400 hover:underline" dir="ltr">
              {dict.common.phone}
            </a>
          </p>
          <p className="flex items-center gap-2 text-slate-300">
            <FaStar className="text-amber-400 text-xs shrink-0" />
            <a href="https://maps.app.goo.gl/RrtYxiBw1udYLv9b6" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-semibold">
              {dict.common.rating}★ ({dict.common.googleReviewsCount})
            </a>
          </p>

          <button
            onClick={() => navigate('contact')}
            className="w-full py-3 mt-2 bg-blue-800 hover:bg-blue-900 text-white font-bold uppercase rounded-lg tracking-wider shadow-md text-[11px] flex items-center justify-center gap-2 transition-colors"
          >
            <span>{dict.nav.contact}</span>
            {isRTL ? <FaArrowLeft className="text-[10px]" /> : <FaArrowRight className="text-[10px]" />}
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-4">
        <div className="max-w-[700px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-center text-center text-xs text-slate-500 gap-2">
          <p>© 2026 TIFAOUT AUTO — {dict.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
