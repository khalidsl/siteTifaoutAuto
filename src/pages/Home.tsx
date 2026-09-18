import { useState, useEffect, useRef } from 'react';
import type { Page } from '../types';
import { products as staticProducts, getCategoryLabel } from '../data/products';
import { getOpeningStatus } from '../utils/hours';
import { getProductsApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import WorkshopCarousel from '../components/WorkshopCarousel';
import {
  FaWrench,
  FaGears,
  FaGaugeHigh,
  FaStore,
  FaAward,
  FaStar,
  FaCircleCheck,
  FaTruckFast,
  FaPhone,
  FaShieldHalved,
  FaArrowRight,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaLocationDot,
} from 'react-icons/fa6';

interface HomeProps {
  navigate: (page: Page) => void;
  onProductSelect: (id: string) => void;
  onCategoryNav: (cat: string) => void;
}

// Hero slideshow images (TIFAOUT AUTO Cloudinary Assets)
const HERO_IMAGES = [
  'https://res.cloudinary.com/dgv5kksja/image/upload/v1788803619/tifaout-auto-assets/ihicz4z5zfceuawu409x.jpg',
  'https://res.cloudinary.com/dgv5kksja/image/upload/v1788803620/tifaout-auto-assets/q6oyvsgmk2ug1yz8zedx.jpg',
  'https://res.cloudinary.com/dgv5kksja/image/upload/v1788803620/tifaout-auto-assets/cam9ermqeph4mceuxe3m.jpg',
  'https://res.cloudinary.com/dgv5kksja/image/upload/v1788803621/tifaout-auto-assets/tinmti6hi7ytltlnezaq.jpg',
];

// Verified Google Reviews
const REVIEWS = [
  {
    name: "Ayoub Benali",
    role: "Transporteur Pro · Agadir",
    text: "Service irréprochable ! Passage au banc Bosch DCI 200 de 4 injecteurs Common Rail Peugeot Partner. Diagnostic rapide et rapport imprimé fourni. Je recommande vivement.",
    rating: 5,
  },
  {
    name: "Garage Hassan & Fils",
    role: "Garagiste Partenaire · Inezgane",
    text: "Nous envoyons toutes nos pompes Haute Pression et injecteurs chez TIFAOUT AUTO depuis 3 ans. Travail propre, délais respectés et garantie atelier de 6 mois.",
    rating: 5,
  },
  {
    name: "Rachid El Amrani",
    role: "Propriétaire Dacia Duster · Tiznit",
    text: "Problème de fumée noire et perte de puissance résolu en 24h. Deux injecteurs reconditionnés à neuf avec codage IMA. Ma voiture a retrouvé toutes ses performances.",
    rating: 5,
  },
  {
    name: "Karim Tazi",
    role: "Flotte de Transport · Taroudant",
    text: "Stock impressionnant de pièces d'origine Bosch et Delphi. Livraison sous 24h à Taroudant. Un vrai spécialiste de l'injection diesel dans le Souss.",
    rating: 5,
  },
];

const STATIC_FEATURED = staticProducts.slice(0, 4);

export default function Home({ navigate, onProductSelect, onCategoryNav }: HomeProps) {
  const opening = getOpeningStatus();
  const { dict, isRTL, language } = useLanguage();

  // Produits vedettes chargés depuis l'API (fallback: données statiques)
  const [featured, setFeatured] = useState<any[]>(STATIC_FEATURED);
  const [productsList, setProductsList] = useState<any[]>(staticProducts);

  useEffect(() => {
    getProductsApi({ limit: 100 })
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data.products ?? []);
        if (list.length > 0) {
          setProductsList(list);
          setFeatured(list.slice(0, 4));
        }
      })
      .catch(() => {
        // Si l'API est hors ligne, on garde les données statiques
      });
  }, []);

  // Hero background cinematic slideshow
  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Reviews horizontal auto-scroll
  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  const [isReviewsPaused, setIsReviewsPaused] = useState(false);

  useEffect(() => {
    if (isReviewsPaused) return;

    const interval = setInterval(() => {
      if (reviewsScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = reviewsScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          reviewsScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          reviewsScrollRef.current.scrollBy({ left: isRTL ? -380 : 380, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isReviewsPaused, isRTL]);

  const scrollReviewsLeft = () => {
    if (reviewsScrollRef.current) {
      reviewsScrollRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollReviewsRight = () => {
    if (reviewsScrollRef.current) {
      reviewsScrollRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  const HOME_SERVICES = [
    {
      icon: <FaWrench className="text-xl text-blue-400" />,
      title: language === 'ar' ? 'إصلاح وتجديد الحاقنات' : "Réparation d'Injecteurs",
      desc: language === 'ar' ? 'تفكيك كامل، تنظيف بالموجات فوق الصوتية، استبدال القطع المتآكلة ومعايرة على بنك Bosch DCI 200.' : "Démontage complet, nettoyage ultrasons, remplacement pièces d'usure, calibration et test sur banc Bosch DCI 200. Toutes marques : Bosch, Delphi, Denso, Zexel.",
      detail: language === 'ar' ? 'المدة : 24 — 48 ساعة' : "Délai : 24 — 48h",
    },
    {
      icon: <FaGears className="text-xl text-blue-400" />,
      title: language === 'ar' ? 'إصلاح مضخات الضغط العالي' : "Réparation Pompes HP",
      desc: language === 'ar' ? 'تجديد مضخات CP3, CP4, DFP مع فحص المكابس والكامات ومنظم الضغط DRV واختبار الضغط الشامل.' : "Reconditionnement de pompes haute pression CP3, CP4, DFP — vérification pistons, cames, régulateur DRV, et soupape refoulement. Test pression complet.",
      detail: language === 'ar' ? 'المدة : 48 — 72 ساعة' : "Délai : 48 — 72h",
    },
    {
      icon: <FaGaugeHigh className="text-xl text-blue-400" />,
      title: language === 'ar' ? 'فحص دقيق على منصات الاختبار' : "Test sur Banc d'Essai",
      desc: language === 'ar' ? 'تشخيص معتمد على منصات Bosch DCI 200 و Delphi لقياس تدفق الوقود ورجوع الديزل وسرعة الاستجابة.' : "Diagnostic certifié sur banc Bosch DCI 200 et Delphi. Mesure de débit, pression d'injection, retour carburant, et temps de réponse.",
      detail: language === 'ar' ? 'نتائج فورية' : "Résultats immédiats",
    },
    {
      icon: <FaStore className="text-xl text-blue-400" />,
      title: language === 'ar' ? 'بيع القطع المجددة والأصلية' : "Vente Reconditionnés",
      desc: language === 'ar' ? 'مخزون دائم من الحاقنات والمضخات المجددة مع ضمان 6 أشهر وتوصيل سريع لجميع أنحاء المغرب.' : "Stock permanent d'injecteurs et pompes reconditionnés garantis 6 mois. Échange standard disponible. Livraison sur tout le Maroc sous 24h.",
      detail: language === 'ar' ? 'ضمان 6 أشهر' : "Garantie 6 mois",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* ─── HERO SECTION ─── */}
      <section className="relative h-screen flex items-center bg-slate-950 text-white overflow-hidden">
        {/* Background: cinematic garage slideshow with fade + slow zoom */}
        <div className="absolute inset-0 overflow-hidden">
          {HERO_IMAGES.map((src, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-[1600ms] ease-in-out ${
                i === heroSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={src}
                alt={`Atelier TIFAOUT AUTO garage ${i + 1}`}
                className={`w-full h-full object-cover transition-transform duration-[7000ms] ease-linear ${
                  i === heroSlide ? 'scale-110' : 'scale-100'
                }`}
              />
            </div>
          ))}

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />

          {/* Hero slide indicators at bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === heroSlide ? 'w-8 bg-blue-500' : 'w-3 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Image garage ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative max-w-[1440px] mx-auto px-6 pt-[100px] pb-10 w-full h-full grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-wider shadow-lg">
              <FaAward className="text-amber-400 text-sm" />
              <span>{dict.home.heroBadge}</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase leading-none tracking-tight mb-6 text-white drop-shadow-md">
              {dict.home.heroTitle1}<br />
              <span className="text-blue-400 drop-shadow">{dict.home.heroTitle2}</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl mb-8 leading-relaxed drop-shadow">
              {dict.home.heroDesc}
            </p>

            {/* Real-time status pill */}
            <div className="inline-flex items-center gap-3 mb-10 px-4 py-2.5 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg text-xs shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: opening.isOpen ? '#22c55e' : '#d97706' }} />
              <span className="font-bold text-white uppercase">{opening.isOpen ? dict.common.openNow : dict.common.closedNow}</span>
              <span className="text-slate-300 font-mono">| {opening.statusText}</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-16">
              <button
                onClick={() => navigate('catalog')}
                className="px-8 py-4 text-xs font-extrabold tracking-widest uppercase rounded-lg bg-blue-800 hover:bg-blue-900 text-white shadow-xl transition-all transform hover:-translate-y-0.5 border border-blue-700 flex items-center gap-2"
              >
                <span>{dict.common.seeCatalog}</span>
                {isRTL ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
              </button>
              <button
                onClick={() => navigate('contact')}
                className="px-8 py-4 text-xs font-extrabold tracking-widest uppercase rounded-lg bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl border border-slate-700 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <FaLocationDot className="text-amber-400 text-xs" />
                <span>{dict.nav.contact}</span>
              </button>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/20">
              {[
                { val: '+9', label: dict.home.statsExperience, color: '#60a5fa' },
                { val: '+5 000', label: dict.home.statsInjectors, color: '#60a5fa' },
                { val: '4.5★', label: dict.common.googleReviewsCount, color: '#fbbf24' },
                { val: '24h', label: dict.home.statsDelivery, color: '#60a5fa' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-extrabold drop-shadow" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-xs uppercase font-bold text-slate-200 mt-1 drop-shadow">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Workshop Info Box in Hero */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700 p-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-400 tracking-wider border-b border-slate-800 pb-3">
                <FaShieldHalved className="text-blue-400 text-sm" />
                <span>{dict.home.engagementsSubtitle}</span>
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-white">
                {dict.home.engagementsTitle}
              </h3>

              <ul className="space-y-3 text-xs text-slate-300">
                {dict.home.engagements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <FaCircleCheck className="text-blue-400 text-sm shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-slate-800">
                <a
                  href={`tel:${dict.common.phoneIntl}`}
                  className="w-full py-3.5 bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg text-center flex items-center justify-center gap-2 shadow-lg transition-colors font-mono"
                  dir="ltr"
                >
                  <FaPhone className="text-xs" />
                  <span>{dict.common.callUs} : {dict.common.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES SECTION ─── */}
      <section id="services" className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-2">{dict.home.servicesSubtitle}</p>
              <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900">
                {dict.home.servicesTitle}
              </h2>
            </div>
            <button
              onClick={() => navigate('contact')}
              className="text-xs font-bold uppercase tracking-wider text-blue-800 hover:text-blue-900 transition-colors flex items-center gap-1.5"
            >
              <span>{dict.nav.contact}</span>
              {isRTL ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOME_SERVICES.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 p-6 flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  <div className="mb-6 w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-white transition-all shadow-sm">
                    {s.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase text-slate-900 mb-3 tracking-wide">
                    {s.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-6">
                    {s.desc}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-blue-900">{s.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-2">
                {dict.home.featuredSubtitle}
              </p>
              <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900">
                {dict.home.featuredTitle}
              </h2>
            </div>
            <button
              onClick={() => navigate('catalog')}
              className="text-xs font-bold uppercase tracking-wider text-blue-800 hover:text-blue-900 transition-colors flex items-center gap-1.5"
            >
              <span>{dict.nav.allCatalog}</span>
              {isRTL ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => {
              const pId = p._id || p.id;
              return (
                <ProductCard key={pId} product={p} onClick={() => onProductSelect(pId)} isRTL={isRTL} language={language} dict={dict} />
              );
            })}
          </div>

          {/* Category Quick Pills */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { cat: 'injecteur', label: dict.nav.categories.injecteur, count: productsList.filter(p => p.category === 'injecteur').length },
              { cat: 'pompe', label: dict.nav.categories.pompe, count: productsList.filter(p => p.category === 'pompe').length },
              { cat: 'capteur', label: dict.nav.categories.capteur, count: productsList.filter(p => p.category === 'capteur').length },
              { cat: 'joint', label: dict.nav.categories.joint, count: productsList.filter(p => p.category === 'joint').length },
              { cat: 'regulateur', label: dict.nav.categories.regulateur, count: productsList.filter(p => p.category === 'regulateur').length },
            ].map(c => (
              <button
                key={c.cat}
                onClick={() => onCategoryNav(c.cat)}
                className="py-3 px-4 rounded-xl bg-slate-50 hover:bg-blue-800 hover:text-white border border-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-between shadow-sm group"
              >
                <span className="truncate">{c.label}</span>
                <span className="px-2 py-0.5 rounded-md bg-white group-hover:bg-blue-900 text-slate-600 group-hover:text-white text-[10px] font-mono shrink-0 ml-1 rtl:mr-1">
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT WORKSHOP WITH ANIMATED IMAGE CAROUSEL ─── */}
      <section id="about" className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-3">
              {dict.about.subtitle}
            </p>
            <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900 mb-6">
              {dict.about.title}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {dict.about.p1}
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              {dict.about.p2}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {dict.about.certifications.map(s => (
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
        </div>
      </section>

      {/* ─── REVIEWS / TESTIMONIALS (SCROLL HORIZONTAL) ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-2">{dict.home.reviewsSubtitle}</p>
              <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900">
                {dict.home.reviewsTitle}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://maps.app.goo.gl/RrtYxiBw1udYLv9b6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl shadow-sm transition-all"
              >
                <div className="font-display text-2xl font-black text-amber-500">4.5 / 5</div>
                <div className="text-xs text-slate-600">
                  <div className="flex text-amber-400 text-sm">★★★★½</div>
                  <div className="font-semibold text-[11px] text-slate-500">18 {dict.contact.verifiedReviews} ↗</div>
                </div>
              </a>

              {/* Navigation controls */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={scrollReviewsLeft}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-all cursor-pointer"
                  title="Précédent"
                  aria-label="Précédent"
                >
                  {isRTL ? <FaChevronRight className="text-sm" /> : <FaChevronLeft className="text-sm" />}
                </button>
                <button
                  onClick={scrollReviewsRight}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-blue-800 hover:text-white hover:border-blue-800 transition-all cursor-pointer"
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
            ref={reviewsScrollRef}
            onMouseEnter={() => setIsReviewsPaused(true)}
            onMouseLeave={() => setIsReviewsPaused(false)}
            onTouchStart={() => setIsReviewsPaused(true)}
            onTouchEnd={() => setIsReviewsPaused(false)}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="w-[300px] sm:w-[360px] shrink-0 snap-start p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
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
                <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
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
              onClick={scrollReviewsLeft}
              className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-700 active:bg-slate-200"
            >
              {isRTL ? <FaChevronRight className="text-xs" /> : <FaChevronLeft className="text-xs" />} {dict.common.prev}
            </button>
            <button
              onClick={scrollReviewsRight}
              className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 shadow-sm flex items-center gap-1.5 text-xs font-bold text-slate-700 active:bg-slate-200"
            >
              {dict.common.next} {isRTL ? <FaChevronLeft className="text-xs" /> : <FaChevronRight className="text-xs" />}
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://maps.app.goo.gl/RrtYxiBw1udYLv9b6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-all shadow-sm"
            >
              <FaStar className="text-amber-400" />
              {dict.home.reviewsGoogleLink}
            </a>
          </div>
        </div>
      </section>

      {/* ─── URGENT CONTACT CTA BANNER ─── */}
      <section className="bg-slate-900 text-white py-16 px-6 border-t border-slate-800">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left rtl:md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <FaCircleCheck className="text-green-400" />
              <span>{dict.home.ctaBadge}</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wide">
              {dict.home.ctaTitle}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              {dict.home.ctaDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate('devis')}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl font-mono"
            >
              {dict.common.getQuote}
            </button>
            <a
              href={`tel:${dict.common.phoneIntl}`}
              className="w-full sm:w-auto px-8 py-4 bg-blue-800 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 border border-blue-600 font-mono"
              dir="ltr"
            >
              <FaPhone className="text-xs" />
              <span>{dict.common.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  product,
  onClick,
  isRTL,
  language,
  dict
}: {
  product: any;
  onClick: () => void;
  isRTL?: boolean;
  language?: string;
  dict: any;
}) {
  const inStock = product.stock !== undefined ? Number(product.stock) > 0 : (product.inStock ?? true);
  const refCode = product.reference || product.ref || '';
  const price = Number(product.price) || 0;
  const image = product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format';

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden text-left rtl:text-right transition-all duration-300 group flex flex-col justify-between"
    >
      <div>
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex flex-col gap-1">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-blue-800 text-white shadow">
              {product.brand}
            </span>
            {product.isReconditioned && (
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-amber-500 text-slate-950 shadow">
                {dict.common.reconditioned}
              </span>
            )}
            {product.isNewPart && (
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-600 text-white shadow">
                {dict.common.newPart}
              </span>
            )}
          </div>
          {!inStock && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-white text-slate-800 rounded-md">
                {dict.common.onOrder}
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">
            {getCategoryLabel(product.category)}
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-800 transition-colors line-clamp-2">
            {product.name}
          </h4>
          {refCode && <div className="text-xs font-mono text-slate-500 mb-3">{dict.productDetail.reference} {refCode}</div>}
        </div>
      </div>

      <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold text-slate-900">
            {price.toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-MA')} {dict.common.mad}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-slate-400 line-through">
              {Number(product.oldPrice).toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-MA')}
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-blue-800 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform flex items-center gap-1">
          <span>{dict.common.viewDetails}</span>
          {isRTL ? <FaArrowLeft className="text-[10px]" /> : <FaArrowRight className="text-[10px]" />}
        </span>
      </div>
    </button>
  );
}