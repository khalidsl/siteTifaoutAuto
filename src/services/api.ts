import type { SessionUser } from '../context/AuthContext';

const formatApiBase = (url?: string): string => {
  if (!url || !url.trim()) return 'http://localhost:5000/api';
  const clean = url.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

// API service layer for TIFAOUT AUTO backend
const API_BASE = formatApiBase(import.meta.env.VITE_API_URL as string | undefined);

export interface ProductsResponse<T = unknown> {
  products: T[];
  total: number;
  page: number;
  pages: number;
}

const requestJson = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const customHeaders = (options.headers as Record<string, string>) ?? {};

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...customHeaders,
  };

  if (isFormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });


  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const message = (typeof data === 'object' && data && 'message' in data ? String((data as { message?: string }).message) : '') || 'Erreur de communication avec le serveur.';
    throw new Error(message);
  }

  return data as T;
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const loginApi = async (identifier: string, password: string): Promise<SessionUser> => {
  return requestJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
};

export const googleLoginApi = async (credential: string): Promise<SessionUser> => {
  return requestJson(`${API_BASE}/auth/google`, {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
};

export const logoutApi = async (): Promise<void> => {
  try {
    await requestJson(`${API_BASE}/auth/logout`, { method: 'POST' });
  } catch {
    // Ignore network errors on logout
  }
};


export const registerApi = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleBrand?: string;
  password: string;
}): Promise<SessionUser> => {
  return requestJson(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ─── PRODUCTS

export interface ProductsFilter {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getProductsApi = async <T = any>(filters: ProductsFilter = {}): Promise<ProductsResponse<T> | T[]> => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const url = `${API_BASE}/products${params.toString() ? `?${params}` : ''}`;
  return requestJson<ProductsResponse<T> | T[]>(url);
};

export const getProductByIdApi = async <T = any>(id: string): Promise<T> => {
  return requestJson<T>(`${API_BASE}/products/${id}`);
};

export const createProductApi = async <T = any>(formData: FormData, token: string): Promise<T> => {
  return requestJson<T>(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
};

export const deleteProductApi = async <T = any>(id: string, token: string): Promise<T> => {
  return requestJson<T>(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ─── ORDERS

export const createOrderApi = async <T = any>(orderData: object, token?: string): Promise<T> => {
  return requestJson<T>(`${API_BASE}/orders`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(orderData),
  });
};

export const getMyOrdersApi = async <T = any>(token: string): Promise<T[]> => {
  return requestJson<T[]>(`${API_BASE}/orders/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAllOrdersApi = async <T = any>(token: string, page = 1, limit = 100): Promise<T> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return requestJson<T>(`${API_BASE}/orders?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateOrderStatusApi = async <T = any>(id: string, status: string, token: string): Promise<T> => {
  const payload = { status };
  const statusParam = encodeURIComponent(status);

  return requestJson<T>(`${API_BASE}/orders/${id}/status?status=${statusParam}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const updateProductApi = async <T = any>(id: string, productData: any, token: string): Promise<T> => {
  const isFormData = productData instanceof FormData;
  return requestJson<T>(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
    body: isFormData ? productData : JSON.stringify(productData),
  });
};

// ─── QUOTES (DEVIS)

export const createQuoteApi = async <T = any>(quoteData: FormData | object, token?: string): Promise<T> => {
  const isFormData = quoteData instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return requestJson<T>(`${API_BASE}/quotes`, {
    method: 'POST',
    headers,
    body: isFormData ? quoteData : JSON.stringify(quoteData),
  });
};


export const getAllQuotesApi = async <T = any>(token: string, page = 1, limit = 100): Promise<T> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return requestJson<T>(`${API_BASE}/quotes?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getMyQuotesApi = async <T = any>(token: string): Promise<T[]> => {
  return requestJson<T[]>(`${API_BASE}/quotes/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateQuoteStatusApi = async <T = any>(
  id: string,
  payload: { status?: string; estimatedPrice?: number | null },
  token: string
): Promise<T> => {
  return requestJson<T>(`${API_BASE}/quotes/${id}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const getMeApi = async <T = any>(token: string): Promise<T> => {
  return requestJson<T>(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ─── ADMIN

export const getAllUsersApi = async <T = any>(token: string): Promise<T[]> => {
  return requestJson<T[]>(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateUserApi = async <T = any>(id: string, payload: any, token: string): Promise<T> => {
  return requestJson<T>(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

export const deleteUserApi = async <T = any>(id: string, token: string): Promise<T> => {
  return requestJson<T>(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ─── AUTH STATE IS MANAGED BY AuthContext ONLY ─────────────────────────────────
// Any session read/write should go through the app auth context to keep one
// single source of truth and avoid state drift between pages.
