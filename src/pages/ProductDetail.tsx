import { useState, useEffect } from 'react';
import type { Page, CartItem } from '../types';
import { getCategoryLabel } from '../data/products';
import { getProductByIdApi, getProductsApi } from '../services/api';
import { resolveMediaUrl } from '../utils/media';

interface ProductDetailProps {
  productId: string;
  navigate: (page: Page) => void;
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onProductSelect: (id: string) => void;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format';

export default function ProductDetail({ productId, navigate, cart: _cart, onAddToCart, onProductSelect }: ProductDetailProps) {
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProductByIdApi(productId);
        if (!cancelled) {
          setProduct(data);
          
          // Fetch related products (same category)
          try {
            const relatedData = await getProductsApi({ category: data.category, limit: 4 });
            const list = Array.isArray(relatedData) ? relatedData : (relatedData.products ?? []);
            if (!cancelled) {
              setRelated(list.filter((p: any) => p._id !== data._id).slice(0, 3));
            }
          } catch (e) {
            // ignore related fetch error
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Produit introuvable.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    loadProduct();
    setQty(1); // reset qty on product change
    setActiveImg(0); // reset image index
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    return () => { cancelled = true; };
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center pt-28 pb-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-semibold">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center pt-28 pb-16">
        <div className="text-center bg-white p-8 rounded-xl shadow-md border border-slate-200">
          <p className="text-lg font-bold text-slate-800 mb-4">{error || 'Produit introuvable.'}</p>
          <button onClick={() => navigate('catalog')} className="text-sm font-bold text-blue-600 hover:underline">
            ← Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  const CATEGORY_PLACEHOLDERS: Record<string, string> = {
    injecteur: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop&auto=format',
    pompe: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop&auto=format',
    capteur: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop&auto=format',
    joint: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop&auto=format',
    regulateur: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&h=600&fit=crop&auto=format',
    valve: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&h=600&fit=crop&auto=format',
    durite: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format',
    autre: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop&auto=format',
  };

  const defaultImg = CATEGORY_PLACEHOLDERS[product.category] || PLACEHOLDER;

  let rawImages: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    rawImages = product.images;
  } else if (product.imageUrl) {
    rawImages = [product.imageUrl];
  } else {
    rawImages = [defaultImg];
  }

  const images = rawImages.map(img => resolveMediaUrl(img, defaultImg));

  // Map backend format to frontend CartItem product structure
  const cartProduct = {
    id: product._id,
    ref: product.reference,
    name: product.name,
    category: product.category,
    brand: product.brand || 'Multimarque',
    price: product.price,
    oldPrice: product.oldPrice,
    images: images,
    compatible: product.compatibleVehicles || [],
    description: product.description || '',
    features: [], // backend doesn't have an array of features yet
    inStock: product.stock > 0,
    isReconditioned: product.isReconditioned || false,
  };

  const handleAdd = () => {
    onAddToCart({ product: cartProduct as any, qty });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  const inStock = product.stock > 0;

  const handlePrevImg = () => {
    setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImg = () => {
    setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-28 pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 h-12 flex items-center gap-2 text-xs text-slate-500 font-semibold overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button onClick={() => navigate('home')} className="hover:text-blue-600">Accueil</button>
          <span>/</span>
          <button onClick={() => navigate('catalog')} className="hover:text-blue-600">Catalogue</button>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-10">
        {/* Main Product Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 grid lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200 h-[420px] mb-4 group flex items-center justify-center">
              <img
                src={images[activeImg] || defaultImg}
                alt={`${product.name} - Vue ${activeImg + 1}`}
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).src = defaultImg; }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.brand && (
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-blue-600 text-white shadow">
                    {product.brand}
                  </span>
                )}
                {product.isReconditioned && (
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-amber-500 text-slate-950 shadow">
                    Reconditionné OEM
                  </span>
                )}
                {product.isNewPart && !product.isReconditioned && (
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-green-600 text-white shadow">
                    Pièce Neuve
                  </span>
                )}
              </div>

              {/* Multiple images indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-slate-900/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                  {activeImg + 1} / {images.length}
                </div>
              )}

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImg}
                    aria-label="Image précédente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-md transition-all hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImg}
                    aria-label="Image suivante"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-md transition-all hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-24 h-24 rounded-xl border-2 overflow-hidden bg-slate-50 transition-all flex-shrink-0 ${
                      activeImg === i 
                        ? 'border-blue-600 ring-2 ring-blue-600/30 scale-105 shadow-md' 
                        : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Miniature ${i + 1}`} 
                      className="w-full h-full object-contain p-1"
                      onError={e => { (e.target as HTMLImageElement).src = defaultImg; }} 
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-900/60 text-white text-[9px] font-bold px-1 rounded">
                      #{i + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-600 mb-2 tracking-wider">
                <span>{getCategoryLabel(product.category)}</span>
                <span>·</span>
                <span className="font-mono text-slate-500">Réf. {product.reference}</span>
              </div>

              <h1 className="font-display text-4xl font-extrabold uppercase text-slate-900 mb-3">
                {product.name} {product.brand ? `- ${product.brand}` : ''}
              </h1>

              {/* Stock Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-xs font-bold uppercase ${inStock ? 'text-green-700' : 'text-red-700'}`}>
                  {inStock ? `En Stock (${product.stock}) — Expédition 24h` : (product.remarque || 'Rupture de stock — Non disponible actuellement')}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-display text-5xl font-extrabold text-slate-900">
                  {product.price != null ? product.price.toLocaleString('fr-MA') : 'Sur demande'}
                </span>
                {product.price != null && <span className="text-xl font-bold text-slate-500">MAD</span>}
                {product.oldPrice != null && (
                  <span className="text-lg text-slate-400 line-through font-mono">{product.oldPrice.toLocaleString('fr-MA')} MAD</span>
                )}
              </div>

              {savings > 0 && (
                <p className="text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200 mb-6">
                   Économie : {savings.toLocaleString('fr-MA')} MAD par rapport au prix neuf constructeur
                </p>
              )}

              <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                {product.description || 'Aucune description disponible pour ce produit.'}
              </p>
              
              {product.remarque && !inStock && (
                 <p className="text-xs font-bold text-slate-700 bg-slate-100 p-3 rounded mb-6">
                    Remarque : {product.remarque}
                 </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-200 mt-4">
              <div className="flex gap-3">
                <div className="flex items-center border border-slate-300 rounded bg-slate-50">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 text-lg font-bold text-slate-600 hover:text-slate-900">−</button>
                  <span className="w-10 text-center font-bold text-sm font-mono">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 text-lg font-bold text-slate-600 hover:text-slate-900">+</button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!inStock && !product.remarque}
                  className="flex-1 py-3 text-xs font-extrabold tracking-widest uppercase rounded bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white shadow transition-all"
                >
                  {addedFeedback ? '✓ Ajouté au panier' : (!inStock && !product.remarque ? 'Rupture de stock' : 'Ajouter au Panier')}
                </button>
              </div>

              <button
                onClick={() => { onAddToCart({ product: cartProduct as any, qty }); navigate('cart'); }}
                disabled={!inStock && !product.remarque}
                className="w-full py-3.5 text-xs font-extrabold tracking-widest uppercase rounded bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 shadow transition-colors"
              >
                Commander directement (Invité Sans Compte) →
              </button>
            </div>
          </div>
        </div>

        {/* Compatibility Section */}
        {(product.compatibleVehicles || []).length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-12">
            <h3 className="font-display text-2xl font-bold uppercase text-slate-900 mb-4">
              Compatibilité Véhicules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(product.compatibleVehicles || []).map((v: string, i: number) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded font-semibold text-xs text-slate-800 flex items-center gap-2">
                  <span className="text-blue-600 font-bold">🚘</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h3 className="font-display text-2xl font-bold uppercase text-slate-900 mb-6">
              Produits Similaires
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map(r => {
                const rImg = resolveMediaUrl(r.imageUrl, PLACEHOLDER);
                
                return (
                  <button
                    key={r._id}
                    onClick={() => onProductSelect(r._id)}
                    className="bg-white rounded-xl shadow border border-slate-200 p-4 text-left hover:shadow-lg transition-all"
                  >
                    <div className="h-32 bg-slate-100 rounded mb-3 overflow-hidden">
                      <img src={rImg} alt={r.name} onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">{getCategoryLabel(r.category)}</div>
                    <div className="text-xs font-bold text-slate-900 mb-1 line-clamp-1">{r.name}</div>
                    <div className="font-display text-lg font-bold text-blue-600">
                      {r.price != null ? `${r.price.toLocaleString('fr-MA')} MAD` : 'Sur demande'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

