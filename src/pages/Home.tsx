import { useState, useEffect } from 'react';
import type { Page, Product } from '../types';
import { products as staticProducts, getCategoryLabel } from '../data/products';
import { getProductsApi } from '../services/api';
import { getOpeningStatus } from '../utils/hours';
import WorkshopCarousel from '../components/WorkshopCarousel';
import {
  FaWrench,
  FaGears,
  FaGaugeHigh,
  FaStore,
  FaStar,
  FaPhone,
  FaCircleCheck,
  FaShieldHalved,
  FaTruckFast,
  FaAward,
  FaArrowRight,
  FaLocationDot,
} from 'react-icons/fa6';

interface HomeProps {
  navigate: (page: Page) => void;
  onProductSelect: (id: string) => void;
  onCategoryNav: (cat: string) => void;
}

const HERO_IMAGES = [
  '/imagegarage.jpg',
  '/imagegarage2.jpg',
  '/imagegarage3.jpg',
  '/imagegarage4.jpg',
];

const SERVICES = [
  {
    icon: <FaWrench className="text-xl text-blue-400" />,
    title: "Réparation d'Injecteurs",
    desc: "Démontage complet, nettoyage ultrasons, remplacement pièces d'usure, calibration et test sur banc Bosch EPS 200. Toutes marques : Bosch, Delphi, Denso, Zexel.",
    detail: "Délai : 24 — 48h",
  },
  {
    icon: <FaGears className="text-xl text-blue-400" />,
    title: "Réparation Pompes HP",
    desc: "Reconditionnement de pompes haute pression CP3, CP4, DFP — vérification pistons, cames, régulateur DRV, et soupape refoulement. Test pression complet.",
    detail: "Délai : 48 — 72h",
  },
  {
    icon: <FaGaugeHigh className="text-xl text-blue-400" />,
    title: "Test sur Banc d'Essai",
    desc: "Diagnostic certifié sur banc Bosch EPS 200 et Delphi. Mesure de débit, pression d'injection, retour carburant, et temps de réponse.",
    detail: "Résultats immédiats",
  },
  {
    icon: <FaStore className="text-xl text-blue-400" />,
    title: "Vente Reconditionnés",
    desc: "Stock permanent d'injecteurs et pompes reconditionnés garantis 12 mois. Échange standard disponible. Livraison sur tout le Maroc sous 24h.",
    detail: "Garantie 12 mois",
  },
];

const REVIEWS = [
  {
    name: 'Hassan B.',
    role: 'Garagiste indépendant — Casablanca',
    rating: 5,
    text: "Service impeccable, injecteur livré en 48h, reconditionné parfaitement. Après installation sur un Peugeot 308 HDi client, aucun problème depuis 6 mois. Je recommande sans hésitation.",
  },
  {
    name: 'Karim E.',
    role: 'Chef d\'atelier — Marrakech',
    rating: 5,
    text: "Pompe CP3 reconditionnée nickel. Le banc d'essai est professionnel, ils m'ont fourni le rapport de test. Prix très correct. Je travaille régulièrement avec TIFAOUT AUTO.",
  },
  {
    name: 'Youssef A.',
    role: 'Mécanicien — Agadir',
    rating: 5,
    text: "Bon accueil, équipe compétente. Injecteurs Denso pour un Land Cruiser reconditionnés en 3 jours. Test sur banc inclus dans le prix. Très satisfait du résultat.",
  },
];

const STATIC_FEATURED = staticProducts.slice(0, 4);

