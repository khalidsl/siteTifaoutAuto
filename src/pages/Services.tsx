import type { Page } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  FaWrench,
  FaGaugeHigh,
  FaArrowRight,
  FaArrowLeft,
  FaLocationDot,
  FaCircleCheck,
  FaShieldHalved,
  FaTruckFast,
  FaBoxOpen,
  FaUserGear,
  FaHandshake,
  FaBullseye,
} from 'react-icons/fa6';

interface ServicesProps {
  navigate: (page: Page) => void;
}

export default function Services({ navigate }: ServicesProps) {
  const { dict, isRTL, language } = useLanguage();
  const s = dict.services;

  const VALUE_ICONS = [
    <FaBoxOpen className="text-2xl text-blue-400" />,
    <FaGaugeHigh className="text-2xl text-blue-400" />,
    <FaUserGear className="text-2xl text-blue-400" />,
    <FaHandshake className="text-2xl text-blue-400" />,
    <FaBullseye className="text-2xl text-blue-400" />,
  ];

  const EQUIP_IMAGES = [
    "https://res.cloudinary.com/dgv5kksja/image/upload/v1789575941/tifaout-auto-assets/tifaout-bosch-dci200.jpg",
    "https://res.cloudinary.com/dgv5kksja/image/upload/v1788802842/tifaout-auto-assets/ahnamk48wpjwygnqmyou.jpg",
    "https://res.cloudinary.com/dgv5kksja/image/upload/v1788802841/tifaout-auto-assets/awd8mq9azybs5kyxbi7f.jpg"
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">

      {/* ── HEADER ── */}
      <div className="bg-slate-800 border-b border-slate-700 text-white py-10 px-6 shadow-inner">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-400 mb-1">
            {language === 'ar' ? 'مركز ديزل معتمد — أكادير' : 'Bosch Diesel Service — Agadir'}
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
            {s.headerTitle}
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl">
            {s.headerDesc}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-16">

        {/* ── NOS PRESTATIONS ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-1">{s.systemsSubtitle}</p>
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900">{s.systemsTitle}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services list */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center shrink-0">
                  <FaWrench className="text-white text-sm" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-slate-900">{s.systemsCardTitle}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {s.systemsList.map((service, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <FaCircleCheck className="text-blue-600 text-sm shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick facts */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaShieldHalved className="text-blue-600 text-lg" />
                  <h4 className="font-bold uppercase text-slate-900 text-sm">{s.commitmentsTitle}</h4>
                </div>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <FaCircleCheck className="text-green-500 shrink-0 mt-0.5" />
                    <span>{language === 'ar' ? 'منصة اختبار معتمدة ' : 'Banc certifié '}<strong className="text-slate-800">Bosch DCI 200</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCircleCheck className="text-green-500 shrink-0 mt-0.5" />
                    <span>{dict.common.guarantee6Months}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCircleCheck className="text-green-500 shrink-0 mt-0.5" />
                    <span>{language === 'ar' ? 'قطع غيار أصلية ' : 'Pièces d’origine '}<strong className="text-slate-800">Bosch / Delphi</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaTruckFast className="text-amber-500 shrink-0 mt-0.5" />
                    <span>{dict.common.deliveryMaroc}</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-900 rounded-2xl p-6 text-white text-center">
                <p className="text-xs font-bold uppercase tracking-wider mb-1 text-blue-300">{s.expressDiagTitle}</p>
                <p className="font-display text-xl font-extrabold uppercase mb-3">{s.expressDiagDesc}</p>
                <a
                  href="tel:+212525200665"
                  className="block w-full py-3 bg-white text-blue-800 font-black text-xs uppercase tracking-widest rounded-lg font-mono"
                >
                  05 25 20 06 65
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── NOS EQUIPEMENTS (3 MACHINES) ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-1">{s.equipmentsSubtitle}</p>
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900">{s.equipmentsTitle}</h2>
          </div>

          {/* Grille des 3 machines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {s.equipmentsList.map((eq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-900">
                    <img
                      src={EQUIP_IMAGES[i]}
                      alt={eq.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                      <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider shadow">
                        {eq.badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-display text-lg font-bold uppercase text-slate-900 mb-2">{eq.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{eq.desc}</p>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center gap-2">
                  <FaCircleCheck className="text-green-500 text-xs" />
                  <span className="text-[11px] font-bold text-slate-700">
                    {language === 'ar' ? 'مطابق لأعلى مواصفات المصنعين' : 'Conforme normes constructeur'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── NOTRE PROPOSITION DE VALEUR ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-1">{s.valuePropsSubtitle}</p>
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900">{s.valuePropsTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {s.valueProps.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-900 flex items-center justify-center mb-4 transition-all">
                  {VALUE_ICONS[i]}
                </div>
                <h4 className="font-display text-base font-bold uppercase text-slate-900 mb-3 pb-2 border-b border-slate-100">{v.title}</h4>
                <ul className="space-y-2">
                  {v.points.map((p, j) => (
                    <li key={j} className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                      <span className="text-blue-500 shrink-0 mt-1">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-12 text-center">
          <h3 className="font-display text-3xl font-extrabold uppercase text-slate-900 mb-4">
            {s.ctaTitle}
          </h3>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto mb-8">
            {s.ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('devis')}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl font-mono flex items-center gap-2"
            >
              <span>{dict.common.getQuote}</span>
              {isRTL ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
            </button>
            <button
              onClick={() => navigate('contact')}
              className="px-8 py-4 bg-blue-800 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 border border-blue-600 font-mono"
            >
              <FaLocationDot className="text-amber-400 text-xs" />
              <span>{dict.nav.contact} & {language === 'ar' ? 'الورشة بأكادير' : 'Atelier Agadir'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
