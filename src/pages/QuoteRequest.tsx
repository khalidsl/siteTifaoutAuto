import { useState, useEffect } from 'react';
import type { Page, Category, QuoteRequest as QuoteRequestType } from '../types';
import { createQuoteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveMediaUrl } from '../utils/media';
import {
  FaCheck,
  FaPhone,
  FaAward,
  FaClock,
  FaTrashCan,
  FaCircleExclamation,
  FaArrowRight,
  FaArrowLeft,
  FaCamera,
} from 'react-icons/fa6';

interface QuoteRequestProps {
  navigate: (page: Page) => void;
  onAddQuote?: (quote: QuoteRequestType) => void;
}

export default function QuoteRequest({ navigate, onAddQuote }: QuoteRequestProps) {
  const { dict, isRTL } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    email: '',
    customerType: 'Particulier' as 'Particulier' | 'Garagiste Pro' | 'Transporteur',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    partCategory: 'injecteur' as Category | 'autre',
    partRef: '',
    serviceNeeded: 'Réparation / Reconditionnement' as 'Réparation / Reconditionnement' | 'Achat pièce' | 'Test sur banc',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { user } = useAuth();

  // Auto pre-fill if logged in
  useEffect(() => {
    if (user) {
      const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || '');
      setForm(prev => ({
        ...prev,
        name: fullName || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        vehicleBrand: user.vehicleBrand || prev.vehicleBrand,
      }));
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMsg(dict.quote.errorRequired);
      return;
    }

    if (!form.vehicleBrand.trim() && !form.vehicleModel.trim()) {
      setErrorMsg(dict.quote.errorVehicle);
      return;
    }

    if (!form.description.trim()) {
      setErrorMsg(dict.quote.errorDesc);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('phone', form.phone.trim());
      formData.append('city', form.city.trim());
      formData.append('email', form.email.trim());
      formData.append('customerType', form.customerType);
      formData.append('vehicleBrand', form.vehicleBrand.trim());
      formData.append('vehicleModel', form.vehicleModel.trim());
      formData.append('vehicleYear', form.vehicleYear.trim());
      formData.append('partCategory', form.partCategory);
      formData.append('partRef', form.partRef.trim());
      formData.append('serviceNeeded', form.serviceNeeded);
      formData.append('description', form.description.trim());

      if (user?._id) {
        formData.append('userId', user._id);
      }
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      const created = await createQuoteApi(formData, user?.token);
      if (onAddQuote) onAddQuote(created);
      setSubmittedQuote(created);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Quote submission error:', err);
      setErrorMsg(err.message || dict.common.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State Screen ──
  if (submittedQuote) {
    const photoUrl = submittedQuote.photoUrl ? resolveMediaUrl(submittedQuote.photoUrl) : null;

    return (
      <div className="min-h-screen bg-slate-100 pt-28 pb-16 px-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-100 border border-green-300 flex items-center justify-center mx-auto mb-5 text-green-600 shadow-sm">
            <FaCheck className="text-2xl" />
          </div>

          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 font-mono text-xs font-extrabold rounded-full mb-3">
            {dict.quote.successBadge}
          </span>

          <h2 className="font-display text-3xl font-extrabold uppercase text-slate-900 mb-2">
            {dict.quote.successTitle} {submittedQuote.quoteNumber || 'DEV-2026'}
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {dict.quote.successMsg1} <strong>{submittedQuote.name}</strong>. {dict.quote.successMsg2} <strong dir="ltr">{submittedQuote.phone}</strong> {dict.quote.successMsg3}
          </p>

          {photoUrl && (
            <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-center gap-4">
              <img src={photoUrl} alt="Photo transmise" className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
              <div>
                <p className="text-xs font-bold text-slate-800">{dict.quote.photoAttached}</p>
                <p className="text-[11px] text-slate-500">{dict.quote.photoAttachedDesc}</p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-left text-xs space-y-2 text-slate-700">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">{dict.quote.vehicleSummary}</span>
              <span className="font-bold text-slate-900">{submittedQuote.vehicleBrand} {submittedQuote.vehicleModel} {submittedQuote.vehicleYear ? `(${submittedQuote.vehicleYear})` : ''}</span>
            </div>
            {submittedQuote.city && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">{dict.quote.citySummary}</span>
                <span className="font-bold text-slate-900">{submittedQuote.city}</span>
              </div>
            )}
            <div className="pt-1">
              <span className="text-slate-500 font-medium block mb-1">{dict.quote.problemSummary}</span>
              <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200 italic font-sans text-xs">
                "{submittedQuote.description}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('catalog')}
              className="flex-1 py-3.5 text-xs font-bold tracking-widest uppercase rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
            >
              {dict.quote.seeCatalogBtn}
            </button>
            <button
              onClick={() => {
                setSubmittedQuote(null);
                setSelectedFile(null);
                setPhotoPreview(null);
                setForm({
                  name: '',
                  phone: '',
                  city: '',
                  email: '',
                  customerType: 'Particulier',
                  vehicleBrand: '',
                  vehicleModel: '',
                  vehicleYear: '',
                  partCategory: 'injecteur',
                  partRef: '',
                  serviceNeeded: 'Réparation / Reconditionnement',
                  description: '',
                });
              }}
              className="flex-1 py-3.5 text-xs font-bold tracking-widest uppercase rounded-xl bg-blue-800 hover:bg-blue-900 text-white transition-colors shadow-md"
            >
              {dict.quote.otherQuoteBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-950 border-b border-slate-800 text-white py-12 px-6 mb-10 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-9xl text-blue-500 font-black font-display">
          {dict.quote.badge}
        </div>
        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider">
            <FaClock className="text-xs" />
            <span>{dict.quote.guaranteedResponse}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white drop-shadow">
            {dict.quote.headerTitle}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
            {dict.quote.headerDesc}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 space-y-8">

              {/* ── STEP 1: Vos Informations Personnelles ── */}
              <div>
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold uppercase text-slate-900">
                      {dict.quote.step1Title}
                    </h3>
                    <p className="text-xs text-slate-500">{dict.quote.step1Desc}</p>
                  </div>
                </div>

                {/* Type de client */}
                <div className="mb-4">
                  <label className="block text-xs uppercase font-bold text-slate-600 mb-2">{dict.quote.clientTypeLabel}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'Particulier' as const, label: dict.quote.clientTypes.particular },
                      { key: 'Garagiste Pro' as const, label: dict.quote.clientTypes.garagePro },
                      { key: 'Transporteur' as const, label: dict.quote.clientTypes.transporter },
                    ].map(type => (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, customerType: type.key }))}
                        className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${form.customerType === type.key
                            ? 'bg-blue-800 text-white border-blue-800 shadow-md scale-[1.02]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.fullName} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder={dict.quote.fullNamePlaceholder}
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.phone} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder={dict.quote.phonePlaceholder}
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.city}
                    </label>
                    <input
                      type="text"
                      placeholder={dict.quote.cityPlaceholder}
                      value={form.city}
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.email}
                    </label>
                    <input
                      type="email"
                      placeholder={dict.quote.emailPlaceholder}
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* ── STEP 2: Informations du Véhicule ── */}
              <div>
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold uppercase text-slate-900">
                      {dict.quote.step2Title}
                    </h3>
                    <p className="text-xs text-slate-500">{dict.quote.step2Desc}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.vehicleBrand} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={dict.quote.vehicleBrandPlaceholder}
                      value={form.vehicleBrand}
                      onChange={e => setForm(p => ({ ...p, vehicleBrand: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.vehicleModel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={dict.quote.vehicleModelPlaceholder}
                      value={form.vehicleModel}
                      onChange={e => setForm(p => ({ ...p, vehicleModel: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.vehicleYear}
                    </label>
                    <input
                      type="text"
                      placeholder={dict.quote.vehicleYearPlaceholder}
                      value={form.vehicleYear}
                      onChange={e => setForm(p => ({ ...p, vehicleYear: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.partCategory}
                    </label>
                    <select
                      value={form.partCategory}
                      onChange={e => setForm(p => ({ ...p, partCategory: e.target.value as Category }))}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                    >
                      <option value="injecteur">{dict.nav.categories.injecteur}</option>
                      <option value="pompe">{dict.nav.categories.pompe}</option>
                      <option value="capteur">{dict.nav.categories.capteur}</option>
                      <option value="regulateur">{dict.nav.categories.regulateur}</option>
                      <option value="joint">{dict.nav.categories.joint}</option>
                      <option value="autre">{dict.nav.categories.autre}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                      {dict.quote.partReference}
                    </label>
                    <input
                      type="text"
                      placeholder={dict.quote.partRefPlaceholder}
                      value={form.partRef}
                      onChange={e => setForm(p => ({ ...p, partRef: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* ── STEP 3: Description du Problème & Photos ── */}
              <div>
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold uppercase text-slate-900">
                      {dict.quote.step3Title}
                    </h3>
                    <p className="text-xs text-slate-500">{dict.quote.step3Desc}</p>
                  </div>
                </div>

                {/* Symptômes / Problème */}
                <div className="mb-5">
                  <label className="block text-xs uppercase font-bold text-slate-700 mb-1">
                    {dict.quote.issueLabel} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={dict.quote.issuePlaceholder}
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Upload Photo Optionnel */}
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{dict.quote.photoLabel}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{dict.quote.photoSublabel}</span>
                  </label>

                  {photoPreview ? (
                    <div className="border-2 border-solid border-green-400 rounded-2xl p-4 bg-green-50/40 flex items-center justify-between gap-4 transition-all">
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <img
                          src={photoPreview}
                          alt="Aperçu pièce"
                          className="w-20 h-20 object-cover rounded-xl border border-green-200 shadow-sm shrink-0"
                        />
                        <div className="truncate">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 mb-0.5">
                            <FaCheck className="text-[11px]" /> {dict.quote.photoReady}
                          </span>
                          <p className="text-xs text-slate-600 truncate font-mono">{selectedFile?.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors shrink-0"
                        title="Supprimer la photo"
                      >
                        <FaTrashCan className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-2xl p-6 bg-slate-50 text-center transition-all cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FaCamera className="text-lg" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          {dict.quote.photoClickHint}
                        </p>
                        <p className="text-xs text-slate-500 max-w-sm">
                          {dict.quote.photoDesc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2 animate-shake">
                  <FaCircleExclamation className="text-base shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-sm font-extrabold tracking-widest uppercase rounded-xl bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 text-white shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? dict.quote.submitting : dict.quote.submit}</span>
                {!isSubmitting && (isRTL ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />)}
              </button>
            </form>
          </div>

          {/* Right Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <FaAward className="text-blue-800 text-lg" />
                <h3 className="font-display text-lg font-bold uppercase text-slate-900">
                  {dict.quote.advantagesTitle}
                </h3>
              </div>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{dict.quote.adv1Title}</h4>
                    <p className="mt-0.5 text-slate-500">{dict.quote.adv1Desc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{dict.quote.adv2Title}</h4>
                    <p className="mt-0.5 text-slate-500">{dict.quote.adv2Desc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{dict.quote.adv3Title}</h4>
                    <p className="mt-0.5 text-slate-500">{dict.quote.adv3Desc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgent Phone Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <FaPhone className="text-sm" />
                <h4 className="font-display text-base font-extrabold uppercase">{dict.quote.urgentTitle}</h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {dict.quote.urgentDesc}
              </p>
              <a
                href={`tel:${dict.common.phoneIntl}`}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-center block text-sm uppercase tracking-wider transition-colors shadow-lg font-mono"
                dir="ltr"
              >
                {dict.common.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
