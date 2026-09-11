import { useState } from 'react';
import { getOrderStatusClass, ORDER_STATUSES, type OrderStatus } from '../../utils/orderStatus';
import Pagination from '../../components/admin/Pagination';

interface OrdersTabProps {
  orderList: any[];
  exportOrdersToExcel: () => void;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
}

export default function OrdersTab({ orderList, exportOrdersToExcel, updateOrderStatus }: OrdersTabProps) {
  const [page, setPage] = useState(1);
  const visibleOrders = orderList.slice((page - 1) * 10, page * 10);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const printOrderTicket = (order: any) => {
    const ticketWindow = window.open('', '_blank', 'width=480,height=720');
    if (!ticketWindow) return;
    const escapeHtml = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    const items = (order.items || []).map((item: any) => `
      <tr><td>${escapeHtml(item.productName)}</td><td>${item.qty}</td><td>${Number(item.price || 0).toLocaleString('fr-MA')} MAD</td></tr>
    `).join('');
    ticketWindow.document.write(`<!doctype html><html lang="fr"><head><meta charset="UTF-8"><title>Ticket ${escapeHtml(order.orderNumber)}</title><style>
      @page{size:80mm auto;margin:5mm}body{font-family:Arial,sans-serif;color:#172033;width:72mm;margin:0;font-size:11px}h1{text-align:center;font-size:18px;margin:0 0 3px}h2{font-size:13px;border-bottom:1px solid #172033;padding-bottom:5px;margin:14px 0 6px}.center{text-align:center}.muted{color:#64748b;font-size:10px}.customer{line-height:1.5;border-bottom:1px dashed #64748b;padding-bottom:8px}table{width:100%;border-collapse:collapse}th,td{padding:4px 0;text-align:left;border-bottom:1px dashed #cbd5e1}th{font-size:9px}.number{text-align:right}.total{display:flex;justify-content:space-between;font-size:15px;font-weight:bold;margin-top:10px;border-top:2px solid #172033;padding-top:8px}.footer{text-align:center;border-top:1px dashed #64748b;margin-top:16px;padding-top:8px;font-size:9px}</style></head><body><h1>TIFAOUT AUTO</h1><div class="center muted">Injection Diesel · Agadir</div><h2>Ticket de commande</h2><div class="customer"><strong>N° ${escapeHtml(order.orderNumber)}</strong><br>Date : ${new Date(order.createdAt || Date.now()).toLocaleDateString('fr-FR')}<br>Statut : ${escapeHtml(order.status)}<br><br><strong>${escapeHtml(order.guestInfo?.firstName)} ${escapeHtml(order.guestInfo?.lastName)}</strong><br>Tél : ${escapeHtml(order.guestInfo?.phone)}<br>Email : ${escapeHtml(order.guestInfo?.email || 'Non renseigné')}<br>${escapeHtml(order.guestInfo?.address)}, ${escapeHtml(order.guestInfo?.city)}</div><h2>Articles</h2><table><thead><tr><th>Produit</th><th>Qté</th><th>Prix</th></tr></thead><tbody>${items}</tbody></table><div class="total"><span>Total</span><span>${Number(order.total || 0).toLocaleString('fr-MA')} MAD</span></div><div class="footer">Paiement : ${order.guestInfo?.paymentMethod === 'especes' ? 'Espèces à la livraison' : 'Virement'}<br>Merci pour votre confiance</div></body></html>`);
    ticketWindow.document.close();
    ticketWindow.focus();
    ticketWindow.print();
  };
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
              <th className="p-3 text-center">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {visibleOrders.map((ord: any) => (
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
                  <span className={`px-2.5 py-1 text-xs font-bold rounded ${getOrderStatusClass(ord.status)}`}>
                    {ord.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <select
                    value={ord.status}
                    onChange={e => updateOrderStatus(ord._id, e.target.value as OrderStatus)}
                    className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 outline-none cursor-pointer"
                  >
                    {ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td className="p-3 text-center whitespace-nowrap">
                  <button type="button" onClick={() => setSelectedOrder(ord)} className="mr-1 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100" title="Voir les détails">
                    👁 Détails
                  </button>
                  <button type="button" onClick={() => printOrderTicket(ord)} className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100" title="Imprimer le ticket">
                    🖨 Ticket
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalItems={orderList.length} onPageChange={setPage} />
      {selectedOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setSelectedOrder(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div><p className="text-xs font-bold uppercase text-blue-600">Détail de la commande</p><h3 className="font-display text-2xl font-bold text-slate-900">{selectedOrder.orderNumber}</h3></div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="text-xl font-bold text-slate-400 hover:text-slate-700" aria-label="Fermer">×</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4 text-sm"><h4 className="mb-2 font-bold uppercase text-slate-500">Client</h4><p className="font-bold text-slate-900">{selectedOrder.guestInfo?.firstName} {selectedOrder.guestInfo?.lastName}</p><p>{selectedOrder.guestInfo?.phone}</p><p>{selectedOrder.guestInfo?.email || 'Email non renseigné'}</p></div>
              <div className="rounded-lg bg-slate-50 p-4 text-sm"><h4 className="mb-2 font-bold uppercase text-slate-500">Livraison & paiement</h4><p>{selectedOrder.guestInfo?.address}</p><p>{selectedOrder.guestInfo?.city}</p><p className="mt-1 font-semibold">{selectedOrder.guestInfo?.paymentMethod === 'especes' ? 'Espèces à la livraison' : 'Virement'}</p></div>
            </div>
            <h4 className="mb-2 mt-6 font-bold uppercase text-slate-500">Articles commandés</h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-3 text-left">Produit</th><th className="p-3 text-left">Référence</th><th className="p-3 text-right">Qté</th><th className="p-3 text-right">Prix</th><th className="p-3 text-right">Total</th></tr></thead><tbody>{(selectedOrder.items || []).map((item: any, index: number) => <tr key={index} className="border-t border-slate-200"><td className="p-3">{item.productName}</td><td className="p-3 font-mono text-xs">{item.productRef || '-'}</td><td className="p-3 text-right">{item.qty}</td><td className="p-3 text-right">{Number(item.price || 0).toLocaleString('fr-MA')} MAD</td><td className="p-3 text-right font-bold">{(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString('fr-MA')} MAD</td></tr>)}</tbody></table></div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4"><span className="font-bold uppercase text-slate-500">Total commande</span><strong className="font-display text-2xl text-blue-700">{Number(selectedOrder.total || 0).toLocaleString('fr-MA')} MAD</strong></div>
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => printOrderTicket(selectedOrder)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-blue-700">🖨 Imprimer le ticket</button><button type="button" onClick={() => setSelectedOrder(null)} className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold uppercase text-slate-700">Fermer</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
