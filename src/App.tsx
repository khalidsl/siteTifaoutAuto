import { useState, useEffect } from 'react';
import type { Page, CartItem, QuoteRequest as QuoteRequestType } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import StickyPhoneButton from './components/StickyPhoneButton';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Contact from './pages/Contact';
import QuoteRequest from './pages/QuoteRequest';
import ClientPortal from './pages/ClientPortal';
import AdminBackoffice from './pages/AdminBackoffice';
import { MOCK_QUOTES } from './data/mockData';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [_quotes, setQuotes] = useState<QuoteRequestType[]>(MOCK_QUOTES);

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

  const navigate = (page: Page) => setCurrentPage(page);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header
        currentPage={currentPage}
        navigate={navigate}
        cart={cart}
        onCategoryNav={handleCategoryNav}
      />

      <main className="flex-1">
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
      </main>

      <Footer navigate={navigate} />
      <StickyPhoneButton navigate={navigate} />
    </div>
  );
}
