const PHP_API = process.env.NEXT_PUBLIC_PHP_API_URL ?? 'http://localhost/Abyss.Net/php-api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PHP_API}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'API error');
  return json.data as T;
}

export const phpApi = {
  // Products
  getProducts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<object[]>(`/products.php${qs}`, { cache: 'no-store' });
  },
  getProduct: (slug: string) =>
    request<object>(`/products.php?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' }),
  createProduct: (body: object) =>
    request<object>('/products.php', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: object) =>
    request<object>(`/products.php?id=${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProduct: (id: string) =>
    request<object>(`/products.php?id=${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request<object[]>('/orders.php', { cache: 'no-store' }),
  getOrder: (id: string) => request<object>(`/orders.php?id=${id}`, { cache: 'no-store' }),
  createOrder: (body: object) =>
    request<object>('/orders.php', { method: 'POST', body: JSON.stringify(body) }),
  updateOrderStatus: (id: string, status: string) =>
    request<object>(`/orders.php?id=${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Models
  getModels: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<object[]>(`/models.php${qs}`, { cache: 'no-store' });
  },

  // Auth
  register: (body: { name: string; email: string; password: string }) =>
    request<object>('/auth.php?action=register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<object>('/auth.php?action=login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () =>
    request<object>('/auth.php?action=logout', { method: 'POST' }),
  me: () =>
    request<object | null>('/auth.php?action=me'),

  // Wishlist
  getWishlist: () => request<object[]>('/wishlist.php', { cache: 'no-store' }),
  addToWishlist: (productId: string) =>
    request<object>('/wishlist.php', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId: string) =>
    request<object>(`/wishlist.php?productId=${productId}`, { method: 'DELETE' }),
};
