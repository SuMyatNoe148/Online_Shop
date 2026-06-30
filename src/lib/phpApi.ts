const PHP_API = process.env.NEXT_PUBLIC_PHP_API_URL ?? 'http://localhost/Abyss.Net/php-api';

/** Read the auth token from localStorage (persisted by Zustand authStore). */
function getToken(): string | null {
  try {
    const raw = localStorage.getItem('abyss-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${PHP_API}${path}`, { ...init, headers });
  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Server returned a non-JSON response (${res.status}). ` +
      `Check that Apache/MySQL are running and install.php was executed.`
    );
  }
  if (!res.ok) throw new Error(json.error ?? `API error (${res.status})`);
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
  getOrders: (email?: string) =>
    request<object[]>(`/orders.php${email ? `?email=${encodeURIComponent(email)}` : ''}`, { cache: 'no-store' }),
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

  // Password management
  changePassword: (currentPassword: string, newPassword: string) =>
    request<object>('/auth.php?action=change_password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  requestReset: (email: string) =>
    request<{ sent: boolean; devToken?: string }>('/auth.php?action=request_reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (email: string, token: string, newPassword: string) =>
    request<object>('/auth.php?action=reset_password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    }),

  // Payment (MMPay QR)
  createPayment: (orderId: string) =>
    request<{
      orderId: string;
      status: string;
      amount: number;
      currency: string;
      qr: string | null;
      vendorQrRefId: string | null;
      sandbox: boolean;
    }>('/payment.php?action=create', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),
  getPaymentStatus: (orderId: string) =>
    request<{
      orderId: string;
      status: string;
      amount: number;
      currency: string;
      qr: string | null;
      vendorQrRefId: string | null;
    }>(`/payment.php?action=status&orderId=${encodeURIComponent(orderId)}`, { cache: 'no-store' }),
  cancelPayment: (orderId: string) =>
    request<object>('/payment.php?action=cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  // Wishlist
  getWishlist: () => request<object[]>('/wishlist.php', { cache: 'no-store' }),
  addToWishlist: (productId: string) =>
    request<object>('/wishlist.php', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId: string) =>
    request<object>(`/wishlist.php?productId=${productId}`, { method: 'DELETE' }),

  // Users (admin)
  getUsers: () => request<object[]>('/users.php', { cache: 'no-store' }),
  getUser: (id: string) => request<object>(`/users.php?id=${id}`, { cache: 'no-store' }),
  updateUserRole: (id: string, role: 'customer' | 'admin') =>
    request<object>(`/users.php?id=${id}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  deleteUser: (id: string) =>
    request<object>(`/users.php?id=${id}`, { method: 'DELETE' }),

  // Reviews
  getReviews: (productId: string) =>
    request<{ reviews: Review[]; avgRating: number; totalCount: number }>(
      `/reviews.php?product_id=${encodeURIComponent(productId)}`, { cache: 'no-store' }
    ),
  createReview: (productId: string, rating: number, comment?: string) =>
    request<object>('/reviews.php', {
      method: 'POST',
      body: JSON.stringify({ productId, rating, comment }),
    }),
  deleteReview: (id: string) =>
    request<object>(`/reviews.php?id=${id}`, { method: 'DELETE' }),

  // Newsletter
  subscribeNewsletter: (email: string) =>
    request<{ subscribed?: boolean; already_subscribed?: boolean; message: string }>(
      '/newsletter.php', { method: 'POST', body: JSON.stringify({ email }) }
    ),
  getSubscribers: () =>
    request<{ id: number; email: string; created_at: string }[]>('/newsletter.php', { cache: 'no-store' }),
};

export interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
