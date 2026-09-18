import { useState, useEffect } from 'react';
import type { Page, CartItem, GuestInfo } from '../types';
import { createOrderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { buildOrderPayload, calculateOrderTotals } from '../utils/order';

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
  const { dict, language } = useLanguage();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [info, setInfo] = useState<GuestInfo>(EMPTY_INFO);
  const [errors, setErrors] = useState<Partial<GuestInfo>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { user } = useAuth();
  const discountRate = user?.discountRate ?? 0;

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

  const { rawSubtotal, discount, shipping, total } = calculateOrderTotals(cart, discountRate);

  const validate = () => {
    const e: Partial<GuestInfo> = {};
    if (!info.firstName.trim()) e.firstName = dict.cart.errorRequired;
    if (!info.lastName.trim()) e.lastName = dict.cart.errorRequired;
    if (!info.phone.trim()) e.phone = dict.cart.errorRequired;
    if (!info.address.trim()) e.address = dict.cart.errorRequired;
    if (!info.city.trim()) e.city = dict.cart.errorRequired;
    if (info.email && info.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(info.email.trim())) {
        e.email = dict.cart.errorEmail;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const created = await createOrderApi(
        buildOrderPayload(cart, info, !user, discountRate),
        user?.token,
      );

      setPlacedOrderNumber(created.orderNumber || `CMD-2026-${Date.now().toString().slice(-4)}`);
      setOrderPlaced(true);
      onClearCart();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setSubmitError(err.message || dict.common.error);
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
            {dict.cart.orderConfirmedTitle}
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {dict.cart.orderConfirmedDesc1} <strong dir="ltr">{info.phone}</strong> {dict.cart.orderConfirmedDesc2} <strong>{info.city}</strong>.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-bold uppercase text-slate-500 mb-1">{dict.cart.orderNumberLabel}</p>
            <p className="font-mono text-2xl font-extrabold text-blue-600" dir="ltr">{placedOrderNumber}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('home')}
              className="flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
            >
              {dict.cart.homeBtn}
            </button>
            <button
              onClick={() => navigate('catalog')}
              className="flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {dict.cart.seeCatalogBtn}
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
              {step === 'cart' ? dict.cart.title : step === 'info' ? dict.cart.titleInfo : dict.cart.titleConfirm}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                {dict.cart.guestBadge}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 text-xs">
            <span className={`font-bold ${step === 'cart' ? 'text-blue-400' : 'text-slate-400'}`}>{dict.cart.step1}</span>
            <span className="text-slate-600">→</span>
            <span className={`font-bold ${step === 'info' ? 'text-blue-400' : 'text-slate-400'}`}>{dict.cart.step2}</span>
            <span className="text-slate-600">→</span>
            <span className={`font-bold ${step === 'confirm' ? 'text-blue-400' : 'text-slate-400'}`}>{dict.cart.step3}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-10">
        {cart.length === 0 && step === 'cart' ? (
          <div className="py-20 text-center bg-white rounded-xl shadow-md border border-slate-200">
            <h3 className="font-display text-2xl font-bold uppercase text-slate-700 mb-4">{dict.cart.emptyTitle}</h3>
            <button
              onClick={() => navigate('catalog')}
              className="px-6 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-blue-700 transition-colors shadow"
            >
              {dict.cart.exploreCatalog}
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

                          <span className="font-display text-lg font-bold text-slate-900 w-28 text-right">
                            {((item.product.price || 0) * item.qty).toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-MA')} {dict.common.mad}
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
                      {dict.cart.continueShopping}
                    </button>
                    <button
                      onClick={() => setStep('info')}
                      className="flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded bg-blue-600 hover:bg-blue-700 text-white shadow"
                    >
                      {dict.cart.proceedCheckout}
                    </button>
                  </div>
                </div>
              )}

              {step === 'info' && (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6">
                  <h3 className="font-display text-2xl font-bold uppercase text-slate-900">
                    {dict.cart.guestCoordsTitle}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">{dict.cart.firstName}</label>
                      <input
                        type="text"
                        value={info.firstName}
                        onChange={e => setInfo(p => ({ ...p, firstName: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none ${errors.firstName ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">{dict.cart.lastName}</label>
                      <input
                        type="text"
                        value={info.lastName}
                        onChange={e => setInfo(p => ({ ...p, lastName: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none ${errors.lastName ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">{dict.cart.phone}</label>
                      <input
                        type="tel"
                        placeholder="06 00 00 00 00"
                        value={info.phone}
                        onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none font-mono ${errors.phone ? 'border-red-500' : 'border-slate-300'}`}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">{dict.cart.email}</label>
                      <input
                        type="email"
                        value={info.email}
                        onChange={e => setInfo(p => ({ ...p, email: e.target.value }))}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">{dict.cart.address}</label>
                      <input
                        type="text"
                        placeholder={dict.cart.addressPlaceholder}
                        value={info.address}
                        onChange={e => setInfo(p => ({ ...p, address: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none ${errors.address ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">{dict.cart.city}</label>
                      <input
                        type="text"
                        placeholder={dict.cart.cityPlaceholder}
                        value={info.city}
                        onChange={e => setInfo(p => ({ ...p, city: e.target.value }))}
                        className={`w-full p-2.5 text-xs bg-slate-50 border rounded outline-none ${errors.city ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex gap-4">
                    <button onClick={() => setStep('cart')} className="px-6 py-3 text-xs font-bold uppercase rounded border text-slate-600">
                      {dict.cart.btnBack}
                    </button>
                    <button onClick={() => { if (validate()) setStep('confirm'); }} className="flex-1 py-3 text-xs font-bold uppercase rounded bg-blue-600 text-white shadow">
                      {dict.cart.btnContinue}
                    </button>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6">
                  <h3 className="font-display text-2xl font-bold uppercase text-slate-900">
                    {dict.cart.summarySummary}
                  </h3>

                  <div className="bg-slate-50 p-4 rounded border text-xs space-y-2">
                    <p><strong>{dict.cart.recipient}</strong> {info.firstName} {info.lastName} (<span dir="ltr">{info.phone}</span>)</p>
                    <p><strong>{dict.cart.deliveryAddress}</strong> {info.address}, {info.city}</p>
                    <p><strong>{dict.cart.paymentMode}</strong> {dict.cart.paymentModeValue}</p>
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
                      {dict.cart.btnModify}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex-1 py-4 text-sm font-extrabold uppercase tracking-widest bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 rounded shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? dict.cart.orderSubmitting : dict.cart.confirmOrderBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 h-fit space-y-4">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900 pb-2 border-b">
                {dict.cart.summaryTitle}
              </h3>

              {discountRate > 0 && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-amber-600 text-base">🏷️</span>
                  <span className="text-xs font-bold text-amber-800">
                    {dict.cart.discountBadge} -{discountRate}% {dict.cart.discountApplied}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-600">
                <span>{dict.cart.itemsSubtotal}</span>
                <span className="font-bold text-slate-900">{rawSubtotal.toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-MA')} {dict.common.mad}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-700 font-bold">
                  <span>{dict.cart.discountBadge} -{discountRate}% :</span>
                  <span>- {discount.toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-MA')} {dict.common.mad}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-600">
                <span>{dict.cart.shippingCost}</span>
                <span className="font-bold text-slate-900">{shipping === 0 ? dict.cart.freeShipping : `${shipping} ${dict.common.mad}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t">
                <span>{dict.cart.totalTtc}</span>
                <span className="font-display text-2xl text-blue-600">{total.toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-MA')} {dict.common.mad}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
