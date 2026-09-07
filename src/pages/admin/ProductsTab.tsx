import { resolveMediaUrl } from '../../utils/media';

interface ProductsTabProps {
  productList: any[];
  showAddForm: boolean;
  prodSearch: string;
  prodCategory: string;
  isSubmitting: boolean;
  addImagePreviews: string[];
  editingProduct: any;
  retainedImages: string[];
  editImagePreviews: string[];
  onToggleAddForm: () => void;
  onExportProducts: () => void;
  onImportProducts: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAddProduct: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onAddImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditProduct: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onEditImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleStock: (id: string, currentStock: number) => Promise<void>;
  onDeleteProduct: (id: string, name: string) => Promise<void>;
  onStartEdit: (product: any) => void;
  onCancelEdit: () => void;
  onRemoveRetainedImage: (value: string) => void;
  onSetRetainedImages: (value: string[]) => void;
}

export default function ProductsTab({
  productList,
  showAddForm,
  prodSearch,
  prodCategory,
  isSubmitting,
  addImagePreviews,
  editingProduct,
  retainedImages,
  editImagePreviews,
  onToggleAddForm,
  onExportProducts,
  onImportProducts,
  onSearchChange,
  onCategoryChange,
  onAddProduct,
  onAddImageChange,
  onEditProduct,
  onEditImageChange,
  onToggleStock,
  onDeleteProduct,
  onStartEdit,
  onCancelEdit,
  onRemoveRetainedImage,
  onSetRetainedImages,
}: ProductsTabProps) {
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

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase text-slate-900">
            Gestion des Produits & Stocks ({productList.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">Ajoutez, modifiez le prix/stock ou supprimez les pièces de votre catalogue.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs uppercase rounded hover:bg-emerald-700 transition-colors shadow cursor-pointer">
            Importer Excel
            <input type="file" accept=".xlsx,.xls" onChange={onImportProducts} className="hidden" />
          </label>
          <button
            type="button"
            onClick={onExportProducts}
            className="px-3 py-2 bg-slate-700 text-white font-bold text-xs uppercase rounded hover:bg-slate-800 transition-colors shadow"
          >
            Exporter Excel
          </button>
          <button
            type="button"
            onClick={onToggleAddForm}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs uppercase rounded hover:bg-blue-700 transition-colors shadow"
          >
            {showAddForm ? 'Fermer le Formulaire' : '+ Ajouter un Produit'}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Rechercher par nom, marque ou référence..."
            value={prodSearch}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <select
            value={prodCategory}
            onChange={e => onCategoryChange(e.target.value)}
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
        <form onSubmit={onAddProduct} className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
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
                onChange={onAddImageChange}
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

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="font-display text-xl font-bold uppercase text-slate-900">Modifier le produit</h2>
              <button onClick={onCancelEdit} className="text-slate-400 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={onEditProduct} className="p-6 space-y-4">
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
                  {retainedImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Images actuelles</p>
                      <div className="flex gap-2 flex-wrap">
                        {retainedImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={resolveMediaUrl(img)} alt={`Existante ${idx}`} className="h-16 w-16 object-cover rounded border border-slate-200" />
                            <button
                              type="button"
                              onClick={() => onRemoveRetainedImage(img)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full text-sm p-1 border border-slate-300 rounded bg-white"
                    onChange={onEditImageChange}
                  />

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
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded transition-colors disabled:opacity-50">
                  Sauvegarder les modifications
                </button>
                <button type="button" onClick={onCancelEdit} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase rounded">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {productList.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
          <p className="text-slate-500 font-semibold mb-2">Aucun produit dans la base de données.</p>
          <button onClick={onToggleAddForm} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded shadow">Ajouter le premier produit +</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productList
            .filter((p: any) => {
              const matchCat = prodCategory === 'all' || p.category === prodCategory;
              const s = prodSearch.toLowerCase();
              const matchSearch = !s || (p.name || '').toLowerCase().includes(s) || (p.reference || p.ref || '').toLowerCase().includes(s) || (p.brand || '').toLowerCase().includes(s);
              return matchCat && matchSearch;
            })
            .map((p: any) => {
              const inStock = Number(p.stock ?? 0) > 0;
              const rawImg = p.images?.length ? p.images[0] : p.imageUrl;
              const imgSrc = rawImg ? resolveMediaUrl(rawImg, CATEGORY_PLACEHOLDERS[p.category] || 'https://placehold.co/150x150/e2e8f0/64748b?text=Produit') : (CATEGORY_PLACEHOLDERS[p.category] || 'https://placehold.co/150x150/e2e8f0/64748b?text=Produit');
              const imgCount = p.images?.length ? p.images.length : (p.imageUrl ? 1 : 0);

              return (
                <div key={p._id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {p.brand || 'Multimarque'}
                      </span>
                      <button
                        onClick={() => onToggleStock(p._id, p.stock)}
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
                    <span className="font-display font-extrabold text-lg text-slate-900">{(p.price ?? 0).toLocaleString('fr-MA')} MAD</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onStartEdit(p)}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded transition-colors"
                      >
                        ✏ Modifier
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p._id, p.name)}
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
  );
}
