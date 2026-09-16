import type { Page } from '../types';
import {
  FaWrench,
  FaGears,
  FaGaugeHigh,
  FaOilCan,
  FaMicrochip,
  FaDroplet,
  FaArrowRight,
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

const REPARATION_SERVICES = [
  "Pompes à injection en ligne",
  "Pompes distributives",
  "Contrôle électronique du diesel",
  "Ensembles porte-nez d'injecteur",
  "Nez d'injecteur",
  "Circuit d'alimentation diesel (pompes et filtres)",
  "Pompes unitaires",
  "Systèmes d'injection unitaires",
  "Pompes à pistons radiaux",
  "Systèmes d'injection à rampe commune",
];

const VALEUR_PROPS = [
  {
    icon: <FaBoxOpen className="text-2xl text-blue-400" />,
    title: "Pièces",
    points: [
      "Pièces d'origine Bosch pour garantir fiabilité et performance",
      "Disponibilité immédiate grâce au Bosch Retail Store (BRS)",
      "Large gamme couvrant systèmes diesel et autres composants",
    ],
  },
  {
    icon: <FaGaugeHigh className="text-2xl text-blue-400" />,
    title: "Équipement",
    points: [
      "Outils et bancs de test Bosch certifiés pour diagnostic précis",
      "Technologie avancée pour répondre aux standards internationaux",
      "Solutions adaptées aux ateliers, professionnels et aux flottes",
    ],
  },
  {
    icon: <FaUserGear className="text-2xl text-blue-400" />,
    title: "Technicité",
    points: [
      "Équipe formée et certifiée Bosch",
      "Expertise pointue en systèmes d'injection diesel",
      "Processus conformes aux normes constructeur",
    ],
  },
  {
    icon: <FaHandshake className="text-2xl text-blue-400" />,
    title: "Proximité",
    points: [
      "Présence locale à Agadir pour un service rapide",
      "Accompagnement personnalisé des clients",
      "Disponibilité téléphonique et digitale pour support continu",
    ],
  },
  {
    icon: <FaBullseye className="text-2xl text-blue-400" />,
    title: "Solution",
    points: [
      "Offre complète : Service + Pièces + Conseil",
      "Réponse aux besoins fréquents identifiés par nos enquêtes qualité",
      "Engagement Bosch pour la satisfaction client",
    ],
  },
];

const POURQUOI_BOSCH = [
  { num: "01", label: "Mobilité", desc: "Augmentation du taux de mobilité de vos véhicules" },
  { num: "02", label: "Productivité", desc: "Gain de productivité" },
  { num: "03", label: "Chiffre d'affaires", desc: "Augmentation du chiffre d'affaires" },
  { num: "04", label: "Durée de vie", desc: "Un système diesel bien entretenu prolonge la durée de vie de vos moteurs et de votre véhicule" },
  { num: "05", label: "Consommation", desc: "La qualité de nos services optimisant le rendement et la consommation de vos moteurs" },
  { num: "06", label: "Garantie BOSCH", desc: "Bosch vous offre 12 mois de garantie sur ses pièces" },
];

const EQUIPEMENTS = [
  {
    name: "Banc Bosch DCI 200",
    desc: "Diagnostic certifié, test de pression jusqu'à 2700 bar et génération des codes IMA/NIMA pour injecteurs Common Rail solénoïde et piézo.",
    badge: "BANC OFFICIEL BOSCH",
    img: "/images/tifaout-bosch-dci200.jpg",
  },
  {
    name: "Banc d'Essai Pompes CR",
    desc: "Contrôle dynamique du débit, étanchéité haute pression et test des régulateurs DRV pour pompes Common Rail CP1, CP3, CP4 et DFP.",
    badge: "POMPES HAUTE PRESSION",
    img: "https://res.cloudinary.com/dgv5kksja/image/upload/v1788802842/tifaout-auto-assets/ahnamk48wpjwygnqmyou.jpg",
  },
  {
    name: "Banc pour Pompes en Ligne & Rotatives",
    desc: "Mesure du débit par éprouvettes graduées, calage d'avance et tarage cylindre par cylindre pour pompes d'injection en ligne et distributives.",
    badge: "POMPES EN LIGNE & DISTRIBUTIVES",
    img: "https://res.cloudinary.com/dgv5kksja/image/upload/v1788802841/tifaout-auto-assets/awd8mq9azybs5kyxbi7f.jpg",
  },
];

export default function Services({ navigate }: ServicesProps) {
  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">

      {/* ── HEADER ── */}
      <div className="bg-slate-800 border-b border-slate-700 text-white py-10 px-6 shadow-inner">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-400 mb-1">Bosch Diesel Service — Agadir</p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
            Nos Services Injection Diesel
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl">
            Entretien et réparation de tous systèmes d'injection diesel. Certifié Bosch, équipé du banc DCI 200.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-16">

        {/* ── NOS SERVICES ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-1">Entretien & Réparation</p>
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900">Nos Prestations</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services list */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center">
                  <FaWrench className="text-white text-sm" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-slate-900">Systèmes pris en charge</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REPARATION_SERVICES.map((service, i) => (
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
                  <h4 className="font-bold uppercase text-slate-900 text-sm">Nos Engagements</h4>
                </div>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <FaCircleCheck className="text-green-500 shrink-0 mt-0.5" />
                    <span>Banc certifié <strong className="text-slate-800">Bosch DCI 200</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCircleCheck className="text-green-500 shrink-0 mt-0.5" />
                    <span>Garantie <strong className="text-slate-800">6 mois</strong> échange standard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCircleCheck className="text-green-500 shrink-0 mt-0.5" />
                    <span>Pièces d'origine <strong className="text-slate-800">Bosch</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaTruckFast className="text-amber-500 shrink-0 mt-0.5" />
                    <span>Livraison <strong className="text-slate-800">24 — 48h</strong> Maroc</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-900 rounded-2xl p-6 text-white text-center">
                <p className="text-xs font-bold uppercase tracking-wider mb-1 text-blue-300">Diagnostic Express</p>
                <p className="font-display text-xl font-extrabold uppercase mb-3">Sans Rendez-vous</p>
                <a
                  href="tel:+212525200665"
                  className="block w-full py-3 bg-white text-blue-800 font-black text-xs uppercase tracking-widest rounded-lg"
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
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-1">Matériel professionnel</p>
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900">Nos Équipements</h2>
          </div>

          {/* Grille des 3 machines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EQUIPEMENTS.map((eq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-900">
                    <img
                      src={eq.img}
                      alt={eq.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
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
                  <span className="text-[11px] font-bold text-slate-700">Conforme normes constructeur</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bandeau Équipements Complémentaires sous les 3 machines */}
          {/* <div className="mt-6 bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 lg:max-w-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <FaGears className="text-blue-400" />
                  <span>Atelier Complet</span>
                </div>
                <h4 className="font-display text-xl font-bold uppercase text-white">Équipements Complémentaires</h4>
                <p className="text-xs text-slate-400">Des outils de haute technologie pour chaque étape d'intervention.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 lg:max-w-2xl">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <FaCircleCheck className="text-blue-400 text-sm shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200">Appareils de diagnostic électronique Bosch certifiés</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <FaCircleCheck className="text-blue-400 text-sm shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200">Microscopes de haute précision pour inspection fine des injecteurs</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <FaCircleCheck className="text-blue-400 text-sm shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200">Outillage spécialisé pour dépose et repose conforme constructeurs</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <FaCircleCheck className="text-blue-400 text-sm shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200">Postes de montage et d'étalonnage en milieu ultra-propre</span>
                </div>
              </div>
            </div>
          </div> */}
        </section>

        {/* ── NOTRE PROPOSITION DE VALEUR ── */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-1">Pourquoi nous choisir</p>
            <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900">Notre Proposition de Valeur</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {VALEUR_PROPS.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-900 flex items-center justify-center mb-4 transition-all">
                  {v.icon}
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

        {/* ── POURQUOI BOSCH ── */}
        {/* <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-400 mb-1">Partenaire Agréé</p>
            <h2 className="font-display text-3xl font-extrabold uppercase">Pourquoi Bosch ?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POURQUOI_BOSCH.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="font-display text-2xl font-black text-blue-400 shrink-0">{item.num}</span>
                <div>
                  <div className="font-bold text-sm text-white mb-1">{item.label}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-blue-900/40 border border-blue-700/50 rounded-2xl">
            <p className="text-sm font-bold text-blue-300 mb-2">Pour un moteur performant :</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2"><FaCircleCheck className="text-green-400" /><span>Injection optimisée</span></div>
              <div className="flex items-center gap-2"><FaCircleCheck className="text-green-400" /><span>Mécaniquement efficace</span></div>
              <div className="flex items-center gap-2"><FaCircleCheck className="text-green-400" /><span>Préviens des pannes</span></div>
              <div className="flex items-center gap-2"><FaCircleCheck className="text-green-400" /><span>Réduit le taux de CO2</span></div>
            </div>
          </div>
        </section> */}

        {/* ── CTA ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-12 text-center">
          <h3 className="font-display text-3xl font-extrabold uppercase text-slate-900 mb-4">
            Besoin d'un diagnostic ou d'un devis ?
          </h3>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto mb-8">
            Apportez vos injecteurs ou pompes à notre atelier Bosch Diesel Service à Agadir — passage au banc certifié DCI 200 et devis sous 2h.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('devis')}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl font-mono flex items-center gap-2"
            >
              Demander un Devis Gratuit
              <FaArrowRight className="text-xs" />
            </button>
            <button
              onClick={() => navigate('contact')}
              className="px-8 py-4 bg-blue-800 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 border border-blue-600 font-mono"
            >
              <FaLocationDot className="text-amber-400 text-xs" />
              <span>Contact & Rendez-vous Atelier</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
