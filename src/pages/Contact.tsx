import { useState } from 'react';
import type { Page } from '../types';
import { getOpeningStatus } from '../utils/hours';
import { useLanguage } from '../context/LanguageContext';

interface ContactProps {
  navigate: (page: Page) => void;
}

export default function Contact({ navigate: _navigate }: ContactProps) {
  const { dict, language, isRTL } = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: 'devis', message: '' });
  const [sent, setSent] = useState(false);
  const opening = getOpeningStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const daysSchedule = [
    { day: dict.contact.monday, h: '09:00 — 19:00', open: true },
    { day: dict.contact.tuesday, h: '09:00 — 19:00', open: true },
    { day: dict.contact.wednesday, h: '09:00 — 19:00', open: true },
    { day: dict.contact.thursday, h: '09:00 — 19:00', open: true },
    { day: dict.contact.friday, h: '09:00 — 19:00', open: true },
    { day: dict.contact.saturdayShort, h: '09:00 — 13:00', open: true },
    { day: dict.contact.sundayShort, h: dict.contact.closed, open: false },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      {/* Page header */}
      <div className="bg-slate-800 border-b border-slate-700 text-white py-8 px-6 shadow-inner">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-400 mb-1">
            {dict.contact.headerBadge}
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
            {dict.contact.headerTitle}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl">
            {dict.contact.headerDesc}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left info cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-4">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900 border-b pb-2">
                {dict.contact.coordsTitle}
              </h3>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <strong className="block text-slate-900 font-bold">{dict.contact.addressLabel}</strong>
                    <span>{dict.common.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <strong className="block text-slate-900 font-bold">{dict.contact.phoneLabel}</strong>
                    <a href={`tel:${dict.common.phoneIntl}`} className="text-blue-600 font-bold font-mono text-sm hover:underline" dir="ltr">
                      {dict.common.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg">⭐</span>
                  <div>
                    <strong className="block text-slate-900 font-bold">{dict.contact.reviewsLabel}</strong>
                    <span className="text-amber-600 font-bold">
                      {dict.common.rating}★ ({dict.contact.verifiedReviews})
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="https://maps.app.goo.gl/RrtYxiBw1udYLv9b6"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded text-center block shadow transition-colors"
              >
                {dict.contact.routeGoogleMaps}
              </a>
            </div>

            {/* Hours card */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="font-display text-xl font-bold uppercase text-slate-900">
                  {dict.contact.hoursTitle}
                </h3>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: opening.isOpen ? '#22c55e' : '#d97706' }} />
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200 mb-4 text-xs">
                <span className="font-bold text-slate-900 block">
                  {opening.isOpen ? dict.common.openNow : dict.common.closedNow}
                </span>
                <span className="text-slate-500">
                  {language === 'ar' ? 'من الإثنين إلى السبت · الأحد مغلق' : opening.statusText}
                </span>
              </div>

              <table className="w-full text-xs text-slate-700">
                <tbody className="divide-y divide-slate-100">
                  {daysSchedule.map(row => (
                    <tr key={row.day}>
                      <td className="py-2 font-semibold">{row.day}</td>
                      <td className={`py-2 ${isRTL ? 'text-left' : 'text-right'} font-mono ${row.open ? 'text-slate-600' : 'text-amber-700 font-bold'}`} dir="ltr">
                        {row.h}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Center map & form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden h-[320px]">
              <iframe
                title="TIFAOUT AUTO — Agadir"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13763.616138325804!2d-9.5696551!3d30.4104645!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdb3b74ac9cdae27%3A0xce43dc4bd8c1d721!2sTIFAOUT%20AUTO!5e0!3m2!1sfr!2sma!4v1789561018839!5m2!1sfr!2sma"
              />
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <h3 className="font-display text-2xl font-bold uppercase text-slate-900 mb-6">
                {dict.contact.formTitle}
              </h3>

              {sent ? (
                <div className="py-10 text-center">
                  <h4 className="font-display text-2xl font-bold uppercase text-green-700 mb-2">
                    {dict.contact.sentSuccess}
                  </h4>
                  <p className="text-slate-600 text-sm">
                    {dict.contact.sentDesc}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                        {dict.contact.fullName}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                        {dict.contact.phone}
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">
                      {dict.contact.message}
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none resize-none"
                      placeholder={dict.contact.messagePlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded shadow"
                  >
                    {dict.contact.send}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
