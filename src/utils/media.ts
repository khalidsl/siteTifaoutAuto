const API_ORIGIN = (import.meta.env.VITE_API_URL as string | undefined ?? 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export const resolveMediaUrl = (value?: string | null, fallback?: string): string => {
  if (!value || value === 'null') {
    return fallback ?? '';
  }

  if (value.startsWith('http') || value.startsWith('data:')) {
    return value;
  }

  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${API_ORIGIN}${normalized}`;
};
