import { getOpeningStatus } from '../utils/hours';
import { FaPhoneAnim } from 'react-icons/fa6';
import { FaPhone } from 'react-icons/fa6';

export default function StickyPhoneButton() {
  const opening = getOpeningStatus();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Main sticky phone button */}
      <a
        href="tel:+212525200665"
        className="flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl font-bold text-sm tracking-wide transition-all duration-300 group border-2 border-white/30 hover:scale-105 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white"
      >
        <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
          <FaPhone className="text-white text-base animate-pulse" />
          {opening.isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-ping" />
          )}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Appeler l'Atelier</span>
          <span className="text-sm font-extrabold tracking-wider font-mono">05 25 20 06 65</span>
        </div>
      </a>
    </div>
  );
}
