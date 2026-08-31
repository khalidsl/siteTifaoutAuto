import { useState } from 'react';
import type { Page } from '../types';
import { getOpeningStatus } from '../utils/hours';

interface ContactProps {
  navigate: (page: Page) => void;
}

export default function Contact({ navigate: _navigate }: ContactProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: 'devis', message: '' });
  const [sent, setSent] = useState(false);
  const opening = getOpeningStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      {/* Page header */}
      <div className="bg-slate-800 border-b border-slate-700 text-white py-8 px-6 shadow-inner">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-400 mb-1">Atelier & Magasin Agadir</p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
            Contact & Accès TIFAOUT AUTO
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left info cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-4">
              <h3 className="font-display text-xl font-bold uppercase text-slate-900 border-b pb-2">
                Coordonnées Officiel
              </h3>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="text-lg"></span>
                  <div>
                    <strong className="block text-slate-900 font-bold">Adresse :</strong>
                    <span>70 Bd Abdelkrim EL Khattabi</span>
                    <span className="block text-slate-500">Agadir 80000, Maroc</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg"></span>
                  <div>
                    <strong className="block text-slate-900 font-bold">Téléphone Atelier :</strong>
                    <a href="tel:+212525200665" className="text-blue-600 font-bold font-mono text-sm hover:underline">
                      05 25 20 06 65
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg">⭐</span>
                  <div>
                    <strong className="block text-slate-900 font-bold">Avis Google Business :</strong>
                    <span className="text-amber-600 font-bold">4.5 / 5★ (18 avis vérifiés)</span>
                  </div>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=70+Boulevard+Abdelkrim+El+Khattabi+Agadir+Morocco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded text-center block shadow transition-colors"
              >
                🗺 Itinéraire Google Maps →
              </a>
            </div>

            {/* Hours card */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="font-display text-xl font-bold uppercase text-slate-900">
                  Horaires d'Ouverture
                </h3>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: opening.isOpen ? '#22c55e' : '#d97706' }} />
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200 mb-4 text-xs">
                <span className="font-bold text-slate-900 block">{opening.statusBadgeText}</span>
                <span className="text-slate-500">{opening.statusText}</span>
              </div>

              <table className="w-full text-xs text-slate-700">
                <tbody className="divide-y divide-slate-100">
                  {[
                    { day: 'Lundi', h: '09h00 — 19h00', open: true },
                    { day: 'Mardi', h: '09h00 — 19h00', open: true },
                    { day: 'Mercredi', h: '09h00 — 19h00', open: true },
                    { day: 'Jeudi', h: '09h00 — 19h00', open: true },
                    { day: 'Vendredi', h: '09h00 — 19h00', open: true },
                    { day: 'Samedi', h: '09h00 — 13h00', open: true },
                    { day: 'Dimanche', h: 'Fermé', open: false },
                  ].map(row => (
                    <tr key={row.day}>
                      <td className="py-2 font-semibold">{row.day}</td>
                      <td className={`py-2 text-right font-mono ${row.open ? 'text-slate-600' : 'text-amber-700 font-bold'}`}>{row.h}</td>
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
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=70+Boulevard+Abdelkrim+El+Khattabi+Agadir+80000+Maroc&output=embed&z=16"
              />
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <h3 className="font-display text-2xl font-bold uppercase text-slate-900 mb-6">
                Envoyer un Message à l'Atelier
              </h3>

              {sent ? (
                <div className="py-10 text-center">
                  <h4 className="font-display text-2xl font-bold uppercase text-green-700 mb-2">Message transmis !</h4>
                  <p className="text-slate-600 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Nom complet *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-600 mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none resize-none"
                      placeholder="Précisez votre demande..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded shadow"
                  >
                    Envoyer le Message →
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
