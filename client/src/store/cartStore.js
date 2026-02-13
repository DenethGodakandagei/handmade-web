import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      // Toggle cart drawer
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      // Add item to cart
      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) => item.product._id === product._id
        );

        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          // Cap at stock or 10
          const maxQty = product.stock > 0 ? Math.min(product.stock, 10) : 10;
          newItems[existingIndex].quantity = Math.min(newItems[existingIndex].quantity, maxQty);
          set({ items: newItems });
        } else {
          set({
            items: [...items, { product, quantity }],
          });
        }
      },

      // Remove item from cart
      removeFromCart: (productId) => {
        set({
          items: get().items.filter((item) => item.product._id !== productId),
        });
      },

      // Update quantity
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(productId);
          return;
        }
        const newItems = get().items.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        );
        set({ items: newItems });
      },

      // Increment
      incrementQuantity: (productId) => {
        const item = get().items.find((i) => i.product._id === productId);
        if (item) {
          const maxQty = item.product.stock > 0 ? Math.min(item.product.stock, 10) : 10;
          if (item.quantity < maxQty) {
            get().updateQuantity(productId, item.quantity + 1);
          }
        }
      },

      // Decrement
      decrementQuantity: (productId) => {
        const item = get().items.find((i) => i.product._id === productId);
        if (item) {
          get().updateQuantity(productId, item.quantity - 1);
        }
      },

      // Clear cart
      clearCart: () => set({ items: [] }),

      // Computed values
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      get shipping() {
        const subtotal = get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        return subtotal > 100 ? 0 : 12.99;
      },

      get total() {
        const subtotal = get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        const shipping = subtotal > 100 ? 0 : 12.99;
        return subtotal + shipping;
      },

      // Helper getters as functions (for use inside components)
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),

      getShipping: () => {
        const subtotal = get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        return subtotal > 100 ? 0 : 12.99;
      },

      getTotal: () => {
        const subtotal = get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        const shipping = subtotal > 100 ? 0 : 12.99;
        return subtotal + shipping;
      },
    }),
    {
      name: 'artisan-cart',
    }
  )
);

export default useCartStore;
