import type { Page } from '../types';
import { FaPhone, FaLocationDot, FaStar, FaArrowRight } from 'react-icons/fa6';

interface FooterProps {
  navigate: (page: Page) => void;
}

export default function Footer({ navigate }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-auto flex items-center justify-center shrink-0">
              <img src="/images/logo-footer.png" alt="TIFAOUT AUTO Logo" className="h-full max-h-11 object-contain drop-shadow-md" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-wider text-white font-display">TIFAOUT AUTO</div>
              <div className="text-[9px] tracking-[0.2em] uppercase font-bold text-blue-400">Injection Diesel · Agadir</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Société spécialisée dans la réparation, la révision sur banc d'essai certifié Bosch EPS 200 et la vente de pièces d'injection diesel au Maroc.
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
          <h4 className="text-xs tracking-widest uppercase font-bold text-white mb-4">Accès Rapides</h4>
          <ul className="space-y-2 text-xs">
            {[
              { label: 'Accueil', page: 'home' as Page },
              { label: 'Injecteurs Diesel', page: 'catalog' as Page },
              { label: 'Pompes Haute Pression', page: 'catalog' as Page },
              { label: 'Espace Client / Garagiste Pro', page: 'client' as Page },
              { label: ' Back-Office Admin', page: 'admin' as Page },
              { label: 'Contact & Atelier Agadir', page: 'contact' as Page },
            ].map(l => (
              <li key={l.label}>
                <button
                  onClick={() => navigate(l.page)}
                  className="hover:text-blue-400 transition-colors text-left font-semibold flex items-center gap-1.5"
                >
                  <span className="text-blue-500 text-[10px]">▸</span>
                  <span>{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Horaires */}
        <div>
          <h4 className="text-xs tracking-widest uppercase font-bold text-white mb-4">Horaires d'Ouverture</h4>
          <table className="w-full text-xs text-slate-400">
            <tbody className="divide-y divide-slate-900">
              {[
                { day: 'Lundi', h: '09h30 — 19h00' },
                { day: 'Mardi', h: '09h30 — 19h00' },
                { day: 'Mercredi', h: '09h30 — 19h00' },
                { day: 'Jeudi', h: '09h30 — 19h00' },
                { day: 'Vendredi', h: '09h30 — 19h00' },
                { day: 'Samedi', h: '09h30 — 13h00' },
                { day: 'Dimanche', h: 'Fermé', closed: true },
              ].map(row => (
                <tr key={row.day}>
                  <td className="py-1.5 font-semibold text-slate-300">{row.day}</td>
                  <td className={`py-1.5 text-right font-mono ${row.closed ? 'text-amber-400 font-bold' : ''}`}>{row.h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contact & Map */}
        <div className="space-y-3 text-xs">
          <h4 className="text-xs tracking-widest uppercase font-bold text-white mb-4">Atelier Agadir</h4>
          <p className="flex items-start gap-2 text-slate-300">
            <FaLocationDot className="text-blue-400 text-sm shrink-0 mt-0.5" />
            <span>70 Bd Abdelkrim EL Khattabi, Agadir 80000, Maroc</span>
          </p>
          <p className="flex items-center gap-2 text-slate-300">
            <FaPhone className="text-blue-400 text-xs shrink-0" />
            <a href="tel:+212525200665" className="font-mono font-bold text-blue-400 hover:underline">05 25 20 06 65</a>
          </p>
          <p className="flex items-center gap-2 text-slate-300">
            <FaStar className="text-amber-400 text-xs shrink-0" />
            <a href="https://maps.google.com/?q=TIFAOUT+AUTO+Agadir" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-semibold">
              4.5 / 5★ (18 avis Google)
            </a>
          </p>

          <button
            onClick={() => navigate('contact')}
            className="w-full py-3 mt-2 bg-blue-800 hover:bg-blue-900 text-white font-bold uppercase rounded-lg tracking-wider shadow-md text-[11px] flex items-center justify-center gap-2 transition-colors"
          >
            <span>Nous Contacter</span>
            <FaArrowRight className="text-[10px]" />
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-4">
        <div className="max-w-[500px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 TIFAOUT AUTO — Réparation & Pièces Injection Diesel Agadir Maroc</p>
          <p className="font-mono text-[11px] text-slate-600"></p>
        </div>
      </div>
    </footer>
  );
}
