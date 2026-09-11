import { useState, useEffect } from 'react';
import type { Page, RepairTicket, Product, Order, QuoteRequest, ApiUser, ApiOrderItem } from '../types';
import { MOCK_REPAIR_TICKETS } from '../data/mockData';
import {
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
  createProductApi,
} from '../services/api';
import { useAuth, getSession } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ORDER_STATUSES, type OrderStatus } from '../utils/orderStatus';
import OrdersTab from './admin/OrdersTab';
import QuotesTab from './admin/QuotesTab';
import ProductsTab from './admin/ProductsTab';
import UsersTab from './admin/UsersTab';
import RepairsTab from './admin/RepairsTab';
import { downloadExcel, parseCsv } from '../utils/spreadsheet';

interface AdminBackofficeProps {
  navigate: (page: Page) => void;
}

export default function AdminBackoffice({ navigate }: AdminBackofficeProps) {
  const { user, logout } = useAuth();
  const activeUser = user || getSession();
  const { notify } = useToast();
  const [tab, setTab] = useState<'products' | 'orders' | 'quotes' | 'users'>('products');
  const [productList, setProductList] = useState<Product[]>([]);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [quoteList, setQuoteList] = useState<QuoteRequest[]>([]);
  const [usersList, setUsersList] = useState<ApiUser[]>([]);
  const [repairList, setRepairList] = useState<RepairTicket[]>(MOCK_REPAIR_TICKETS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ id: number; message: string; onConfirm: () => void } | null>(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Image previews for add / edit forms
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [retainedImages, setRetainedImages] = useState<string[]>([]);

  // Product filters
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategory, setProdCategory] = useState('all');

  const loadAllData = async () => {
    setIsLoading(true);
    setLoadError(null);
    let hadError = false;

    try {
      const pData = await getProductsApi({ limit: 500 });
      const pList = Array.isArray(pData) ? pData : (pData.products || []);
      setProductList(pList);
    } catch (e) {
      console.error("Error loading products:", e);
      hadError = true;
    }

    if (activeUser && activeUser.token) {
      try {
        const [ordersData, quotesData, usersData] = await Promise.all([
          getAllOrdersApi<{ orders?: Order[] }>(activeUser.token).catch((err) => { console.error(err); hadError = true; return { orders: [] }; }),
          getAllQuotesApi<{ quotes?: QuoteRequest[] }>(activeUser.token).catch((err) => { console.error(err); hadError = true; return { quotes: [] }; }),
          getAllUsersApi(activeUser.token).catch((err) => { console.error(err); hadError = true; return []; })
        ]);
        setOrderList(Array.isArray(ordersData) ? ordersData as unknown as Order[] : (ordersData.orders || []));
        setQuoteList(Array.isArray(quotesData) ? quotesData as unknown as QuoteRequest[] : (quotesData.quotes || []));
        setUsersList(Array.isArray(usersData) ? usersData : []);
      } catch (e) {
        console.error("Error loading admin data:", e);
        hadError = true;
      }
    }

    if (hadError && productList.length === 0 && orderList.length === 0) {
      setLoadError("Certaines données n'ont pas pu être chargées depuis le serveur.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [activeUser?.token]);


  const confirmAction = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ id: Date.now(), message, onConfirm });
  };

  const exportOrdersToExcel = () => {
    if (!orderList.length) {
      notify('Aucune commande à exporter.', 'info');
      return;
    }
    const dataToExport = orderList.map(ord => ({
      "N° Commande": ord.orderNumber,
      "Date": new Date(ord.createdAt || ord.date || Date.now()).toLocaleDateString('fr-FR'),
      "Client": `${ord.guestInfo?.firstName} ${ord.guestInfo?.lastName}`,
      "Téléphone": ord.guestInfo?.phone,
      "Ville": ord.guestInfo?.city,
      "Adresse": ord.guestInfo?.address,
      "Articles Commandés": (ord.items as ApiOrderItem[]).map((i) => `${i.productName} (x${i.qty})`).join('\n'),
      "Nombre d'Articles": (ord.items as ApiOrderItem[]).reduce((acc: number, i) => acc + i.qty, 0),
      "Total (MAD)": ord.total,
      "Mode de Règlement": ord.guestInfo?.paymentMethod === 'especes' ? 'Espèces' : 'Virement',
      "Statut": ord.status,
      "Type Client": ord.isGuest ? 'Invité' : 'Inscrit'
    }));

    void downloadExcel(dataToExport, `Commandes_TIFAOUT_AUTO_${new Date().toISOString().slice(0, 10)}.xlsx`);
    notify('Export Excel des commandes prêt.', 'success');
  };

  const exportQuotesToExcel = () => {
    if (!quoteList.length) {
      notify('Aucun devis à exporter.', 'info');
      return;
    }
    const dataToExport = quoteList.map(q => ({
      "N° Devis": q.quoteNumber,
      "Date": q.createdAt
        ? new Date(q.createdAt).toLocaleDateString('fr-FR')
        : '—',
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

    void downloadExcel(dataToExport, `Devis_TIFAOUT_AUTO_${new Date().toISOString().slice(0, 10)}.xlsx`);
    notify('Export Excel des devis prêt.', 'success');
  };

  const exportProductsToExcel = () => {
    if (!productList.length) {
      notify('Aucun produit à exporter.', 'info');
      return;
    }

    const dataToExport = productList.map(product => ({
      name: product.name || '',
      reference: product.reference || product.ref || '',
      category: product.category || 'autre',
      brand: product.brand || '',
      price: product.price ?? 0,
      oldPrice: product.oldPrice ?? '',
      stock: product.stock ?? 0,
      description: product.description || '',
      compatibleVehicles: Array.isArray(product.compatibleVehicles) ? product.compatibleVehicles.join(', ') : '',
      isReconditioned: Boolean(product.isReconditioned),
      isNewPart: Boolean(product.isNewPart),
      remarque: product.remarque || '',
      imageUrl: product.imageUrl || '',
    }));

    void downloadExcel(dataToExport, `Produits_TIFAOUT_AUTO_${new Date().toISOString().slice(0, 10)}.xlsx`);
    notify(`${dataToExport.length} produit(s) exporté(s).`, 'success');
  };

  const importProductsFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !user?.token) return;

    try {
      const rows = parseCsv(await file.text()) as Record<string, unknown>[];
      const categories = new Set(['injecteur', 'pompe', 'capteur', 'joint', 'regulateur', 'valve', 'durite', 'autre']);
      const existingReferences = new Set(productList.map(product => String(product.reference || product.ref || '').trim().toLowerCase()));
      const importedProducts: Product[] = [];
      const errors: string[] = [];

      for (const [index, row] of rows.entries()) {
        const line = index + 2;
        const value = (key: string) => String(row[key] ?? '').trim();
        const name = value('name');
        const reference = value('reference');
        const category = value('category').toLowerCase();
        const price = Number(value('price').replace(',', '.'));
        const stockValue = value('stock');
        const stock = stockValue === '' ? 0 : Number(stockValue.replace(',', '.'));

        if (!name || !reference || !categories.has(category) || !Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
          errors.push(`Ligne ${line}: nom, référence, catégorie, prix ou stock invalide.`);
          continue;
        }
        if (existingReferences.has(reference.toLowerCase())) {
          errors.push(`Ligne ${line}: référence déjà existante (${reference}).`);
          continue;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('reference', reference);
        formData.append('category', category);
        formData.append('brand', value('brand'));
        formData.append('price', String(price));
        formData.append('stock', String(stock));
        formData.append('oldPrice', value('oldPrice'));
        formData.append('description', value('description'));
        formData.append('compatibleVehicles', JSON.stringify(value('compatibleVehicles').split(',').map(item => item.trim()).filter(Boolean)));
        formData.append('isReconditioned', String(['true', '1', 'oui', 'yes'].includes(value('isReconditioned').toLowerCase())));
        formData.append('isNewPart', String(['true', '1', 'oui', 'yes'].includes(value('isNewPart').toLowerCase())));
        formData.append('remarque', value('remarque'));
        formData.append('imageUrl', value('imageUrl'));

        try {
          const created = await createProductApi(formData, user.token);
          importedProducts.push(created);
          existingReferences.add(reference.toLowerCase());
        } catch (error: any) {
          errors.push(`Ligne ${line}: ${error.message || 'création impossible.'}`);
        }
      }

      if (importedProducts.length) setProductList(prev => [...importedProducts, ...prev]);
      const summary = `${importedProducts.length} ajouté(s), ${errors.length} erreur(s).`;
      notify(errors.length ? summary : `${summary} Import terminé.`, errors.length ? 'error' : 'success');
      if (errors.length) console.warn('[AdminBackoffice] erreurs import Excel:', errors);
    } catch (error: any) {
      console.error('[AdminBackoffice] import Excel error:', error);
      notify(error.message || 'Fichier Excel invalide.', 'error');
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const newProduct = await createProductApi(formData, user?.token || '');
      setProductList(prev => [newProduct, ...prev]);
      setShowAddForm(false);
      setAddImagePreviews([]);
      notify('Produit ajouté avec succès !', 'success');
    } catch (error: any) {
      console.error(error);
      notify(error.message || 'Erreur de connexion au serveur backend.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingProduct || !editingProduct._id || !user?.token) return;

    setIsEditSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append('retainedImages', JSON.stringify(retainedImages));

    try {
      const updated = await updateProductApi(
        editingProduct._id,
        formData,
        user.token
      );

      setProductList(prev =>
        prev.map(p =>
          p._id === editingProduct._id ? updated : p
        )
      );

      setEditingProduct(null);
      setEditImagePreviews([]);
      notify('Produit mis à jour avec succès !', 'success');
    } catch (err: any) {
      notify(err.message || 'Erreur lors de la modification.', 'error');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    confirmAction(`Êtes-vous sûr de vouloir supprimer définitivement "${name}" ?`, async () => {
      if (!user || !user.token) {
        notify('Veuillez vous connecter avec un compte Administrateur.', 'error');
        return;
      }
      try {
        await deleteProductApi(id, user.token);
        setProductList(prev => prev.filter(p => p._id !== id));
        notify('Produit supprimé avec succès.', 'success');
      } catch (err: any) {
        notify(err.message || 'Erreur lors de la suppression.', 'error');
      }
    });
  };

  const toggleStock = async (id: string, currentStock: number) => {
    if (!user || !user.token) {
      notify('Action réservée à l\'administrateur connecté.', 'error');
      return;
    }
    const newStock = currentStock > 0 ? 0 : 10;
    try {
      await updateProductApi(id, { stock: newStock }, user.token);
      setProductList(prev => prev.map(p => p._id === id ? { ...p, stock: newStock } : p));
      notify(newStock > 0 ? 'Stock réactivé avec succès.' : 'Produit mis en rupture de stock.', 'success');
    } catch (err) {
      notify('Erreur lors de la modification du stock', 'error');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!user?.token) return;
    try {
      const updated = await updateUserApi(userId, { role: newRole }, user.token);
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: updated.role } : u));
      notify(`Rôle mis à jour: ${newRole}`, 'success');
    } catch (err: any) {
      notify(err.message || 'Erreur modification rôle', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    confirmAction(`Supprimer le compte ${email} ?`, async () => {
      if (!user?.token) return;
      try {
        await deleteUserApi(userId, user.token);
        setUsersList(prev => prev.filter(u => u._id !== userId));
        notify('Compte supprimé.', 'success');
      } catch (err: any) {
        notify(err.message || 'Erreur suppression compte.', 'error');
      }
    });
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    if (!user || !user.token) return;

    const nextStatus = status.trim() as OrderStatus;
    if (!ORDER_STATUSES.includes(nextStatus)) return;

    try {
      await updateOrderStatusApi(id, nextStatus, user.token);
      setOrderList(prev => prev.map(o => o._id === id ? { ...o, status: nextStatus } : o));
      notify('Statut de commande mis à jour.', 'success');
    } catch (error) {
      console.error('Update order status error:', error);
      notify('Erreur lors de la mise à jour du statut.', 'error');
    }
  };

  type QuoteStatus =
    | 'En attente'
    | 'En cours de chiffrage'
    | 'Devis envoyé'
    | 'Accepté'
    | 'Refusé';

  const updateQuoteStatus = async (
    id: string,
    status?: QuoteStatus,
    estimatedPrice?: number
  ) => {
    if (!user || !user.token) return;

    try {
      const payload: Partial<QuoteRequest> = {};

      if (status) {
        payload.status = status;
      }

      if (estimatedPrice !== undefined) {
        payload.estimatedPrice = estimatedPrice;
      }

      const updated = await updateQuoteStatusApi(
        id,
        payload,
        user.token
      );

      setQuoteList(prev =>
        prev.map(q =>
          q._id === id
            ? { ...q, ...(updated as Record<string, any>) }
            : q
        )
      );

      notify('Devis mis à jour.', 'success');
    } catch (error) {
      console.error('Update quote status error:', error);
      notify('Erreur lors de la mise à jour du devis.', 'error');
    }
  };

  const updateRepairStatus = (id: string, status: RepairTicket['status'], progressPercentage: number) => {
    setRepairList(prev => prev.map(r => r.id === id ? { ...r, status, progressPercentage } : r));
    notify('Statut atelier mis à jour.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      {confirmDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold uppercase tracking-wide text-slate-900">Confirmation</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{confirmDialog.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="rounded border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirmation && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold uppercase tracking-wide text-slate-900">Confirmer la déconnexion</h3>
            <p className="mt-3 text-sm text-slate-600">Voulez-vous vraiment vous déconnecter ?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowLogoutConfirmation(false)} className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-700 hover:bg-slate-200">Non</button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirmation(false);
                  logout();
                  notify('Déconnexion réussie.', 'success');
                  navigate('auth');
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-red-700"
              >
                Oui, déconnecter
              </button>
            </div>
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
              {activeUser && (
                <span className="px-2 py-0.5 bg-blue-900 text-blue-300 text-[10px] font-bold rounded uppercase ml-2">
                  Connecté : {activeUser.firstName || activeUser.name || 'Admin'} ({activeUser.role})
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
            {activeUser ? (
              <button
                onClick={() => setShowLogoutConfirmation(true)}
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
        {loadError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
            <span>⚠️ {loadError}</span>
            <button
              onClick={loadAllData}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow transition"
            >
              Réactualiser
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-300 mb-8 bg-white rounded-t-xl px-4 shadow-sm overflow-x-auto">

          {[
            { id: 'products', label: ' Catalogue Produits', count: productList.length },
            { id: 'orders', label: ' Commandes Web', count: orderList.length },
            { id: 'quotes', label: ' Devis Reçus', count: quoteList.length },
            { id: 'users', label: ' Comptes & Garagistes', count: usersList.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'products' | 'orders' | 'quotes' | 'users')}
              className={`py-4 px-5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${tab === t.id
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>{t.label}</span>
              <span className={`px-2 py-0.5 text-xs font-mono rounded-full ${tab === t.id ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-600'
                }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <OrdersTab
            orderList={orderList}
            exportOrdersToExcel={exportOrdersToExcel}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {tab === 'quotes' && (
          <QuotesTab
            quoteList={quoteList}
            exportQuotesToExcel={exportQuotesToExcel}
            updateQuoteStatus={updateQuoteStatus}
          />
        )}


        {tab === 'products' && (
          <ProductsTab
            productList={productList}
            showAddForm={showAddForm}
            prodSearch={prodSearch}
            prodCategory={prodCategory}
            isSubmitting={isSubmitting}
            addImagePreviews={addImagePreviews}
            editingProduct={editingProduct}
            retainedImages={retainedImages}
            editImagePreviews={editImagePreviews}
            onToggleAddForm={() => setShowAddForm(!showAddForm)}
            onExportProducts={exportProductsToExcel}
            onImportProducts={importProductsFromExcel}
            onSearchChange={setProdSearch}
            onCategoryChange={setProdCategory}
            onAddProduct={handleAddProduct}
            onAddImageChange={e => {
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
            onEditProduct={handleEditProduct}
            onEditImageChange={e => {
              const maxNew = 3 - retainedImages.length;
              if (maxNew <= 0) {
                notify('Vous avez déjà 3 images. Supprimez-en une d\'abord.', 'info');
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
            onToggleStock={toggleStock}
            onDeleteProduct={handleDeleteProduct}
            onStartEdit={product => {
              setEditingProduct(product);
              const existing = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []);
              setRetainedImages(existing);
              setEditImagePreviews([]);
            }}
            onCancelEdit={() => {
              setEditingProduct(null);
              setEditImagePreviews([]);
            }}
            onRemoveRetainedImage={img => setRetainedImages(prev => prev.filter(item => item !== img))}
            onSetRetainedImages={setRetainedImages}
          />
        )}

        {tab === 'users' && (
          <UsersTab
            usersList={usersList}
            handleUpdateUserRole={handleUpdateUserRole}
            handleDeleteUser={handleDeleteUser}
          />
        )}
      </div>
    </div>
  );
}
