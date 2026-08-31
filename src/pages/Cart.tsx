import { useState, useEffect } from 'react';
import type { Page, CartItem, GuestInfo } from '../types';
import { createOrderApi, getSession } from '../services/api';

interface CartProps {
  cart: CartItem[];
  navigate: (page: Page) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onClearCart: () => void;
}

type CheckoutStep = 'cart' | 'info' | 'confirm';

const EMPTY_INFO: GuestInfo = {
  firstName: '', lastName: '', phone: '', email: '',
  address: '', city: '', notes: '', paymentMethod: 'especes',
};

export default function Cart({ cart, navigate, onUpdateQty, onRemove, onClearCart }: CartProps) {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [info, setInfo] = useState<GuestInfo>(EMPTY_INFO);
  const [errors, setErrors] = useState<Partial<GuestInfo>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const user = getSession();

  // Auto pre-fill if logged in
  useEffect(() => {
    if (user) {
      setInfo(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const subtotal = cart.reduce((s, i) => s + (i.product.price || 0) * i.qty, 0);
  const shipping = subtotal > 2000 ? 0 : 50;
  const total = subtotal + shipping;

  const validate = () => {
    const e: Partial<GuestInfo> = {};
    if (!info.firstName.trim()) e.firstName = 'Requis';
    if (!info.lastName.trim()) e.lastName = 'Requis';
    if (!info.phone.trim()) e.phone = 'Requis';
    if (!info.address.trim()) e.address = 'Requis';
    if (!info.city.trim()) e.city = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const itemsPayload = cart.map(item => ({
        productId: item.product.id || item.product._id,
        productName: item.product.name,
        productRef: item.product.reference || item.product.ref || '',
        qty: item.qty,
        price: item.product.price || 0,
      }));

      const created = await createOrderApi({
        isGuest: !user,
        user: user?._id || null,
        guestInfo: {
          firstName: info.firstName,
          lastName: info.lastName,
          email: info.email || 'guest@tifaout.ma',
          phone: info.phone,
          address: info.address,
          city: info.city,
          paymentMethod: info.paymentMethod || 'especes',
        },
        items: itemsPayload,
        total: total,
      });

      setPlacedOrderNumber(created.orderNumber || `CMD-2026-${Date.now().toString().slice(-4)}`);
      setOrderPlaced(true);
      onClearCart();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setSubmitError(err.message || 'Erreur lors de la création de la commande. Veuillez vérifier la connexion au serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-100 pt-28 pb-16 px-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 border border-green-300 flex items-center justify-center mx-auto mb-6 text-green-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h2 className="font-display text-3xl font-bold uppercase text-slate-900 mb-2">
            Commande Confirmée !
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Votre commande a bien été enregistrée. Un conseiller TIFAOUT AUTO vous contactera au <strong>{info.phone}</strong> sous 2h pour valider la livraison à <strong>{info.city}</strong>.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">Numéro de Commande :</p>
            <p className="font-mono text-2xl font-extrabold text-blue-600">{placedOrderNumber}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('home')}
              className="flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => navigate('catalog')}
              className="flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Voir le Catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 text-white py-8 px-6 shadow-inner">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
              {step === 'cart' ? 'Mon Panier' : step === 'info' ? 'Livraison & Invité' : 'Confirmation Commande'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                Commande sans création de compte
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 text-xs">
            <span className={`font-bold ${step === 'cart' ? 'text-blue-400' : 'text-slate-400'}`}>1. Panier</span>
            <span className="text-slate-600">→</span>
            <span className={`font-bold ${step === 'info' ? 'text-blue-400' : 'text-slate-400'}`}>2. Coordonnées</span>
            <span className="text-slate-600">→</span>
            <span className={`font-bold ${step === 'confirm' ? 'text-blue-400' : 'text-slate-400'}`}>3. Confirmation</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-10">
        {cart.length === 0 && step === 'cart' ? (
          <div className="py-20 text-center bg-white rounded-xl shadow-md border border-slate-200">
            <h3 className="font-display text-2xl font-bold uppercase text-slate-700 mb-4">Votre panier est actuellement vide</h3>
            <button
              onClick={() => navigate('catalog')}
              className="px-6 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-blue-700 transition-colors shadow"
            >
              Découvrir le catalogue pièces →
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {step === 'cart' && (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-4">
                  {cart.map(item => {
                    const pId = item.product.id || item.product._id || '';
                    const refCode = item.product.reference || item.product.ref || '';
                    return (
                      <div key={pId} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={(item.product.images && item.product.images[0]) || item.product.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&h=100&fit=crop&auto=format'} 
                            alt={item.product.name} 
                            className="w-16 h-16 object-cover rounded border border-slate-200" 
                          />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-blue-600">{item.product.brand}</span>
                            <h4 className="font-bold text-slate-900 text-sm">{item.product.name}</h4>
                            {refCode && <span className="text-xs font-mono text-slate-500">Réf. {refCode}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center border border-slate-300 rounded bg-white">
                            <button onClick={() => onUpdateQty(pId, item.qty - 1)} className="px-2.5 py-1 font-bold text-slate-600">−</button>
                            <span className="px-2 text-xs font-bold font-mono">{item.qty}</span>
                            <button onClick={() => onUpdateQty(pId, item.qty + 1)} className="px-2.5 py-1 font-bold text-slate-600">+</button>
                          </div>

                          <span className="font-display text-lg font-bold text-slate-900 w-24 text-right">
                            {((item.product.price || 0) * item.qty).toLocaleString('fr-MA')} MAD
                          </span>

                          <button onClick={() => onRemove(pId)} className="text-red-600 hover:text-red-800 text-xs font-bold">
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => navigate('catalog')}
                      className="px-6 py-3 text-xs font-bold uppercase tracking-wider rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      ← Continuer les achats
                    </button>
                    <button
                      onClick={() => setStep('info')}
                      className="flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded bg-blue-600 hover:bg-blue-700 text-white shadow"
                    >
                      Valider le panier & Passer la commande (Invité) →
                    </button>
                  </div>
                </div>
              )}

              {step === 'info' && (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6">
                  <h3 className="font-display text-2xl font-bold uppercase text-slate-900">
                    Coordonnées de Livraison (Sans Inscription)
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Prénom *</label>
                      <input
                        type="text"
                        value={info.firstName}
                        onChange={e => setInfo(p => ({ ...p, firstName: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none ${errors.firstName ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Nom *</label>
                      <input
                        type="text"
                        value={info.lastName}
                        onChange={e => setInfo(p => ({ ...p, lastName: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none ${errors.lastName ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Téléphone mobile *</label>
                      <input
                        type="tel"
                        placeholder="06 00 00 00 00"
                        value={info.phone}
                        onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none font-mono ${errors.phone ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Email (Optionnel)</label>
                      <input
                        type="email"
                        value={info.email}
                        onChange={e => setInfo(p => ({ ...p, email: e.target.value }))}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Adresse de livraison *</label>
                      <input
                        type="text"
                        placeholder="Rue, Quartier ou Zone Industrielle..."
                        value={info.address}
                        onChange={e => setInfo(p => ({ ...p, address: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none ${errors.address ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Ville *</label>
                      <input
                        type="text"
                        placeholder="Agadir, Casablanca, Marrakech..."
                        value={info.city}
                        onChange={e => setInfo(p => ({ ...p, city: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none ${errors.city ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex gap-4">
                    <button onClick={() => setStep('cart')} className="px-6 py-3 text-xs font-bold uppercase rounded border text-slate-600">← Retour</button>
                    <button onClick={() => { if (validate()) setStep('confirm'); }} className="flex-1 py-3 text-xs font-bold uppercase rounded bg-blue-600 text-white shadow">Continuer →</button>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6">
                  <h3 className="font-display text-2xl font-bold uppercase text-slate-900">Récapitulatif & Validation</h3>

                  <div className="bg-slate-50 p-4 rounded border text-xs space-y-2">
                    <p><strong>Destinataire :</strong> {info.firstName} {info.lastName} ({info.phone})</p>
                    <p><strong>Adresse :</strong> {info.address}, {info.city}</p>
                    <p><strong>Mode de Règlement :</strong> Espèces à la livraison / Retrait atelier</p>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">
                      ⚠ {submitError}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep('info')}
                      disabled={isSubmitting}
                      className="px-6 py-4 text-xs font-bold uppercase rounded border text-slate-600 hover:bg-slate-50"
                    >
                      ← Modifier
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex-1 py-4 text-sm font-extrabold uppercase tracking-widest bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 rounded shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Enregistrement de la commande...' : 'Confirmer & Placer la Commande →'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 h-fit space-y-4">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900 pb-2 border-b">Résumé Panier</h3>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Sous-total articles :</span>
                <span className="font-bold text-slate-900">{subtotal.toLocaleString('fr-MA')} MAD</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Frais de livraison :</span>
                <span className="font-bold text-slate-900">{shipping === 0 ? 'Offerte (Maroc)' : `${shipping} MAD`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t">
                <span>Total TTC :</span>
                <span className="font-display text-2xl text-blue-600">{total.toLocaleString('fr-MA')} MAD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
