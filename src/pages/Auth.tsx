import { useEffect, useRef, useState } from 'react';
import type { Page } from '../types';
import { googleLoginApi, loginApi, registerApi } from '../services/api';
import { useAuth, saveSession } from '../context/AuthContext';
import {
  FaUserCheck,
  FaSpinner,
  FaCircleCheck,
  FaShieldHalved,
  FaStar,
  FaPercent,
  FaClockRotateLeft,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa6';

interface AuthProps {
  navigate: (page: Page) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function Auth({ navigate }: AuthProps) {
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login state
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regData, setRegData] = useState({
    firstName: '', lastName: '', email: '', phone: '', vehicleBrand: '', password: '', confirm: '',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setError('');
          setIsLoading(true);
          try {
            const user = await googleLoginApi(credential);
            saveSession(user);
            login(user);
            navigate(user.role === 'admin' ? 'admin' : 'client');
          } catch (err: any) {
            setError(err.message || 'Connexion Google impossible.');
          } finally {
            setIsLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '360',
        text: 'continue_with',
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
    return () => window.google?.accounts.id.cancel();
  }, [login, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await loginApi(loginData.identifier, loginData.password);
      saveSession(user);
      login(user);
      if (user.role === 'admin') {
        navigate('admin');
      } else {
        navigate('client');
      }
    } catch (err: any) {
      setError(err.message || 'Identifiant ou mot de passe incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regData.email.trim())) {
      setError('Veuillez saisir une adresse email valide (ex: contact@gmail.com).');
      return;
    }
    if (regData.password !== regData.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (regData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setIsLoading(true);
    try {
      const newUser = await registerApi({
        firstName: regData.firstName,
        lastName: regData.lastName,
        email: regData.email,
        phone: regData.phone,
        vehicleBrand: regData.vehicleBrand,
        password: regData.password,
      });

      // Connexion automatique et redirection immédiate vers l'espace client
      saveSession(newUser);
      login(newUser);
      if (newUser.role === 'admin') {
        navigate('admin');
      } else {
        navigate('client');
      }
    } catch (err: any) {
      const msg = err.message || "Erreur lors de l'inscription.";
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('utilis')) {
        setError("Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      <div className="max-w-[1200px] mx-auto px-6 py-10 grid lg:grid-cols-2 gap-12 items-start">

        {/* ── Form Container ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <FaUserCheck className="text-white text-lg" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Espace Fidélité & Garagistes</p>
              <h1 className="font-display text-2xl font-bold uppercase text-slate-900 leading-none">
                Connexion / Inscription
              </h1>
            </div>
          </div>

          {/* Guest Notice */}
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-4">
            <div>
              <strong className="block text-amber-950 font-bold">Rappel Important :</strong>
              <span>Vous n'avez pas besoin de compte pour commander des pièces !</span>
            </div>
            <button
              onClick={() => navigate('catalog')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase rounded-lg shrink-0 shadow transition-colors"
            >
              Commander Invité →
            </button>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${tab === 'login' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Se Connecter
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${tab === 'register' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Créer un Compte 
            </button>
          </div>

          {/* Success message */}
          {successMsg && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-300 rounded-lg text-xs text-green-800 font-semibold flex items-center gap-2">
               {successMsg}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">
               {error}
            </div>
          )}

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="mb-5 flex justify-center" ref={googleButtonRef} />
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Email ou Numéro de téléphone</label>
                <input
                  type="text"
                  required
                  placeholder="email@gmail.com ou 06XXXXXXXX"
                  value={loginData.identifier}
                  onChange={e => setLoginData(p => ({ ...p, identifier: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
                /> 
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                    className="w-full pl-3 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                    title={showLoginPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showLoginPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <><FaSpinner className="animate-spin" /> Connexion...</> : 'Connexion à mon Espace →'}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Prénom</label>
                  <input required type="text" placeholder="" value={regData.firstName} onChange={e => setRegData(p => ({ ...p, firstName: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Nom</label>
                  <input required type="text" placeholder="" value={regData.lastName} onChange={e => setRegData(p => ({ ...p, lastName: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Email professionnel</label>
                <input required type="email" placeholder="vous@garage.ma" value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Téléphone</label>
                  <input required type="tel" placeholder="0600000000" value={regData.phone} onChange={e => setRegData(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white font-mono" />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Marque Véhicule <span className="text-slate-400 normal-case">(optionnel)</span></label>
                  <input type="text" placeholder="Peugeot, Renault..." value={regData.vehicleBrand} onChange={e => setRegData(p => ({ ...p, vehicleBrand: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input
                      required
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Min. 6 caractères"
                      value={regData.password}
                      onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                      className="w-full pl-3 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                      title={showRegPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showRegPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-600 mb-1.5">Confirmer</label>
                  <div className="relative">
                    <input
                      required
                      type={showRegConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={regData.confirm}
                      onChange={e => setRegData(p => ({ ...p, confirm: e.target.value }))}
                      className="w-full pl-3 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirm(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                      title={showRegConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showRegConfirm ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <><FaSpinner className="animate-spin" /> Inscription...</> : 'Créer mon Compte & Bénéficier de -5% →'}
              </button>
            </form>
          )}
        </div>

        {/* ── Benefits Sidebar ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-7">
            <h3 className="font-display text-xl font-bold uppercase text-slate-900 mb-5 flex items-center gap-2">
              <FaShieldHalved className="text-blue-600" /> Avantages du Compte Client
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: <FaClockRotateLeft className="text-blue-500" />,
                  title: 'Suivi des Commandes en Temps Réel',
                  desc: 'Consultez le statut de chaque commande passée depuis votre espace personnel.',
                },
                {
                  icon: <FaPercent className="text-amber-500" />,
                  title: 'Remise Garagiste Pro (-5%)',
                  desc: 'Tarifs préférentiels automatiques sur l\'ensemble du catalogue pièces.',
                },
                {
                  icon: <FaStar className="text-amber-500" />,
                  title: 'Points de Fidélité',
                  desc: 'Cumulez des points à chaque commande et bénéficiez de remises supplémentaires.',
                },
                {
                  icon: <FaCircleCheck className="text-green-500" />,
                  title: 'Historique & Factures',
                  desc: 'Toutes vos commandes regroupées et consultables à tout moment.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xl mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <strong className="block text-sm text-slate-900 font-bold">{item.title}</strong>
                    <span className="text-xs text-slate-500">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin info hint */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 text-white text-xs">
            <p className="font-mono text-slate-400 mb-1">Accès administrateur</p>
            <p className="font-semibold text-slate-200">Connectez-vous avec le compte admin pour accéder au Back-Office de gestion des produits et commandes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
