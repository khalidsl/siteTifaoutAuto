import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaExpand, FaCircleCheck } from 'react-icons/fa6';

interface Slide {
  id: number;
  url: string;
  title: string;
  subtitle: string;
  badge: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    url: '/images/image-dci.jpg',
    title: 'Banc d\'Essai & Injecteur Common Rail DCI',
    subtitle: 'Test de pression haute précision et diagnostic électronique certifié',
    badge: 'SYSTÈME DCI / COMMON RAIL',
  },
  {
    id: 2,
    url: '/images/dci-200-with-keyboard-monitor-testing.jpg',
    title: 'Banc Officiel Bosch EPS 200',
    subtitle: 'Calibration en temps réel de 250 à 1800 bar selon spécifications OEM',
    badge: 'BANC CERTIFIÉ BOSCH',
  },
  {
    id: 3,
    url: '/images/dci200-travail.jpg',
    title: 'Nettoyage Ultrasons & Reconditionnement',
    subtitle: 'Remplacement systématique des buses, valves et joints par des pièces d\'origine',
    badge: 'RECONDITIONNEMENT A NOUVEAU',
  },
  {
    id: 4,
    url: '/images/dci200.jpg',
    title: 'Pompes Haute Pression Bosch & Delphi',
    subtitle: 'Révision intégrale des pompes CP1, CP3, CP4, DFP et régulateurs DRV',
    badge: 'POMPES HAUTE PRESSION',
  },
];

export default function WorkshopCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const current = SLIDES[currentIndex];

  return (
    <div
      className="relative w-full h-[440px] rounded-2xl overflow-hidden shadow-2xl border border-slate-300 group bg-slate-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Slide Images */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
            index === currentIndex
              ? 'opacity-100 scale-100 z-10'
              : 'opacity-0 scale-105 pointer-events-none z-0'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover filter contrast-105 brightness-90"
          />
          {/* Subtle gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
      ))}

      {/* Top Badge Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-amber-400 border border-amber-500/40 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          {current.badge}
        </span>
      </div>

      {/* Slide Counter Pill */}
      <div className="absolute top-4 right-4 z-20 font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700">
        {currentIndex + 1} / {SLIDES.length}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-slate-700 shadow-xl opacity-80 group-hover:opacity-100 transition-all transform hover:scale-110"
        aria-label="Slide précédente"
      >
        <FaChevronLeft className="text-sm" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-slate-700 shadow-xl opacity-80 group-hover:opacity-100 transition-all transform hover:scale-110"
        aria-label="Slide suivante"
      >
        <FaChevronRight className="text-sm" />
      </button>

      {/* Bottom Content Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-6 z-20 text-white space-y-2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <h4 className="font-display text-2xl font-bold uppercase tracking-wide text-white drop-shadow flex items-center gap-2">
          <FaCircleCheck className="text-blue-400 text-lg shrink-0" />
          {current.title}
        </h4>
        <p className="text-slate-300 text-xs font-medium max-w-xl leading-relaxed">
          {current.subtitle}
        </p>

        {/* Carousel Progress Indicators (Dots / Bars) */}
        <div className="flex items-center gap-2 pt-3">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-blue-500' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Aller à la slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
