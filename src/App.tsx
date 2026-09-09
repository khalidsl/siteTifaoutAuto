import { Suspense, lazy, useState, useEffect } from 'react';
import type { Page, CartItem, QuoteRequest as QuoteRequestType } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import StickyPhoneButton from './components/StickyPhoneButton';
import { useAuth, getSession } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Auth = lazy(() => import('./pages/Auth'));
const Contact = lazy(() => import('./pages/Contact'));
const QuoteRequest = lazy(() => import('./pages/QuoteRequest'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const AdminBackoffice = lazy(() => import('./pages/AdminBackoffice'));

export default function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [_quotes, setQuotes] = useState<QuoteRequestType[]>([]);


  // Cart with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tifaout_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tifaout_cart', JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedProductId]);

  const navigate = (page: Page) => {
    const activeUser = user || getSession();
    if (page === 'admin' && (!activeUser || activeUser.role !== 'admin')) {
      setCurrentPage('auth');
      return;
    }
    if (page === 'client' && (!activeUser || !activeUser.token)) {
      setCurrentPage('auth');
      return;
    }
    setCurrentPage(page);
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product');
  };

  const handleCategoryNav = (cat: string) => {
    setCatalogCategory(cat);
    setCurrentPage('catalog');
  };

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === item.product.id);
      if (exists) {
        return prev.map(i =>
          i.product.id === item.product.id
            ? { ...i, qty: i.qty + item.qty }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemove(productId);
      return;
    }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty } : i));
  };

  const handleRemove = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const handleClearCart = () => setCart([]);

  const handleAddQuote = (newQuote: QuoteRequestType) => {
    setQuotes(prev => [newQuote, ...prev]);
  };

  const knownPages: Page[] = ['home', 'catalog', 'product', 'cart', 'devis', 'client', 'admin', 'auth', 'contact'];
  const shouldShowNotFound = !knownPages.includes(currentPage) || (currentPage === 'product' && !selectedProductId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header
        currentPage={currentPage}
        navigate={navigate}
        cart={cart}
        onCategoryNav={handleCategoryNav}
      />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-100">
              <div className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
                Chargement...
              </div>
            </div>
          }
        >
          {currentPage === 'home' && (
            <Home
              navigate={navigate}
              onProductSelect={handleProductSelect}
              onCategoryNav={handleCategoryNav}
            />
          )}
          {currentPage === 'catalog' && (
            <Catalog
              onProductSelect={handleProductSelect}
              initialCategory={catalogCategory}
            />
          )}
          {currentPage === 'product' && selectedProductId && (
            <ProductDetail
              productId={selectedProductId}
              navigate={navigate}
              cart={cart}
              onAddToCart={handleAddToCart}
              onProductSelect={handleProductSelect}
            />
          )}
          {currentPage === 'cart' && (
            <Cart
              cart={cart}
              navigate={navigate}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
              onClearCart={handleClearCart}
            />
          )}
          {currentPage === 'devis' && (
            <QuoteRequest
              navigate={navigate}
              onAddQuote={handleAddQuote}
            />
          )}
          {currentPage === 'client' && (
            <ClientPortal
              navigate={navigate}
            />
          )}
          {currentPage === 'admin' && (
            <AdminBackoffice
              navigate={navigate}
            />
          )}
          {currentPage === 'auth' && (
            <Auth navigate={navigate} />
          )}
          {currentPage === 'contact' && (
            <Contact navigate={navigate} />
          )}
          {shouldShowNotFound && (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
              <span className="text-6xl font-black text-blue-600 mb-2 font-display">404</span>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-800 mb-2">Page introuvable</h2>
              <p className="text-sm text-slate-500 max-w-md mb-6">
                La page ou la pièce demandée n'existe pas ou a été déplacée.
              </p>
              <button
                onClick={() => navigate('home')}
                className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-blue-700 shadow"
              >
                Retour à l'accueil
              </button>
            </div>
          )}
        </Suspense>

      </main>

      <Footer navigate={navigate} />
      <StickyPhoneButton navigate={navigate} />
    </div>
  );
}
