// API service layer for TIFAOUT AUTO backend
const API_BASE = 'http://localhost:5000/api';

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const loginApi = async (identifier: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Identifiant ou mot de passe incorrect.');
  return data;
};

export const registerApi = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleBrand?: string;
  password: string;
}) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription.");
  return data;
};

// ─── PRODUCTS 

export interface ProductsFilter {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getProductsApi = async (filters: ProductsFilter = {}) => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const url = `${API_BASE}/products${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur chargement produits');
  // Support both { products, total } shape and plain array (legacy)
  return Array.isArray(data) ? data : data;
};

export const getProductByIdApi = async (id: string) => {
  const res = await fetch(`${API_BASE}/products/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Produit introuvable');
  return data;
};

export const createProductApi = async (formData: FormData, token: string) => {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur ajout produit');
  return data;
};




export const deleteProductApi = async (id: string, token: string) => {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur suppression produit');
  return data;
};

// ─── ORDERS 

export const createOrderApi = async (orderData: object) => {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur création commande');
  return data;
};

export const getMyOrdersApi = async (token: string) => {
  const res = await fetch(`${API_BASE}/orders/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur chargement commandes');
  return data;
};

export const getAllOrdersApi = async (token: string) => {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur chargement commandes');
  return data;
};

export const updateOrderStatusApi = async (id: string, status: string, token: string) => {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur mise à jour statut');
  return data;
};

export const updateProductApi = async (id: string, productData: any, token: string) => {
  const isFormData = productData instanceof FormData;
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    },
    body: isFormData ? productData : JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur mise à jour produit');
  return data;
};

// ─── QUOTES (DEVIS) 

export const createQuoteApi = async (quoteData: FormData | object) => {
  const isFormData = quoteData instanceof FormData;
  const res = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: isFormData ? quoteData : JSON.stringify(quoteData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur enregistrement devis');
  return data;
};

export const getAllQuotesApi = async (token: string) => {
  const res = await fetch(`${API_BASE}/quotes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur chargement devis');
  return data;
};

export const getMyQuotesApi = async (token: string) => {
  const res = await fetch(`${API_BASE}/quotes/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur chargement devis');
  return data;
};

export const updateQuoteStatusApi = async (
  id: string,
  payload: { status?: string; estimatedPrice?: number | null },
  token: string
) => {
  const res = await fetch(`${API_BASE}/quotes/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur mise à jour devis');
  return data;
};

export const getMeApi = async (token: string) => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Session invalide');
  return data;
};

// ─── ADMIN 

export const seedAdminApi = async () => {
  const res = await fetch(`${API_BASE}/admin/seed`, { method: 'POST' });
  const data = await res.json();
  return data;
};

export const getAllUsersApi = async (token: string) => {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur chargement utilisateurs');
  return data;
};

export const updateUserApi = async (id: string, payload: any, token: string) => {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur mise à jour utilisateur');
  return data;
};

export const deleteUserApi = async (id: string, token: string) => {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur suppression utilisateur');
  return data;
};

// ─── LOCAL STORAGE HELPERS 

export const saveSession = (userData: object) => {
  localStorage.setItem('tifaout_user', JSON.stringify(userData));
};

export const getSession = () => {
  const raw = localStorage.getItem('tifaout_user');
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = () => {
  localStorage.removeItem('tifaout_user');
};
