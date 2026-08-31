import { useState, useEffect } from 'react';
import type { Page, RepairTicket, Order } from '../types';
import { MOCK_REPAIR_TICKETS } from '../data/mockData';
import { getSession, clearSession, getMyOrdersApi, getMyQuotesApi } from '../services/api';

interface ClientPortalProps {
  navigate: (page: Page) => void;
}

export default function ClientPortal({ navigate }: ClientPortalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'quotes' | 'profile'>('orders');
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const user = getSession();

  // Redirect to login if no real session
  useEffect(() => {
    if (!user || !user.token) {
      navigate('auth');
    }
  }, []);

  useEffect(() => {
    if (user && user.token) {
      getMyOrdersApi(user.token)
        .then(data => setOrders(data))
        .catch(err => console.error("Error loading orders:", err))
        .finally(() => setIsLoadingOrders(false));

      getMyQuotesApi(user.token)
        .then(data => setQuotes(data))
        .catch(err => console.error("Error loading quotes:", err));
    } else {
      setIsLoadingOrders(false);
    }
  }, [user]);

  // Guard — render nothing while redirecting
  if (!user || !user.token) return null;


  const fullName = user.firstName ? `${user.firstName} ${user.lastName}` : user.name;
  const companyInfo = user.vehicleBrand || user.companyName || 'Particulier';

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-800 border-b border-slate-700 text-white py-8 px-6 shadow-inner">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-600 text-white">
                {user.role === 'admin' ? 'Compte Administrateur' : (user.discountRate && user.discountRate > 0 ? 'Compte Garagiste Pro' : 'Compte Client')}
              </span>
              {user.discountRate > 0 && (
                <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 font-mono">
                  Remise Spéciale : -{user.discountRate}% sur tout le catalogue
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
              Espace Client · {fullName}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {companyInfo} · {user.email} · {user.phone}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Points de Fidélité</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">{user.loyaltyPoints || 0} pts</span>
            </div>
            <button
              onClick={() => {
                clearSession();
                navigate('auth');
              }}
              className="px-3 py-2 text-xs font-semibold rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-300 mb-8 bg-white rounded-t-xl px-4 shadow-sm">
          {[
            { id: 'orders', label: ' Historique des Commandes', count: orders.length },
            { id: 'quotes', label: ' Mes Demandes de Devis', count: quotes.length },
            { id: 'profile', label: ' Mon Profil & Avantages ' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 text-xs font-mono rounded-full ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Commandes */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h2 className="font-display text-2xl font-bold uppercase text-slate-900 mb-6">
              Historique de Vos Commandes
            </h2>

            {isLoadingOrders ? (
              <div className="text-center py-10 text-slate-500">Chargement de vos commandes...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500 font-semibold">Aucune commande pour le moment.</p>
                <button onClick={() => navigate('catalog')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Parcourir le catalogue</button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="border border-slate-200 rounded-lg p-5 bg-slate-50 hover:bg-white transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                      <div>
                        <span className="font-mono text-sm font-bold text-blue-600 mr-3">{order.orderNumber}</span>
                        <span className="text-xs text-slate-500">Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded ${order.status === 'Livré' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {order.status}
                        </span>
                        <span className="font-display text-xl font-bold text-slate-900">
                          {order.total.toLocaleString('fr-MA')} MAD
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm text-slate-700">
                          <span className="font-medium">{item.productName} (Réf. {item.productRef}) × {item.qty}</span>
                          <span className="font-mono text-xs font-semibold">{(item.price * item.qty).toLocaleString('fr-MA')} MAD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Mes Devis */}
        {activeTab === 'quotes' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase text-slate-900">
                  Mes Demandes de Devis
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Suivez en direct les chiffrages de vos pièces et les propositions de notre atelier.
                </p>
              </div>
              <button
                onClick={() => navigate('devis')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded shadow transition-colors"
              >
                + Nouveau Devis
              </button>
            </div>

            {quotes.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500 font-semibold mb-3">Vous n'avez aucune demande de devis en cours.</p>
                <button
                  onClick={() => navigate('devis')}
                  className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-blue-700 shadow"
                >
                  Demander un devis gratuit →
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {quotes.map(q => {
                  const dateStr = q.createdAt ? new Date(q.createdAt).toLocaleDateString('fr-FR') : (q.date || 'Récent');
                  const photoSrc = q.photoUrl
                    ? (q.photoUrl.startsWith('http') || q.photoUrl.startsWith('data:') ? q.photoUrl : `http://localhost:5000${q.photoUrl}`)
                    : null;

                  return (
                    <div key={q._id || q.id} className="border border-slate-200 rounded-lg p-5 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 text-white rounded mr-2">
                              {q.quoteNumber}
                            </span>
                            <span className="text-xs text-slate-400">{dateStr}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                            q.status === 'Accepté' ? 'bg-green-100 text-green-800' :
                            q.status === 'Devis envoyé' ? 'bg-blue-100 text-blue-800' :
                            q.status === 'Refusé' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {q.status}
                          </span>
                        </div>

                        <div className="bg-white p-3 border border-slate-200 rounded text-xs space-y-1 mb-4">
                          <div><strong className="text-slate-700">Véhicule :</strong> {q.vehicleBrand || 'Non précisé'} {q.vehicleModel} {q.vehicleYear ? `(${q.vehicleYear})` : ''}</div>
                          <div><strong className="text-slate-700">Catégorie & Réf :</strong> {q.partCategory} — <span className="font-mono text-blue-600">{q.partRef || 'Non précisée'}</span></div>
                          <div><strong className="text-slate-700">Service :</strong> {q.serviceNeeded}</div>
                          {q.description && <p className="text-slate-500 pt-1 italic">"{q.description}"</p>}
                        </div>

                        {photoSrc && (
                          <div className="mb-3">
                            <span className="text-[11px] font-semibold text-slate-600 block mb-1">Pièce jointe :</span>
                            <img src={photoSrc} alt="Photo pièce" className="h-20 rounded border object-cover" />
                          </div>
                        )}
                      </div>

                      {q.estimatedPrice ? (
                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center bg-blue-50/50 p-2.5 rounded mt-2">
                          <span className="text-xs font-bold text-slate-700">Tarif Chiffré Atelier :</span>
                          <span className="font-display text-lg font-extrabold text-blue-700">{q.estimatedPrice.toLocaleString('fr-MA')} MAD</span>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 italic">
                          Chiffrage en cours par nos techniciens...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profil Pro */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 max-w-2xl">
            <h2 className="font-display text-2xl font-bold uppercase text-slate-900 mb-6">
              Informations Compte Garagiste
            </h2>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex justify-between items-center">
                <div>
                  <h4 className="font-bold">Remise Pro Appliquée Auto</h4>
                  <p className="text-xs mt-0.5">Toutes vos commandes en ligne bénéficient de -5% sur les tarifs affichés.</p>
                </div>
                <span className="font-mono text-2xl font-extrabold text-amber-700">-5%</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-500">Nom / Raison Sociale</label>
                  <p className="font-semibold text-slate-900 mt-1">{companyInfo}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-500">Contact Principal</label>
                  <p className="font-semibold text-slate-900 mt-1">{fullName}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-500">Téléphone</label>
                  <p className="font-semibold text-slate-900 mt-1 font-mono">{user.phone}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-500">Email</label>
                  <p className="font-semibold text-slate-900 mt-1">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Report Modal Simulation */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-300 overflow-hidden">
            <div className="bg-slate-800 text-white p-6 flex justify-between items-center border-b border-slate-700">
              <div>
                <span className="text-xs uppercase font-semibold text-blue-400 tracking-wider">Rapport de Banc d'Essai Certifié</span>
                <h3 className="font-display text-2xl font-bold uppercase">Bosch EPS 200 · Test ID #9928</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 text-slate-800">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Pièce :</span>
                  <span className="font-bold text-slate-900">{selectedTicket.partName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Référence :</span>
                  <span className="font-mono font-bold text-blue-600">{selectedTicket.ref}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Client :</span>
                  <span className="font-bold text-slate-900">{selectedTicket.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date de Calibration :</span>
                  <span className="font-bold text-slate-900">20/08/2026</span>
                </div>
              </div>

              {/* Table of test values */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">Résultats de Mesure (Pression vs Débit)</h4>
                <table className="w-full text-xs border border-slate-200 rounded overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="py-2 px-3 text-left">Étape Test</th>
                      <th className="py-2 px-3 text-left">Pression Rail</th>
                      <th className="py-2 px-3 text-left">Spécification</th>
                      <th className="py-2 px-3 text-left">Mesuré</th>
                      <th className="py-2 px-3 text-center">Résultat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 font-semibold">Plein Charge (VL)</td>
                      <td className="py-2 px-3">1600 bar</td>
                      <td className="py-2 px-3">54.0 ± 3.0 mm³/h</td>
                      <td className="py-2 px-3 font-mono">55.2 mm³/h</td>
                      <td className="py-2 px-3 text-center font-bold text-green-600">CONFORME</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Ralenti (LL)</td>
                      <td className="py-2 px-3">250 bar</td>
                      <td className="py-2 px-3">5.5 ± 1.5 mm³/h</td>
                      <td className="py-2 px-3 font-mono">5.8 mm³/h</td>
                      <td className="py-2 px-3 text-center font-bold text-green-600">CONFORME</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Débit Retour (RÜ)</td>
                      <td className="py-2 px-3">1600 bar</td>
                      <td className="py-2 px-3 font-mono">&lt; 45.0 ml/min</td>
                      <td className="py-2 px-3 font-mono">18.5 ml/min</td>
                      <td className="py-2 px-3 text-center font-bold text-green-600">CONFORME</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-900 font-semibold flex items-center justify-between">
                <span>✓ Pièce validée et conforme aux tolérances constructeur Bosch.</span>
                <span className="font-mono">Garantie 12 Mois</span>
              </div>
            </div>

            <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => alert("Impression du rapport PDF lancée.")}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded hover:bg-blue-700"
              >
                🖨 Imprimer le Rapport PDF
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-300 text-slate-800 text-xs font-bold uppercase rounded hover:bg-slate-400"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
