import { useState, useEffect } from 'react';
import type { Category, Brand } from '../types';
import { getCategoryLabel } from '../data/products';
import { getProductsApi } from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import { useLanguage } from '../context/LanguageContext';

interface CatalogProps {
  onProductSelect: (id: string) => void;
  initialCategory?: string;
}

const BRANDS: Brand[] = ['Bosch', 'Delphi', 'Denso', 'Zexel', 'Siemens', 'ROLLANT', 'Multimarque'];

// Fallback placeholder image for products without images
const PLACEHOLDER = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format';

// Map API product to a display shape compatible with the component
interface ApiProduct {
  _id: string;
  name: string;
  reference: string;
  category: string;
  brand: string;
  price: number | null;
  oldPrice?: number | null;
  stock: number;
  imageUrl?: string;
  images?: string[];
  compatibleVehicles?: string[];
  description?: string;
  isReconditioned?: boolean;
  isNewPart?: boolean;
  remarque?: string;
}

export default function Catalog({ onProductSelect, initialCategory }: CatalogProps) {
  const { dict, language } = useLanguage();
  const [category, setCategory] = useState<Category | 'all'>((initialCategory as Category) || 'all');
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'price-asc' | 'price-desc' | 'name'>('name');

  // API state
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const CATEGORIES: { val: Category | 'all'; label: string }[] = [
    { val: 'all', label: dict.catalog.allCategories },
    { val: 'injecteur', label: dict.nav.categories.injecteur },
    { val: 'pompe', label: dict.nav.categories.pompe },
    { val: 'capteur', label: dict.nav.categories.capteur },
    { val: 'joint', label: dict.nav.categories.joint },
    { val: 'regulateur', label: dict.nav.categories.regulateur },
    { val: 'valve', label: dict.nav.categories.valve },
    { val: 'durite', label: dict.nav.categories.durite },
  ];

  // Load products from API on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setApiError('');
      try {
        const data = await getProductsApi({ limit: 200 });
        if (!cancelled) {
          const list: ApiProduct[] = Array.isArray(data) ? data : (data.products ?? []);
          setAllProducts(list);
        }
      } catch (err: any) {
        if (!cancelled) {
          setApiError(err.message || dict.common.error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Sync initialCategory prop changes
  useEffect(() => {
    if (initialCategory) setCategory(initialCategory as Category);
  }, [initialCategory]);

  const toggleBrand = (b: Brand) =>
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);

  // Filter + sort
  let filtered = allProducts
    .filter(p => category === 'all' || p.category === category)
    .filter(p => selectedBrands.length === 0 || selectedBrands.includes(p.brand as Brand))
    .filter(p => !onlyInStock || p.stock > 0)
    .filter(p => {
      if (!search) return true;
      const terms = search.toLowerCase().split(/[\s,;]+/).map(term => term.trim()).filter(Boolean);
      const searchableText = [
        p.name,
        p.reference,
        p.brand,
        ...(p.compatibleVehicles ?? []),
        p.description ?? '',
      ].join(' ').toLowerCase();
      return terms.every(term => searchableText.includes(term));
    });

  if (sort === 'price-asc') {
    filtered = [...filtered].sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return a.price - b.price;
    });
  }
  if (sort === 'price-desc') {
    filtered = [...filtered].sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return b.price - a.price;
    });
  }
  if (sort === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const countFor = (cat: string) =>
    cat === 'all' ? allProducts.length : allProducts.filter(p => p.category === cat).length;

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      {/* Page header */}
      <div className="bg-slate-800 border-b border-slate-700 text-white py-8 px-6 shadow-inner">
        <div className="max-w-[1440px] mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-blue-400 mb-1">
            {dict.catalog.headerBadge}
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
            {dict.catalog.headerTitle}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl">
            {dict.catalog.headerDesc}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6 lg:h-[calc(100vh-17rem)] lg:min-h-[560px] lg:overflow-hidden flex gap-8">
        {/* ── Sidebar filters ── */}
        <aside className="hidden lg:flex flex-col gap-6 w-64 shrink-0 bg-white rounded-xl shadow-md border border-slate-200 p-6 self-start h-full overflow-y-auto">
          {/* Category */}
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 tracking-wider">
              {dict.catalog.categoryFilterTitle}
            </h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(c => (
                <button
                  key={c.val}
                  onClick={() => setCategory(c.val)}
                  className={`flex items-center justify-between py-2 px-3 text-xs font-semibold rounded transition-all ${
                    category === c.val
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {countFor(c.val)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 tracking-wider">
              {dict.catalog.brandFilterTitle}
            </h3>
            <div className="flex flex-col gap-2">
              {BRANDS.map(b => (
                <label key={b} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                    {b}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="border-t border-slate-200 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                {dict.catalog.onlyInStock}
              </span>
            </label>
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div className="flex-1 min-w-0 lg:h-full lg:overflow-y-auto lg:pr-2">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 lg:sticky lg:top-0 lg:z-10">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={dict.catalog.searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
              className="px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded outline-none cursor-pointer font-semibold"
            >
              <option value="name">{dict.catalog.sortName}</option>
              <option value="price-asc">{dict.catalog.sortPriceAsc}</option>
              <option value="price-desc">{dict.catalog.sortPriceDesc}</option>
            </select>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-20 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-semibold">{dict.catalog.loadingCatalog}</p>
              </div>
            </div>
          )}

          {/* API Error */}
          {!loading && apiError && (
            <div className="py-10 text-center bg-red-50 rounded-xl border border-red-200 shadow-sm">
              <p className="text-sm text-red-600 font-semibold">⚠ {apiError}</p>
            </div>
          )}

          {/* Count */}
          {!loading && !apiError && (
            <p className="text-xs text-slate-500 mb-4 font-semibold">
              {filtered.length} {dict.catalog.productsFound}
            </p>
          )}

          {/* Grid */}
          {!loading && !apiError && (
            filtered.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                <p className="text-lg font-display text-slate-500">{dict.catalog.noProducts}</p>
                <button
                  className="mt-4 text-xs font-bold text-blue-600 uppercase tracking-wider"
                  onClick={() => { setSearch(''); setCategory('all'); setSelectedBrands([]); }}
                >
                  {dict.catalog.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(p => {
                  const CATEGORY_PLACEHOLDERS: Record<string, string> = {
                    injecteur: 'https://placehold.co/600x400/dbeafe/1d4ed8?text=Injecteur+Diesel',
                    pompe: 'https://placehold.co/600x400/fef9c3/854d0e?text=Pompe+Haute+Pression',
                    capteur: 'https://placehold.co/600x400/dcfce7/15803d?text=Capteur+Pression',
                    joint: 'https://placehold.co/600x400/fce7f3/9d174d?text=Joint+Pare-feu',
                    regulateur: 'https://placehold.co/600x400/ede9fe/6d28d9?text=Régulateur+DRV',
                    valve: 'https://placehold.co/600x400/ffedd5/c2410c?text=Valve+Injecteur',
                    durite: 'https://placehold.co/600x400/f0fdf4/166534?text=Durite+Carburant',
                    autre: 'https://placehold.co/600x400/f1f5f9/475569?text=Pièce+Diesel',
                  };
                  const rawImg = (p.images && p.images.length > 0) ? p.images[0] : p.imageUrl;
                  const imgSrc = resolveMediaUrl(rawImg, CATEGORY_PLACEHOLDERS[p.category] || PLACEHOLDER);
                  const inStock = p.stock > 0;

                  return (
                    <button
                      key={p._id}
                      onClick={() => onProductSelect(p._id)}
                      className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-left hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative h-44 bg-slate-100 overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {p.brand && (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-600 text-white">
                                {p.brand}
                              </span>
                            )}
                            {p.isReconditioned && (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-amber-500 text-slate-950">
                                {dict.common.reconditioned}
                              </span>
                            )}
                            {p.isNewPart && !p.isReconditioned && (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-green-600 text-white">
                                {dict.common.newPart}
                              </span>
                            )}
                          </div>
                          {!inStock && (
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                              <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 bg-red-600 text-white rounded shadow">
                                {p.remarque || dict.common.outOfStock}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-4">
                          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                            {getCategoryLabel(p.category)}
                          </div>
                          <div className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-xs font-mono text-slate-500 mb-2">Réf. {p.reference}</div>
                          {(p.compatibleVehicles ?? []).length > 0 && (
                            <div className="text-[10px] text-slate-500 mb-3 leading-relaxed font-mono">
                              {(p.compatibleVehicles ?? []).slice(0, 2).join(' · ')}
                              {(p.compatibleVehicles ?? []).length > 2 ? ` +${(p.compatibleVehicles ?? []).length - 2}` : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-xl font-extrabold text-slate-900">
                            {p.price != null ? `${p.price.toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-MA')} ${dict.common.mad}` : dict.common.priceOnRequest}
                          </span>
                          {p.oldPrice != null && (
                            <span className="text-xs text-slate-400 line-through">
                              {p.oldPrice.toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-MA')}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {inStock && (
                            <span className="text-[9px] font-bold text-green-600 uppercase">
                              {dict.common.inStock} ({p.stock})
                            </span>
                          )}
                          <span className="text-xs font-bold text-blue-600">{dict.common.viewDetails}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}