import { useState, useEffect } from 'react';
import type { Page, Product, Order, QuoteRequest, RepairTicket } from '../types';
import { MOCK_REPAIR_TICKETS } from '../data/mockData';
import {
  getSession,
  clearSession,
  getProductsApi,
  getAllOrdersApi,
  updateOrderStatusApi,
  updateProductApi,
  deleteProductApi,
  getAllQuotesApi,
  updateQuoteStatusApi,
  getAllUsersApi,
  updateUserApi,
  deleteUserApi,
  seedAdminApi
} from '../services/api';
import * as XLSX from 'xlsx';

interface AdminBackofficeProps {
  navigate: (page: Page) => void;
}

export default function AdminBackoffice({ navigate }: AdminBackofficeProps) {
  const [tab, setTab] = useState<'products' | 'orders' | 'quotes' | 'users' | 'repairs'>('products');
  const [productList, setProductList] = useState<any[]>([]);
  const [orderList, setOrderList] = useState<any[]>([]);
  const [quoteList, setQuoteList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [repairList, setRepairList] = useState<RepairTicket[]>(MOCK_REPAIR_TICKETS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Image previews for add / edit forms
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [retainedImages, setRetainedImages] = useState<string[]>([]);

  // Product filters
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategory, setProdCategory] = useState('all');
  
  const user = getSession();


  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Always load products
      const pData = await getProductsApi({ limit: 500 });
      const pList = Array.isArray(pData) ? pData : (pData.products || []);
      setProductList(pList);
    } catch (e) {
      console.error("Error loading products:", e);
    }

    if (user && user.token) {
      try {
        const [ordersData, quotesData, usersData] = await Promise.all([
          getAllOrdersApi(user.token).catch(() => []),
          getAllQuotesApi(user.token).catch(() => []),
          getAllUsersApi(user.token).catch(() => [])
        ]);
        setOrderList(ordersData || []);
        setQuoteList(quotesData || []);
        setUsersList(usersData || []);
      } catch (e) {
        console.error("Error loading admin data:", e);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const exportOrdersToExcel = () => {
    if (!orderList.length) {
      alert("Aucune commande à exporter.");
      return;
    }
    const dataToExport = orderList.map(ord => ({
      "N° Commande": ord.orderNumber,
      "Date": new Date(ord.createdAt).toLocaleDateString('fr-FR'),
      "Client": `${ord.guestInfo?.firstName} ${ord.guestInfo?.lastName}`,
      "Téléphone": ord.guestInfo?.phone,
      "Ville": ord.guestInfo?.city,
      "Adresse": ord.guestInfo?.address,
      "Articles Commandés": ord.items.map((i: any) => `${i.productName} (x${i.qty})`).join('\n'),
      "Nombre d'Articles": ord.items.reduce((acc: number, i: any) => acc + i.qty, 0),
      "Total (MAD)": ord.total,
      "Mode de Règlement": ord.guestInfo?.paymentMethod === 'especes' ? 'Espèces' : 'Virement',
      "Statut": ord.status,
      "Type Client": ord.isGuest ? 'Invité' : 'Inscrit'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commandes");
    
    // Auto-size columns
    const maxWidths = dataToExport.reduce((acc: any, row) => {
      Object.keys(row).forEach(key => {
        const valStr = String((row as any)[key]);
        acc[key] = Math.max(acc[key] || key.length, valStr.length);
      });
      return acc;
    }, {});
    worksheet['!cols'] = Object.keys(maxWidths).map(k => ({ wch: maxWidths[k] + 2 }));

    XLSX.writeFile(workbook, `Commandes_TIFAOUT_AUTO_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportQuotesToExcel = () => {
    if (!quoteList.length) {
      alert("Aucun devis à exporter.");
      return;
    }
    const dataToExport = quoteList.map(q => ({
      "N° Devis": q.quoteNumber,
      "Date": new Date(q.createdAt).toLocaleDateString('fr-FR'),
      "Client": q.name,
      "Téléphone": q.phone,
      "Ville": q.city || '',
      "Type Client": q.customerType,
      "Marque Véhicule": q.vehicleBrand,
      "Modèle/Année": `${q.vehicleModel} (${q.vehicleYear})`,
      "Service": q.serviceNeeded,
      "Problème": q.description,
      "Statut": q.status,
      "Prix Estimé (MAD)": q.estimatedPrice || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Devis");
    
    // Auto-size columns
    const maxWidths = dataToExport.reduce((acc: any, row) => {
      Object.keys(row).forEach(key => {
        const valStr = String((row as any)[key]);
        acc[key] = Math.max(acc[key] || key.length, valStr.length);
      });
      return acc;
    }, {});
    worksheet['!cols'] = Object.keys(maxWidths).map(k => ({ wch: maxWidths[k] + 2 }));

    XLSX.writeFile(workbook, `Devis_TIFAOUT_AUTO_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Submit new product to backend API
  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);

    
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
        body: formData, // Automatically sets multipart/form-data
      });
      
      if (response.ok) {
        const newProduct = await response.json();
        setProductList(prev => [newProduct, ...prev]);
        setShowAddForm(false);
        setAddImagePreviews([]);
        setTimeout(() => alert('Produit ajouté avec succès !'), 100);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || 'Erreur lors de l\'ajout du produit.');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur de connexion au serveur backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edited product
  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct || !user?.token) return;
    setIsEditSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Add retainedImages to formData
    formData.append('retainedImages', JSON.stringify(retainedImages));
    
    try {
      const updated = await updateProductApi(editingProduct._id, formData, user.token);
      setProductList(prev => prev.map(p => p._id === editingProduct._id ? updated : p));
      setEditingProduct(null);
      setEditImagePreviews([]);
      setTimeout(() => alert('Produit mis à jour avec succès !'), 100);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la modification.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${name}" ?`)) return;
    if (!user || !user.token) {
      alert("Veuillez vous connecter avec un compte Administrateur.");
      return;
    }
    try {
      await deleteProductApi(id, user.token);
      setProductList(prev => prev.filter(p => p._id !== id));
      alert("Produit supprimé avec succès.");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression.");
    }
  };

  // Toggle stock
  const toggleStock = async (id: string, currentStock: number) => {
    if (!user || !user.token) {
      alert("Action réservée à l'administrateur connecté.");
      return;
    }
    const newStock = currentStock > 0 ? 0 : 10;
    try {
      await updateProductApi(id, { stock: newStock }, user.token);
      setProductList(prev => prev.map(p => p._id === id ? { ...p, stock: newStock } : p));
    } catch (err) {
      alert("Erreur lors de la modification du stock");
    }
  };

  // Change user role / discount
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!user?.token) return;
    try {
      const updated = await updateUserApi(userId, { role: newRole }, user.token);
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: updated.role } : u));
      alert(`Rôle mis à jour: ${newRole}`);
    } catch (err: any) {
      alert(err.message || 'Erreur modification rôle');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Supprimer le compte ${email} ?`)) return;
    if (!user?.token) return;
    try {
      await deleteUserApi(userId, user.token);
      setUsersList(prev => prev.filter(u => u._id !== userId));
      alert("Compte supprimé.");
    } catch (err: any) {
      alert(err.message || "Erreur suppression compte.");
    }
  };

  // Change order status
  const updateOrderStatus = async (id: string, status: string) => {
    if (!user || !user.token) return;
    try {
      await updateOrderStatusApi(id, status, user.token);
      setOrderList(prev => prev.map(o => o._id === id ? { ...o, status } : o));
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  // Change quote status
  const updateQuoteStatus = async (id: string, status?: string, estimatedPrice?: number) => {
    if (!user || !user.token) return;
    try {
      const payload: any = {};
      if (status) payload.status = status;
      if (estimatedPrice !== undefined) payload.estimatedPrice = estimatedPrice;
      const updated = await updateQuoteStatusApi(id, payload, user.token);
      setQuoteList(prev => prev.map(q => q._id === id ? { ...q, ...updated } : q));
    } catch (error) {
      console.error('Update quote status error:', error);
      alert('Erreur lors de la mise à jour du devis.');
    }
  };

  // Change repair status
  const updateRepairStatus = (id: string, status: RepairTicket['status'], progressPercentage: number) => {
    setRepairList(prev => prev.map(r => r.id === id ? { ...r, status, progressPercentage } : r));
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">

      {/* ── EDIT PRODUCT MODAL ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="font-display text-xl font-bold uppercase text-slate-900">Modifier le produit</h2>
              <button onClick={() => { setEditingProduct(null); setEditImagePreview(null); }} className="text-slate-400 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nom du Produit *</label>
                  <input name="name" required defaultValue={editingProduct.name} className="w-full text-sm p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Référence *</label>
                  <input name="reference" required defaultValue={editingProduct.ref || editingProduct.reference} className="w-full text-sm p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Marque</label>
                  <input name="brand" defaultValue={editingProduct.brand} className="w-full text-sm p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Catégorie</label>
                  <select name="category" defaultValue={editingProduct.category} className="w-full text-sm p-2 border border-slate-300 rounded">
                    <option value="injecteur">Injecteur Diesel</option>
                    <option value="pompe">Pompe Haute Pression</option>
                    <option value="capteur">Capteur de Pression</option>
                    <option value="joint">Joint Pare-feu</option>
                    <option value="regulateur">Régulateur DRV</option>
                    <option value="valve">Valve d&apos;Injecteur</option>
                    <option value="durite">Durite Carburant</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prix (MAD) *</label>
                  <input name="price" type="number" required min="0" defaultValue={editingProduct.price} className="w-full text-sm p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ancien prix (MAD)</label>
                  <input name="oldPrice" type="number" min="0" defaultValue={editingProduct.oldPrice || ''} className="w-full text-sm p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock</label>
                  <input name="stock" type="number" min="0" defaultValue={editingProduct.stock} className="w-full text-sm p-2 border border-slate-300 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea name="description" rows={3} defaultValue={editingProduct.description} className="w-full text-sm p-2 border border-slate-300 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Images de la galerie (jusqu&apos;à 3 au total)</label>
                  
                  {/* Existing images */}
                  {retainedImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Images actuelles (cliquez sur X pour supprimer)</p>
                      <div className="flex gap-2 flex-wrap">
                        {retainedImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt={`Existante ${idx}`} className="h-16 w-16 object-cover rounded border border-slate-200" />
                            <button
                              type="button"
                              onClick={() => setRetainedImages(prev => prev.filter(i => i !== img))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add new images */}
                  <input
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full text-sm p-1 border border-slate-300 rounded bg-white"
                    onChange={e => {
                      const maxNew = 3 - retainedImages.length;
                      if (maxNew <= 0) {
                        alert("Vous avez déjà 3 images. Supprimez-en une d'abord.");
                        e.target.value = '';
                        return;
                      }
                      
                      const files = Array.from(e.target.files || []).slice(0, maxNew);
                      if (files.length === 0) {
                        setEditImagePreviews([]);
                        return;
                      }
                      const previews: string[] = [];
                      let loaded = 0;
                      files.forEach((file, idx) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          previews[idx] = reader.result as string;
                          loaded++;
                          if (loaded === files.length) {
                            setEditImagePreviews([...previews]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                  
                  {/* Previews of new images */}
                  {editImagePreviews.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {editImagePreviews.map((src, i) => (
                        <div key={i} className="relative">
                          <img src={src} alt={`Nouvelle ${i}`} className="h-16 w-16 object-cover rounded border-2 border-blue-400" />
                        </div>
                      ))}
                      <span className="text-[10px] text-blue-600 font-semibold">{editImagePreviews.length} nouvelle(s) sélectionnée(s)</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" name="isReconditioned" defaultChecked={editingProduct.isReconditioned} /> Reconditionné OEM
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" name="isNewPart" defaultChecked={editingProduct.isNewPart} /> Pièce Neuve
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isEditSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded transition-colors disabled:opacity-50">
                  {isEditSubmitting ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                </button>
                <button type="button" onClick={() => { setEditingProduct(null); setEditImagePreview(null); }} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase rounded">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-6 px-6 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs uppercase font-mono text-slate-400">Back-Office Administration</span>
              {user && (
                <span className="px-2 py-0.5 bg-blue-900 text-blue-300 text-[10px] font-bold rounded uppercase ml-2">
                  Connecté : {user.firstName || user.name || 'Admin'} ({user.role})
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-extrabold uppercase text-white tracking-wide">
              TIFAOUT AUTO · Gérance Atelier & Ventes
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('home')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded border border-slate-700 transition-colors"
            >
              Voir le Site Public →
            </button>
            {user ? (
              <button
                onClick={() => {
                  clearSession();
                  navigate('auth');
                }}
                className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold uppercase rounded shadow transition-colors"
              >
                Déconnexion
              </button>
            ) : (
              <button
                onClick={() => navigate('auth')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded shadow transition-colors"
              >
                Se Connecter Admin
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-300 mb-8 bg-white rounded-t-xl px-4 shadow-sm overflow-x-auto">
          {[
            { id: 'products', label: ' Catalogue Produits', count: productList.length },
            { id: 'orders', label: ' Commandes Web', count: orderList.length },
            { id: 'quotes', label: ' Devis Reçus', count: quoteList.length },
            { id: 'users', label: ' Comptes & Garagistes', count: usersList.length },
            { id: 'repairs', label: ' Réparations Atelier', count: repairList.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`py-4 px-5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t.label}</span>
              <span className={`px-2 py-0.5 text-xs font-mono rounded-full ${
                tab === t.id ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-600'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* TAB 1: Commandes */}
        {tab === 'orders' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold uppercase text-slate-900">
                Gestion des Commandes Reçues
              </h2>
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
                  {orderList.map(ord => (
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
                          <option value="Expédié">Expédié</option>
                          <option value="Livré">Livré</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Devis */}
        {tab === 'quotes' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold uppercase text-slate-900">
                Demandes de Devis Client & Chiffrage Express
              </h2>
              <button
                onClick={exportQuotesToExcel}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm shadow flex items-center gap-2"
              >
                <span>📥 Exporter en Excel</span>
              </button>
            </div>

            {quoteList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500 font-semibold">Aucune demande de devis reçue pour le moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {quoteList.map(q => {
                  const photoSrc = q.photoUrl
                    ? (q.photoUrl.startsWith('http') || q.photoUrl.startsWith('data:') ? q.photoUrl : `http://localhost:5000${q.photoUrl}`)
                    : null;
                  const dateStr = q.createdAt ? new Date(q.createdAt).toLocaleDateString('fr-FR') : (q.date || 'Récent');

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

                        <h3 className="font-bold text-slate-900 text-lg">{q.name} <span className="text-xs font-semibold text-slate-500 font-sans">({q.customerType || 'Particulier'})</span></h3>
                        <p className="text-xs text-slate-600 font-mono mb-3">
                          📞 {q.phone} {q.city ? `· 📍 ${q.city}` : ''} {q.email ? `· ✉ ${q.email}` : ''}
                        </p>

                        <div className="bg-white p-3 border border-slate-200 rounded text-xs space-y-1.5 mb-4">
                          <div><strong className="text-slate-700">Véhicule :</strong> {q.vehicleBrand || 'Non précisé'} {q.vehicleModel} {q.vehicleYear ? `(${q.vehicleYear})` : ''}</div>
                          <div><strong className="text-slate-700">Composant & Réf :</strong> {q.partCategory} {q.partRef ? `— ${q.partRef}` : ''}</div>
                          {q.description && (
                            <div className="pt-1 border-t border-slate-100 mt-1">
                              <strong className="text-red-700 block mb-0.5">Problème / Symptômes :</strong>
                              <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 italic font-sans leading-relaxed">"{q.description}"</p>
                            </div>
                          )}
                        </div>

                        {photoSrc && (
                          <div className="mb-4">
                            <span className="text-xs font-semibold text-slate-700 block mb-1">Photo transmise par le client :</span>
                            <a href={photoSrc} target="_blank" rel="noopener noreferrer">
                              <img src={photoSrc} alt="Photo du devis" className="h-28 rounded border border-slate-300 object-cover hover:opacity-90 transition-opacity cursor-pointer" />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600">Prix chiffré (MAD) :</span>
                          <input
                            type="number"
                            defaultValue={q.estimatedPrice || ''}
                            placeholder="Ex: 1200"
                            onBlur={e => {
                              const val = e.target.value ? Number(e.target.value) : undefined;
                              updateQuoteStatus(q._id || q.id, undefined, val);
                            }}
                            className="w-32 text-right font-mono font-bold text-sm bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button
                            onClick={() => updateQuoteStatus(q._id || q.id, 'En cours de chiffrage')}
                            className="py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold uppercase rounded transition-colors"
                          >
                            En chiffrage
                          </button>
                          <button
                            onClick={() => updateQuoteStatus(q._id || q.id, 'Devis envoyé')}
                            className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase rounded transition-colors"
                          >
                            Envoyé
                          </button>
                          <button
                            onClick={() => updateQuoteStatus(q._id || q.id, 'Accepté')}
                            className="py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold uppercase rounded transition-colors"
                          >
                            Accepté
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Réparations */}
        {tab === 'repairs' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h2 className="font-display text-2xl font-bold uppercase text-slate-900 mb-6">
              Mise à jour du Statut Atelier des Réparations
            </h2>

            <div className="space-y-4">
              {repairList.map(rep => (
                <div key={rep.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 text-white rounded mr-2">
                      {rep.ticketNumber}
                    </span>
                    <strong className="text-slate-900">{rep.partName} (Réf. {rep.ref})</strong>
                    <span className="text-xs text-slate-500 block mt-0.5">Client : {rep.customerName} ({rep.phone}) — {rep.vehicle}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <span className="block font-semibold text-slate-700">Étape actuelle :</span>
                      <span className="font-bold text-blue-600">{rep.status} ({rep.progressPercentage}%)</span>
                    </div>

                    <select
                      value={rep.status}
                      onChange={e => {
                        const newStatus = e.target.value as RepairTicket['status'];
                        const perc = newStatus === 'Réceptionné' ? 20 : newStatus === 'Diagnostic' ? 40 : newStatus === 'Nettoyage Ultrasons' ? 60 : newStatus === 'Calibration Banc EPS 200' ? 80 : 100;
                        updateRepairStatus(rep.id, newStatus, perc);
                      }}
                      className="text-xs bg-white border border-slate-300 rounded px-3 py-2 outline-none font-semibold cursor-pointer"
                    >
                      <option value="Réceptionné">1. Réceptionné (20%)</option>
                      <option value="Diagnostic">2. Diagnostic (40%)</option>
                      <option value="Nettoyage Ultrasons">3. Nettoyage (60%)</option>
                      <option value="Calibration Banc EPS 200">4. Calibration Banc EPS 200 (80%)</option>
                      <option value="Prêt à livrer">5. Prêt à livrer (100%)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Produits */}
        {tab === 'products' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase text-slate-900">
                  Gestion des Produits & Stocks ({productList.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">Ajoutez, modifiez le prix/stock ou supprimez les pièces de votre catalogue.</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs uppercase rounded hover:bg-blue-700 transition-colors shadow"
              >
                {showAddForm ? 'Fermer le Formulaire' : '+ Ajouter un Produit'}
              </button>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="grid sm:grid-cols-3 gap-3 mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Rechercher par nom, marque ou référence..."
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <select
                  value={prodCategory}
                  onChange={e => setProdCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="injecteur">Injecteur Diesel</option>
                  <option value="pompe">Pompe Haute Pression</option>
                  <option value="capteur">Capteur de Pression</option>
                  <option value="joint">Joint Pare-feu</option>
                  <option value="regulateur">Régulateur DRV</option>
                </select>
              </div>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
                <h3 className="font-bold text-lg text-slate-800 mb-4 uppercase text-xs tracking-wider">Créer un nouveau produit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nom du Produit *</label>
                    <input type="text" name="name" required className="w-full text-xs p-2 border border-slate-300 rounded bg-white" placeholder="Ex: Injecteur Bosch Common Rail..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Référence / OEM *</label>
                    <input type="text" name="reference" required className="w-full text-xs p-2 border border-slate-300 rounded bg-white" placeholder="Ex: 0445110369" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Marque</label>
                    <input type="text" name="brand" className="w-full text-xs p-2 border border-slate-300 rounded bg-white" placeholder="Ex: Bosch, Delphi, Denso..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Catégorie *</label>
                    <select name="category" required className="w-full text-xs p-2 border border-slate-300 rounded bg-white">
                      <option value="injecteur">Injecteur Diesel</option>
                      <option value="pompe">Pompe Haute Pression</option>
                      <option value="capteur">Capteur de Pression</option>
                      <option value="joint">Joint Pare-feu</option>
                      <option value="regulateur">Régulateur DRV</option>
                      <option value="valve">Valve d&apos;Injecteur</option>
                      <option value="durite">Durite Carburant</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Prix (MAD) *</label>
                    <input type="number" name="price" required min="0" className="w-full text-xs p-2 border border-slate-300 rounded bg-white" placeholder="Ex: 1500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Stock *</label>
                    <input type="number" name="stock" required min="0" defaultValue="1" className="w-full text-xs p-2 border border-slate-300 rounded bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Images du produit (jusqu&apos;à 3)</label>
                    <input
                      type="file"
                      name="images"
                      multiple
                      accept="image/*"
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                      onChange={e => {
                        const files = Array.from(e.target.files || []).slice(0, 3);
                        const previews: string[] = [];
                        let loaded = 0;
                        if (files.length === 0) {
                          setAddImagePreviews([]);
                          return;
                        }
                        files.forEach((file, idx) => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            previews[idx] = reader.result as string;
                            loaded++;
                            if (loaded === files.length) {
                              setAddImagePreviews([...previews]);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                    {addImagePreviews.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {addImagePreviews.map((src, i) => (
                          <div key={i} className="relative">
                            <img src={src} alt={`Aperçu ${i}`} className="h-20 w-20 object-cover rounded border-2 border-green-400" />
                          </div>
                        ))}
                        <span className="text-xs text-green-600 font-semibold">{addImagePreviews.length} image(s) sélectionnée(s)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description détaillée</label>
                  <textarea name="description" rows={3} className="w-full text-xs p-2 border border-slate-300 rounded bg-white" placeholder="Caractéristiques techniques, référence croisée..."></textarea>
                </div>

                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="isReconditioned" defaultChecked /> Reconditionné OEM
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="isNewPart" /> Pièce Neuve
                  </label>
                </div>

                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-50 shadow">
                  {isSubmitting ? 'Enregistrement...' : 'Sauvegarder le Produit'}
                </button>
              </form>
            )}

            {productList.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500 font-semibold mb-2">Aucun produit dans la base de données.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded shadow"
                >
                  Ajouter le premier produit +
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productList
                  .filter(p => {
                    const matchCat = prodCategory === 'all' || p.category === prodCategory;
                    const s = prodSearch.toLowerCase();
                    const matchSearch = !s || (p.name || '').toLowerCase().includes(s) || (p.reference || p.ref || '').toLowerCase().includes(s) || (p.brand || '').toLowerCase().includes(s);
                    return matchCat && matchSearch;
                  })
                  .map(p => {
                    const inStock = p.stock > 0;

                    // Category-aware placeholder images
                    const CATEGORY_PLACEHOLDERS: Record<string, string> = {
                      injecteur: 'https://placehold.co/150x150/dbeafe/1d4ed8?text=Injecteur',
                      pompe: 'https://placehold.co/150x150/fef9c3/854d0e?text=Pompe+HP',
                      capteur: 'https://placehold.co/150x150/dcfce7/15803d?text=Capteur',
                      joint: 'https://placehold.co/150x150/fce7f3/9d174d?text=Joint',
                      regulateur: 'https://placehold.co/150x150/ede9fe/6d28d9?text=Régulateur',
                      valve: 'https://placehold.co/150x150/ffedd5/c2410c?text=Valve',
                      durite: 'https://placehold.co/150x150/f0fdf4/166534?text=Durite',
                      autre: 'https://placehold.co/150x150/f1f5f9/475569?text=Pièce',
                    };
                    const rawImg = (p.images && p.images.length > 0) ? p.images[0] : p.imageUrl;
                    const imgSrc = rawImg
                      ? (rawImg.startsWith('http') ? rawImg : `http://localhost:5000${rawImg}`)
                      : (CATEGORY_PLACEHOLDERS[p.category] || 'https://placehold.co/150x150/e2e8f0/64748b?text=Produit');
                    const imgCount = (p.images && p.images.length > 0) ? p.images.length : (p.imageUrl ? 1 : 0);

                    return (
                      <div key={p._id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                              {p.brand || 'Multimarque'}
                            </span>
                            <button
                              onClick={() => toggleStock(p._id, p.stock)}
                              className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${
                                inStock ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {inStock ? `● En Stock (${p.stock})` : '○ Rupture'}
                            </button>
                          </div>

                          <div className="flex mt-3">
                            <div className="relative shrink-0 mr-3">
                              <img src={imgSrc} alt={p.name} className="w-16 h-16 object-cover rounded border border-slate-200" />
                              {imgCount > 1 && (
                                <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[9px] font-bold px-1 rounded-full border border-white shadow-sm">
                                  📷 {imgCount}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 leading-tight line-clamp-2">{p.name}</h4>
                              <p className="text-[10px] font-mono text-slate-500 mt-1">RÉF: {p.reference || p.ref || 'N/A'}</p>
                              <div className="mt-1 space-x-1">
                                {p.isReconditioned && <span className="inline-block text-[9px] px-1 bg-amber-100 text-amber-800 rounded font-semibold">OEM</span>}
                                {p.isNewPart && <span className="inline-block text-[9px] px-1 bg-blue-100 text-blue-800 rounded font-semibold">NEUF</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                          <span className="font-display font-extrabold text-lg text-slate-900">
                            {(p.price ?? 0).toLocaleString('fr-MA')} MAD
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                const existing = p.images?.length ? p.images : (p.imageUrl ? [p.imageUrl] : []);
                                setRetainedImages(existing);
                                setEditImagePreviews([]);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                            >
                              ✏ Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="px-2 py-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded transition-colors"
                              title="Supprimer le produit"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Comptes & Clients */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase text-slate-900">
                  Comptes Utilisateurs & Garagistes ({usersList.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">Gérez les accès, les remises professionnelles et les points de fidélité.</p>
              </div>
            </div>

            {usersList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500 font-semibold">Aucun utilisateur enregistré pour le moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-xs border-b">
                    <tr>
                      <th className="p-3">Utilisateur</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Véhicule / Garage</th>
                      <th className="p-3">Rôle</th>
                      <th className="p-3">Remise Pro</th>
                      <th className="p-3">Points</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {usersList.map(u => (
                      <tr key={u._id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{u.firstName} {u.lastName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {u._id}</div>
                        </td>
                        <td className="p-3 text-xs">
                          <div>✉ {u.email}</div>
                          <div className="font-mono text-slate-500">📞 {u.phone}</div>
                        </td>
                        <td className="p-3 text-xs font-semibold text-slate-700">
                          {u.vehicleBrand || 'Non renseigné'}
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role || 'client'}
                            onChange={e => handleUpdateUserRole(u._id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            <option value="client">Client / Garagiste</option>
                            <option value="admin">Administrateur</option>
                          </select>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-700 text-xs">
                          -{u.discountRate || 5}%
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800 text-xs">
                          {u.loyaltyPoints || 0} pts
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.email)}
                            className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
