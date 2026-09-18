import { useRef, useEffect, useState } from 'react';
import type { Page } from '../types';
import { useLanguage } from '../context/LanguageContext';
import WorkshopCarousel from '../components/WorkshopCarousel';
import {
  FaStar,
  FaShieldHalved,
  FaTruckFast,
  FaAward,
  FaArrowRight,
  FaArrowLeft,
  FaLocationDot,
  FaPhone,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa6';

interface AboutProps {
  navigate: (page: Page) => void;
}

const REVIEWS = [
  {
    name: 'Roy',
    role: 'Client Google — il y a 6 mois',
    rating: 5,
    text: "Jawad speaks great English and did an excellent job identifying and resolving my fuel issues within one day. Highly recommended.",
    lang: 'en',
  },
  {
    name: 'mehdi Aissaoui',
    role: 'Client Google — il y a 2 semaines',
    rating: 5,
    text: "Best service specifically Ayoube — top, très professionnel et good service. Highly recommended!",
    lang: 'fr',
  },
  {
    name: 'Hicham',
    role: 'Client Google — il y a 11 mois',
    rating: 5,
    text: "Meilleur spécialiste en injection diesel. Qualité de service et confiance. Merci haj aziz.",
    lang: 'fr',
  },
  {
    name: 'mohamed amechghal',
    role: 'Client Google — il y a 11 mois',
    rating: 5,
    text: "Meilleur service et bon traitement professionnel au domaine.",
    lang: 'fr',
  },
  {
    name: 'Centre Atlantique Formation',
    role: 'Client Google — il y a 11 mois',
    rating: 5,
    text: "أحسن خدمات ممكن تلقاها فمدينة أكادير و الجنوب عموما. (Le meilleur service que vous puissiez trouver à Agadir et dans le sud en général.)",
    lang: 'ar',
  },
  {
    name: 'قناة أرطغل',
    role: 'Client Google — il y a 11 mois',
    rating: 5,
    text: "خدمة جيدة و استقبال متميز برافوو (Bon service et accueil distingué — Bravo !)",
    lang: 'ar',
  },
  {
    name: 'Hicham Hicham',
    role: 'Client Google — il y a 11 mois',
    rating: 5,
    text: "Bon service et bonne équipe.",
    lang: 'fr',
  },
  {
    name: 'elyazid elfaidi',
    role: 'Client Google — il y a 11 mois',
    rating: 5,
    text: "Bon service, top top !",
    lang: 'fr',
  },
  {
    name: 'paradis cars',
    role: 'Local Guide · 7 avis — il y a 3 ans',
    rating: 5,
    text: "Bonne service.",
    lang: 'fr',
  },
  {
    name: 'marocain et fier',
    role: 'Local Guide · 31 avis — il y a 5 ans',
    rating: 5,
    text: "Diagnostic auto, réparation des injecteurs de tous types de voitures.",
    lang: 'fr',
  },
  {
    name: 'Jamal Barka',
    role: 'Client Google · 12 avis — il y a 6 ans',
    rating: 5,
    text: "Bon service.",
    lang: 'fr',
  },
  {
    name: 'Saraisrae Elfaidi',
    role: 'Client Google — il y a 11 mois',
    rating: 5,
    text: "خدمة رائعة (Service excellent !)",
    lang: 'ar',
  },
];

export default function About({ navigate }: AboutProps) {
  const { dict, isRTL, language } = useLanguage();
  const a = dict.about;

  const VALUE_ICONS = [
    <FaShieldHalved className="text-2xl text-blue-400" />,
    <FaAward className="text-2xl text-blue-400" />,
    <FaTruckFast className="text-2xl text-blue-400" />,
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: isRTL ? -380 : 380, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, isRTL]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">

      {/* ── HEADER ── */}
      <div className="bg-slate-800 border-b border-slate-700 text-white py-10 px-6 shadow-inner">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-400 mb-1">
            {language === 'ar' ? 'ورشة حقن الديزل — أكادير' : 'Atelier d’injection diesel — Agadir'}
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
            {a.headerTitle}
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl">
            {a.headerDesc}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-16">

        {/* ── QUI SOMMES-NOUS ── */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-3">{a.subtitle}</p>
            <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900 mb-6">
              {a.title}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {a.p1}
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {a.p2}
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              {a.p3}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {a.certifications.map(s => (
                <div key={s.label} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="font-display text-xl font-bold text-blue-900">{s.val}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-300">
            <WorkshopCarousel />
          </div>
        </section>

        {/* ── NOS VALEURS ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-1">{a.valuesSubtitle}</p>
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900">{a.valuesTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {a.valuesList.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 group hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-xl bg-slate-100 group-hover:bg-blue-900 flex items-center justify-center mb-5 transition-all">
                  {VALUE_ICONS[i]}
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-slate-900 mb-3">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── AVIS CLIENTS (SCROLL HORIZONTAL) ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-1">
                {dict.home.reviewsSubtitle}
              </p>
              <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900">{a.reviewsTitle}</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="font-display text-2xl font-black text-amber-500">4.5 / 5</div>
                <div className="text-xs text-slate-600">
                  <div className="flex text-amber-400 text-sm">★★★★½</div>
                  <div className="font-semibold text-[11px] text-slate-500">{dict.common.googleReviewsCount}</div>
                </div>
              </div>

              {/* Boutons de navigation gauche / droite */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={scrollLeft}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-all cursor-pointer"
                  title="Précédent"
                  aria-label="Précédent"
                >
                  {isRTL ? <FaChevronRight className="text-sm" /> : <FaChevronLeft className="text-sm" />}
                </button>
                <button
                  onClick={scrollRight}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-all cursor-pointer"
                  title="Suivant"
                  aria-label="Suivant"
                >
                  {isRTL ? <FaChevronLeft className="text-sm" /> : <FaChevronRight className="text-sm" />}
                </button>
              </div>
            </div>
          </div>

          {/* Container Scroll Horizontal Automatique */}
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="w-[300px] sm:w-[360px] shrink-0 snap-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400 text-sm">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <FaStar key={idx} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic min-h-[60px]">
                    "{r.text}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate font-semibold">{r.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Boutons mobile */}
          <div className="mt-3 flex sm:hidden justify-center gap-3">
            <button
              onClick={scrollLeft}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-700 active:bg-slate-100"
            >
              {isRTL ? <FaChevronRight className="text-xs" /> : <FaChevronLeft className="text-xs" />} {dict.common.prev}
            </button>
            <button
              onClick={scrollRight}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-700 active:bg-slate-100"
            >
              {dict.common.next} {isRTL ? <FaChevronLeft className="text-xs" /> : <FaChevronRight className="text-xs" />}
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://maps.app.goo.gl/RrtYxiBw1udYLv9b6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-all shadow-sm"
            >
              <FaStar className="text-amber-400" />
              {dict.home.reviewsGoogleLink}
            </a>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-12 text-center">
          <h3 className="font-display text-3xl font-extrabold uppercase text-slate-900 mb-4">
            {a.visitTitle}
          </h3>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto mb-2">
            {a.visitAddress}
          </p>
          <p className="text-slate-500 text-xs mb-8">{a.visitBadge}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+212525200665"
              className="px-8 py-4 bg-blue-800 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 border border-blue-600 font-mono"
            >
              <FaPhone className="text-xs" />
              <span>05 25 20 06 65</span>
            </a>
            <button
              onClick={() => navigate('contact')}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 font-mono"
            >
              <FaLocationDot className="text-xs" />
              <span>{a.viewSchedule}</span>
              {isRTL ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
