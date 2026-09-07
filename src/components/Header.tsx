import { useState } from 'react';
import type { Page, CartItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { getOpeningStatus } from '../utils/hours';
import {
  FaPhone,
  FaStar,
  FaGear,
  FaUserCheck,
  FaCartShopping,
  FaAngleDown,
  FaBars,
  FaXmark,
  FaWrench,
  FaGears,
} from 'react-icons/fa6';

interface HeaderProps {
  currentPage: Page;
  navigate: (page: Page) => void;
  cart: CartItem[];
  selectedCategory?: string;
  onCategoryNav?: (cat: string) => void;
}

const CATALOG_LINKS = [
  { label: 'Injecteurs Diesel', cat: 'injecteur' },
  { label: 'Pompes Haute Pression', cat: 'pompe' },
  { label: 'Capteurs Pression Rail', cat: 'capteur' },
  { label: 'Pochettes Joints Pare-feu', cat: 'joint' },
  { label: 'Régulateurs DRV', cat: 'regulateur' },
];

export default function Header({ currentPage, navigate, cart, onCategoryNav }: HeaderProps) {
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const total = cart.reduce((s, i) => s + i.qty, 0);

  const opening = getOpeningStatus();

  const handleCatalogNav = (cat: string) => {
    setDropOpen(false);
    setMobileOpen(false);
    if (onCategoryNav) onCategoryNav(cat);
  };

  const { user } = useAuth();

  const handleAccountClick = () => {
    setMobileOpen(false);
    if (!user) navigate('auth');
    else if (user.role === 'admin') navigate('admin');
    else navigate('client');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 shadow-lg bg-slate-900 border-b border-slate-800">
      {/* Top Strip */}
      <div className="bg-slate-950 border-b border-slate-800 text-slate-300">
        <div className="max-w-[1440px] mx-auto px-6 h-9 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a
              href="tel:+212525200665"
              className="flex items-center gap-2 font-semibold text-slate-200 hover:text-blue-400 transition-colors"
            >
              <FaPhone className="text-blue-400 text-xs" />
              <span className="font-mono">05 25 20 06 65</span>
            </a>
            <span className="text-slate-700">|</span>
            <div className="hidden sm:flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: opening.isOpen ? '#22c55e' : '#d97706' }}
              />
              <span className="font-bold text-slate-200 uppercase">{opening.statusBadgeText}</span>
              <span className="text-slate-400 font-mono">({opening.statusText})</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://maps.google.com/?q=TIFAOUT+AUTO+Agadir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <FaStar className="text-amber-400 text-xs" />
              <span>4.5 / 5</span>
              <span className="text-slate-400 font-normal hidden sm:inline">(18 avis Google)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('home')} className="flex items-center gap-3 text-left group">
          <div className="h-11 w-auto flex items-center justify-center shrink-0">
            <img
              src="/images/logo-header.png"
              onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
              alt="TIFAOUT AUTO Logo"
              className="h-full max-h-11 object-contain drop-shadow-md"
            />
          </div>
          <div>
            <div className="font-display text-2xl font-extrabold tracking-wider leading-none text-white group-hover:text-blue-400 transition-colors">
              TIFAOUT AUTO
            </div>
            <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-blue-400">
              Injection Diesel · Agadir
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => navigate('home')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${
              currentPage === 'home'
                ? 'text-white bg-blue-900/60 border border-blue-700/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Accueil
          </button>

          {/* Catalog Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
          >
            <button
              onClick={() => handleCatalogNav('injecteur')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${
                currentPage === 'catalog'
                  ? 'text-white bg-blue-900/60 border border-blue-700/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FaGears className="text-blue-400 text-xs" />
              Catalogue Pièces
              <FaAngleDown
                className={`text-xs transition-transform duration-200 ${dropOpen ? 'rotate-180 text-blue-400' : 'text-slate-400'}`}
              />
            </button>

            {dropOpen && (
              <div className="absolute top-full left-0 w-60 py-2 shadow-2xl rounded-b-xl z-50 border-t-2 border-blue-600 bg-slate-900 border-x border-b border-slate-800">
                {CATALOG_LINKS.map((l) => (
                  <button
                    key={l.cat}
                    onClick={() => handleCatalogNav(l.cat)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-blue-950/60 transition-colors flex items-center justify-between"
                  >
                    <span>{l.label}</span>
                    <span className="text-[10px] text-blue-400 font-mono">→</span>
                  </button>
                ))}
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={() => {
                    setDropOpen(false);
                    navigate('catalog');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-slate-800 uppercase tracking-wider"
                >
                  Voir tout le catalogue (100+) →
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              navigate('home');
              setTimeout(() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-md"
          >
            <FaWrench className="text-slate-400 text-xs" />
            Nos Services
          </button>

          <button
            onClick={() => {
              navigate('home');
              setTimeout(() => {
                const el = document.getElementById('about');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-md"
          >
            À propos
          </button>

          <button
            onClick={() => navigate('devis')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${
              currentPage === 'devis'
                ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40 shadow-inner'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
             Devis 
          </button>

          <button
            onClick={() => navigate('contact')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${
              currentPage === 'contact'
                ? 'text-white bg-blue-900/60 border border-blue-700/50 shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAccountClick}
            className={`hidden md:flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold tracking-wider uppercase rounded-md transition-all border ${
              currentPage === 'client' || currentPage === 'auth' || currentPage === 'admin'
                ? 'bg-blue-800 text-white border-blue-600 shadow-md'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-blue-500 hover:text-white'
            }`}
          >
            <FaUserCheck className="text-blue-400 text-sm" />
            {user
              ? (user.role === 'admin' ? ' BACK-OFFICE' : ` ${user.firstName || 'MON ESPACE'}`)
              : 'CONNEXION / INSCRIPTION'}
          </button>

          <button
            onClick={() => navigate('cart')}
            className="relative flex items-center justify-center w-10 h-10 rounded-md bg-slate-800 text-slate-200 border border-slate-700 hover:border-blue-500 hover:text-white transition-all shadow"
            title="Mon Panier"
          >
            <FaCartShopping className="text-sm text-slate-200" />
            {total > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-extrabold text-white rounded-full bg-amber-600 animate-pulse shadow-md">
                {total}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md bg-slate-800 text-slate-200 border border-slate-700"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <FaXmark className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden shadow-2xl bg-slate-900 border-t border-slate-800">
          <div className="px-6 py-4 flex flex-col gap-2">
            <button
              onClick={() => {
                navigate('home');
                setMobileOpen(false);
              }}
              className="text-left py-2 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800"
            >
              Accueil
            </button>

            <div className="py-2 border-b border-slate-800">
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-blue-400 mb-2">
                Catalogue Pièces
              </p>
              {CATALOG_LINKS.map((l) => (
                <button
                  key={l.cat}
                  onClick={() => handleCatalogNav(l.cat)}
                  className="block w-full text-left py-1.5 pl-3 text-xs text-slate-300 hover:text-white"
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAccountClick}
              className="text-left py-2 text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 flex items-center gap-2"
            >
              <FaUserCheck /> {user ? 'MON ESPACE' : 'LOGIN / REGISTER'}
            </button>

            <button
              onClick={() => {
                navigate('devis');
                setMobileOpen(false);
              }}
              className="text-left py-2 text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800"
            >
               Demander un Devis Gratuit
            </button>

            <button
              onClick={() => {
                navigate('contact');
                setMobileOpen(false);
              }}
              className="text-left py-2 text-xs font-bold uppercase tracking-wider text-slate-200"
            >
              Contact & Accès Atelier
            </button>

            <a
              href="tel:+212525200665"
              className="mt-3 py-3 text-xs font-extrabold uppercase tracking-widest text-white bg-blue-800 hover:bg-blue-900 rounded-md text-center flex items-center justify-center gap-2 shadow"
            >
              <FaPhone /> Appeler : 05 25 20 06 65
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
