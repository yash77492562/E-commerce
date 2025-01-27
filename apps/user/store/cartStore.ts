import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ProductImage = {
  index: number;
  id: string;
  image_url: string;
  image_key: string;
  is_main?: boolean;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount: number | null;
  discountLessValue: number | null;
  discount_rate: string | null;
  product_images: ProductImage[];
};

type CartItem = Product & {
  quantity: number;
};

type CartStore = {
  cartProducts: CartItem[];
  loading: boolean;
  error: string | null;
  fetchCartProducts: () => Promise<void>;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  calculateSubTotal: () => number;
};

const fallbackStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  key: () => null,
  length: 0,
  clear: () => {},
};

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartProducts: [],
      loading: false,
      error: null,

      fetchCartProducts: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/cart');
          const data = await response.json();
          if (data.success) {
            set({ 
              cartProducts: data.cartProducts.map((p: Product) => ({ ...p, quantity: 1 })),
              loading: false 
            });
          } else {
            set({ loading: false, error: data.message });
          }
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch cart'
          });
        }
      },

      addToCart: async (product) => {
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id })
          });
          
          const data = await response.json();
          
          if (data.success) {
            set(state => {
              const existingProduct = state.cartProducts.find(item => item.id === product.id);
              if (existingProduct) {
                return {
                  cartProducts: state.cartProducts.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                  ),
                  error: null
                };
              }
              return {
                cartProducts: [...state.cartProducts, { ...product, quantity: 1 }],
                error: null
              };
            });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add item' });
        }
      },

      removeFromCart: async (productId) => {
        try {
          const response = await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
          });
          
          if (response.ok) {
            set(state => ({
              cartProducts: state.cartProducts.filter(item => item.id !== productId),
              error: null
            }));
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove item' });
        }
      },

      updateQuantity: (productId, quantity) => {
        set(state => ({
          cartProducts: state.cartProducts.map(item =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        }));
      },

      clearCart: async () => {
        try {
          await fetch('/api/cart/clear', { method: 'DELETE' });
          set({ cartProducts: [], error: null });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to clear cart' });
        }
      },

      calculateSubTotal: () => {
        return get().cartProducts.reduce((total, item) => {
          const price = item.discountLessValue || item.price;
          return total + (price * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? window.localStorage : fallbackStorage
      ),
      skipHydration: true
    }
  )
);

export default useCartStore;
