const BASE_URL = "https://amberfoods.onrender.com/api";

export interface User {
  email: string;
  full_name: string;
  phone: string;
  _id: string;
  is_active: boolean;
  is_admin: boolean;
  profile_image?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  category_ids: string[];
  is_available: boolean;
  is_featured: boolean;
  _id: string;
  images: string[];
  created_at: string;
  updated_at: string;
  categories?: Category[];
}

export interface Category {
  name: string;
  description: string;
  _id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  menu_item_id: string;
  quantity: number;
  _id: string;
  name: string;
  price: number;
  subtotal: number;
  image_url?: string;
}

export interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  delivery_address_id: string;
  special_instructions?: string;
  _id: string;
  user_id: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total_amount: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "EN_ROUTE"
    | "DELIVERED"
    | "CANCELLED";
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  payment_reference: string;
  delivery_status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  price: number;
  name: string;
  _id: string;
  subtotal: number;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    return this.request("/auth/login", {
      method: "POST",
      headers: {},
      body: formData,
    });
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<User> {
    return this.request("/users/me");
  }

  // Menu endpoints
  async getCategories(): Promise<Category[]> {
    return this.request("/menu/categories");
  }

  async getMenuItems(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
  }): Promise<MenuItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.featured !== undefined)
      queryParams.append("featured", params.featured.toString());

    return this.request(`/menu/items?${queryParams.toString()}`);
  }

  async getBestSellingItems(limit = 10): Promise<MenuItem[]> {
    return this.request(`/menu/best-selling?limit=${limit}`);
  }

  async getRecommendedItems(limit = 10): Promise<MenuItem[]> {
    return this.request(`/menu/recommended?limit=${limit}`);
  }

  // Cart endpoints
  async getCart(): Promise<Cart> {
    return this.request("/cart/");
  }

  async addToCart(menuItemId: string, quantity: number): Promise<Cart> {
    return this.request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ menu_item_id: menuItemId, quantity }),
    });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    return this.request(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    return this.request(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  }

  async clearCart(): Promise<Cart> {
    return this.request("/cart/", {
      method: "DELETE",
    });
  }

  // Order endpoints
  async createOrder(orderData: {
    delivery_address_id: string;
    special_instructions?: string;
    cart_id: string;
  }): Promise<Order> {
    return this.request("/orders/", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request("/orders/");
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.request(`/orders/${orderId}`);
  }

  // Address endpoints
  async getAddresses() {
    return this.request("/addresses/");
  }

  async createAddress(addressData: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    label: string;
    phone: string;
  }) {
    return this.request("/addresses/", {
      method: "POST",
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId: string, addressData: any) {
    return this.request(`/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId: string) {
    return this.request(`/addresses/${addressId}`, {
      method: "DELETE",
    });
  }

  // Review endpoints
  async getReviews(menuItemId?: string) {
    const params = menuItemId ? `?menu_item_id=${menuItemId}` : "";
    return this.request(`/reviews/${params}`);
  }

  async createReview(reviewData: {
    menu_item_id: string;
    rating: number;
    comment: string;
  }) {
    return this.request("/reviews/", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(
    reviewId: string,
    reviewData: {
      rating: number;
      comment: string;
    }
  ) {
    return this.request(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: "DELETE",
    });
  }

  // Menu item detail
  async getMenuItem(itemId: string): Promise<MenuItem> {
    return this.request(`/menu/items/${itemId}`);
  }

  // Update user profile
  async updateProfile(userData: {
    full_name?: string;
    phone?: string;
    profile_image?: File;
  }) {
    const formData = new FormData();
    if (userData.full_name) formData.append("full_name", userData.full_name);
    if (userData.phone) formData.append("phone", userData.phone);
    if (userData.profile_image)
      formData.append("profile_image", userData.profile_image);

    return this.request("/users/me", {
      method: "PUT",
      headers: {},
      body: formData,
    });
  }
}

export const apiService = new ApiService();