export default function Home({ navigate, onProductSelect, onCategoryNav }: HomeProps) {
  const opening = getOpeningStatus();

  // Produits vedettes chargés depuis l'API (fallback: données statiques)
  const [featured, setFeatured] = useState<any[]>(STATIC_FEATURED);
  const [products, setProducts] = useState<any[]>(staticProducts);

  useEffect(() => {
    getProductsApi({ limit: 100 })
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data.products ?? []);
        if (list.length > 0) {
          setProducts(list);
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
              <span>Spécialiste Agréé · Bosch · Delphi · Denso · Zexel</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold uppercase leading-none tracking-tight mb-6 text-white drop-shadow-md">
              Spécialiste en réparation<br />
              <span className="text-blue-400 drop-shadow">d'injecteurs</span> et<br />
              de pompes à gasoil
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl mb-8 leading-relaxed drop-shadow">
              Diagnostic certifié sur banc <strong>Bosch EPS 200</strong>, reconditionnement OEM et vente de pièces d'injection diesel. Livraison 24h sur tout le Maroc.
            </p>

            {/* Real-time status pill */}
            <div className="inline-flex items-center gap-3 mb-10 px-4 py-2.5 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg text-xs shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: opening.isOpen ? '#22c55e' : '#d97706' }} />
              <span className="font-bold text-white uppercase">{opening.statusBadgeText}</span>
              <span className="text-slate-300 font-mono">| {opening.statusText}</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-16">
              <button
                onClick={() => navigate('catalog')}
                className="px-8 py-4 text-xs font-extrabold tracking-widest uppercase rounded-lg bg-blue-800 hover:bg-blue-900 text-white shadow-xl transition-all transform hover:-translate-y-0.5 border border-blue-700 flex items-center gap-2"
              >
                <span>Voir le Catalogue Pièces</span>
                <FaArrowRight className="text-xs" />
              </button>
              <button
                onClick={() => navigate('contact')}
                className="px-8 py-4 text-xs font-extrabold tracking-widest uppercase rounded-lg bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl border border-slate-700 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <FaLocationDot className="text-amber-400 text-xs" />
                <span>Contact & Atelier Agadir</span>
              </button>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/20">
              {[
                { val: '9+', label: "Années d'expérience", color: '#60a5fa' },
                { val: '5 000+', label: 'Injecteurs reconditionnés', color: '#60a5fa' },
                { val: '4.5★', label: '18 avis Google', color: '#fbbf24' },
                { val: '24h', label: 'Livraison Maroc', color: '#60a5fa' },
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
                <span>Atelier TIFAOUT AUTO Agadir</span>
              </div>
              <h3 className="font-display text-2xl font-bold uppercase text-white">
                Nos Engagements Qualité
              </h3>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <FaCircleCheck className="text-blue-400 text-sm shrink-0 mt-0.5" />
                  <span>Banc d'essai certifié <strong>Bosch EPS 200</strong> pour injecteurs et pompes HP</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaCircleCheck className="text-blue-400 text-sm shrink-0 mt-0.5" />
                  <span>Toutes pièces garanties <strong>12 mois</strong> en échange standard</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaCircleCheck className="text-blue-400 text-sm shrink-0 mt-0.5" />
                  <span>Stock permanent d'injecteurs Bosch, Delphi, Denso et Zexel</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaTruckFast className="text-amber-400 text-sm shrink-0 mt-0.5" />
                  <span>Expédition sécurisée sous <strong>24h à 48h</strong> dans tout le Maroc</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-800">
                <a
                  href="tel:+212525200665"
                  className="w-full py-3.5 bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg text-center flex items-center justify-center gap-2 shadow-lg transition-colors font-mono"
                >
                  <FaPhone className="text-xs" />
                  <span>Appeler l'Atelier : 05 25 20 06 65</span>
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
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-2">Expertise Technique Atelier</p>
              <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900">
                Nos Services Injection Diesel
              </h2>
            </div>
            <button
              onClick={() => navigate('contact')}
              className="text-xs font-bold uppercase tracking-wider text-blue-800 hover:text-blue-900 transition-colors flex items-center gap-1.5"
            >
              <span>Contact & Rendez-vous Atelier</span>
              <FaArrowRight className="text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s, i) => (
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
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-2">Sélection pièces d'origine & reconditionnées</p>
              <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900">
                Nos Produits Phares
              </h2>
            </div>
            <button
              onClick={() => navigate('catalog')}
              className="text-xs font-bold uppercase tracking-wider text-blue-800 hover:text-blue-900 transition-colors flex items-center gap-1.5"
            >
              <span>Voir tout le catalogue (100+ articles)</span>
              <FaArrowRight className="text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => {
              const pId = p._id || p.id;
              return (
                <ProductCard key={pId} product={p} onClick={() => onProductSelect(pId)} />
              );
            })}
          </div>

          {/* Category Quick Pills */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { cat: 'injecteur', label: 'Injecteurs Diesel', count: products.filter(p => p.category === 'injecteur').length },
              { cat: 'pompe', label: 'Pompes Haute Pression', count: products.filter(p => p.category === 'pompe').length },
              { cat: 'capteur', label: 'Capteurs Pression', count: products.filter(p => p.category === 'capteur').length },
              { cat: 'joint', label: 'Joints Pare-feu', count: products.filter(p => p.category === 'joint').length },
              { cat: 'regulateur', label: 'Régulateurs DRV', count: products.filter(p => p.category === 'regulateur').length },
            ].map(c => (
              <button
                key={c.cat}
                onClick={() => onCategoryNav(c.cat)}
                className="py-3 px-4 rounded-xl bg-slate-50 hover:bg-blue-800 hover:text-white border border-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-between shadow-sm group"
              >
                <span>{c.label}</span>
                <span className="px-2 py-0.5 rounded-md bg-white group-hover:bg-blue-900 text-slate-600 group-hover:text-white text-[10px] font-mono">
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
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-3">Notre atelier d'injection à Agadir</p>
            <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900 mb-6">
              9 ans de précision au service de l'injection diesel au Maroc
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              TIFAOUT AUTO est le partenaire privilégié des garagistes, transporteurs et particuliers pour le diagnostic et le reconditionnement d'injecteurs Common Rail et pompes haute pression.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Équipé du banc d'essai certifié <strong>Bosch EPS 200</strong>, notre atelier garantit la mesure et le réglage exacts des débits selon les normes constructeur.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: 'Bosch EPS 200', label: 'Banc d\'essai certifié' },
                { val: 'ISO 9001', label: 'Qualité reconditionnement' },
                { val: 'Spécialiste Agréé', label: 'Bosch / Delphi / Denso' },
                { val: '24h / 48h', label: 'Délai moyen atelier' },
              ].map(s => (
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

      {/* ─── REVIEWS / TESTIMONIALS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-600 mb-2">Avis & Témoignages Clients</p>
              <h2 className="font-display text-4xl font-extrabold uppercase text-slate-900">
                La Confiance de nos Clients Garagistes
              </h2>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
              <div className="font-display text-2xl font-black text-amber-500">4.5 / 5</div>
              <div className="text-xs text-slate-600">
                <div className="flex text-amber-400 text-xs">★★★★½</div>
                <div className="font-semibold text-[11px] text-slate-500">18 avis vérifiés Google</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex text-amber-400 text-sm">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <FaStar key={idx} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{r.text}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center text-xs">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{r.name}</div>
                    <div className="text-[10px] text-slate-500">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── URGENT CONTACT CTA BANNER ─── */}
      <section className="bg-slate-900 text-white py-16 px-6 border-t border-slate-800">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <FaCircleCheck className="text-green-400" />
              <span>Diagnostic Express sans Rendez-vous</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wide">
              Besoin d'un test ou d'un devis immédiat ?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Apportez vos injecteurs ou pompes à notre atelier d'Agadir pour un passage au banc certifié et un devis de réparation sous 2h.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate('devis')}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl font-mono"
            >
              Demander un Devis Gratuit
            </button>
            <a
              href="tel:+212525200665"
              className="w-full sm:w-auto px-8 py-4 bg-blue-800 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 border border-blue-600 font-mono"
            >
              <FaPhone className="text-xs" />
              <span>05 25 20 06 65</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, onClick }: { product: any; onClick: () => void }) {
  const inStock = product.stock !== undefined ? Number(product.stock) > 0 : (product.inStock ?? true);
  const refCode = product.reference || product.ref || '';
  const price = Number(product.price) || 0;
  const image = product.images?.[0] || product.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format';

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden text-left transition-all duration-300 group flex flex-col justify-between"
    >
      <div>
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-blue-800 text-white shadow">
              {product.brand}
            </span>
            {product.isReconditioned && (
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-amber-500 text-slate-950 shadow">
                Reconditionné
              </span>
            )}
            {product.isNewPart && (
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-600 text-white shadow">
                Pièce Neuve
              </span>
            )}
          </div>
          {!inStock && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-white text-slate-800 rounded-md">
                Sur commande
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
          {refCode && <div className="text-xs font-mono text-slate-500 mb-3">Réf. {refCode}</div>}
        </div>
      </div>

      <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold text-slate-900">
            {price.toLocaleString('fr-MA')} MAD
          </span>
          {product.oldPrice && (
            <span className="text-xs text-slate-400 line-through">
              {Number(product.oldPrice).toLocaleString('fr-MA')}
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-blue-800 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Détails</span>
          <FaArrowRight className="text-[10px]" />
        </span>
      </div>
    </button>
  );
}