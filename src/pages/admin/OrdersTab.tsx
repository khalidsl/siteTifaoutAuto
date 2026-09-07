import type { Page } from '../../types';

interface OrdersTabProps {
  orderList: any[];
  exportOrdersToExcel: () => void;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
}

export default function OrdersTab({ orderList, exportOrdersToExcel, updateOrderStatus }: OrdersTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-bold uppercase text-slate-900">Gestion des Commandes Reçues</h2>
        <button
          onClick={exportOrdersToExcel}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm shadow flex items-center gap-2"
        >
          <span>📥 Exporter en Excel</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-xs border-b">
            <tr>
              <th className="p-3">Réf Commande</th>
              <th className="p-3">Client (Coordonnées)</th>
              <th className="p-3">Articles</th>
              <th className="p-3">Total</th>
              <th className="p-3">Mode Règlement</th>
              <th className="p-3">Statut actuel</th>
              <th className="p-3 text-right">Action Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orderList.map((ord: any) => (
              <tr key={ord._id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-blue-600">
                  {ord.orderNumber}
                  <span className="block text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString('fr-FR')}</span>
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-900">{ord.guestInfo?.firstName} {ord.guestInfo?.lastName}</div>
                  <div className="text-xs text-slate-500 font-mono">{ord.guestInfo?.phone} · {ord.guestInfo?.city}</div>
                  {ord.isGuest && <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">Invité</span>}
                </td>
                <td className="p-3 text-xs">
                  {ord.items.map((i: any, idx: number) => (
                    <div key={idx} className="text-slate-700">
                      • {i.productName} ×{i.qty}
                    </div>
                  ))}
                </td>
                <td className="p-3 font-display text-lg font-bold text-slate-900">
                  {ord.total.toLocaleString('fr-MA')} MAD
                </td>
                <td className="p-3 text-xs uppercase font-semibold text-slate-600">
                  {ord.guestInfo?.paymentMethod === 'especes' ? 'Espèces à la livraison' : 'Virement'}
                </td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                    ord.status === 'Livré' ? 'bg-green-100 text-green-800' :
                    ord.status === 'Payée' ? 'bg-emerald-100 text-emerald-800' :
                    ord.status === 'Retour' ? 'bg-red-100 text-red-800' :
                    ord.status === 'Expédié' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <select
                    value={ord.status}
                    onChange={e => updateOrderStatus(ord._id, e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="En attente">En attente</option>
                    <option value="En préparation">En préparation</option>
                    <option value="Payée">Payée</option>
                    <option value="Expédié">Expédié</option>
                    <option value="Livré">Livré</option>
                    <option value="Retour">Retour</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
