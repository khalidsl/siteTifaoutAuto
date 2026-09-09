import { Suspense, lazy, useState, useEffect, useRef } from 'react';
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

interface NavigationState {
  tifaout?: boolean;
  page?: Page;
  selectedProductId?: string | null;
  catalogCategory?: string;
  scrollY?: number;
}

const NAVIGATION_STORAGE_KEY = 'tifaout_navigation';

const readNavigationState = (): NavigationState => {
  const historyState = window.history.state as NavigationState | null;
  if (historyState?.tifaout) return historyState;

  try {
    return JSON.parse(sessionStorage.getItem(NAVIGATION_STORAGE_KEY) || '{}') as NavigationState;
  } catch {
    return {};
  }
};

const saveNavigationState = (state: NavigationState) => {
  try {
    sessionStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify({ ...state, tifaout: true }));
  } catch {
    // Ignore storage restrictions.
  }
};

export default function App() {
  const { user } = useAuth();
  const initialNavigation = readNavigationState();
  const [currentPage, setCurrentPage] = useState<Page>(initialNavigation.page || 'home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialNavigation.selectedProductId || null);
  const [catalogCategory, setCatalogCategory] = useState<string>(initialNavigation.catalogCategory || 'all');
  const [_quotes, setQuotes] = useState<QuoteRequestType[]>([]);
  const pendingScrollY = useRef<number | null>(initialNavigation.tifaout ? initialNavigation.scrollY ?? 0 : null);


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

  // Keep browser back/forward navigation inside the SPA and restore the saved position.
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const currentState = (window.history.state || {}) as NavigationState;
    if (!currentState.tifaout) {
      const initialState = {
        tifaout: true,
        page: currentPage,
        selectedProductId,
        catalogCategory,
        scrollY: 0,
      } satisfies NavigationState;
      window.history.replaceState(initialState, '');
      saveNavigationState(initialState);
    }

    const handlePopState = () => {
      const nextState = (window.history.state || {}) as NavigationState;
      pendingScrollY.current = nextState.scrollY ?? 0;
      setCurrentPage(nextState.page || 'home');
      setSelectedProductId(nextState.selectedProductId || null);
      setCatalogCategory(nextState.catalogCategory || 'all');
      saveNavigationState(nextState);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  useEffect(() => {
    const saveCurrentScroll = () => {
      const state = (window.history.state || {}) as NavigationState;
      saveNavigationState({
        ...state,
        tifaout: true,
        page: currentPage,
        selectedProductId,
        catalogCategory,
        scrollY: window.scrollY,
      });
    };

    window.addEventListener('beforeunload', saveCurrentScroll);
    return () => window.removeEventListener('beforeunload', saveCurrentScroll);
  }, [currentPage, selectedProductId, catalogCategory]);

  useEffect(() => {
    const savedScrollY = pendingScrollY.current;
    pendingScrollY.current = null;
    const restoreScroll = () => {
      window.scrollTo({ top: savedScrollY ?? 0, behavior: savedScrollY === null ? 'smooth' : 'auto' });
    };
    const frame = window.requestAnimationFrame(() => {
      restoreScroll();
      if (savedScrollY !== null) window.requestAnimationFrame(restoreScroll);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentPage, selectedProductId]);

  const pushNavigation = (page: Page, nextState: Partial<NavigationState> = {}) => {
    const currentState = {
      ...(window.history.state || {}),
      tifaout: true,
      scrollY: window.scrollY,
    } satisfies NavigationState;
    window.history.replaceState(currentState, '');
    saveNavigationState(currentState);

    const nextNavigation = {
      tifaout: true,
      page,
      selectedProductId: nextState.selectedProductId || null,
      catalogCategory: nextState.catalogCategory || catalogCategory,
      scrollY: 0,
    } satisfies NavigationState;
    window.history.pushState(nextNavigation, '');
    saveNavigationState(nextNavigation);
    setCurrentPage(page);
    setSelectedProductId(nextState.selectedProductId || null);
    if (nextState.catalogCategory) setCatalogCategory(nextState.catalogCategory);
  };

  const navigate = (page: Page) => {
    const activeUser = user || getSession();
    if (page === 'admin' && (!activeUser || activeUser.role !== 'admin')) {
      pushNavigation('auth');
      return;
    }
    if (page === 'client' && (!activeUser || !activeUser.token)) {
      pushNavigation('auth');
      return;
    }
    pushNavigation(page);
  };

  const handleProductSelect = (id: string) => {
    pushNavigation('product', { selectedProductId: id });
  };

  const handleCategoryNav = (cat: string) => {
    pushNavigation('catalog', { catalogCategory: cat });
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
