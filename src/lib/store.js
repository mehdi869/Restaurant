import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  addItem: (menuItem) => {
    const existing = get().items.find((i) => i.id === menuItem.id)
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ items: [...get().items, { ...menuItem, quantity: 1 }] })
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => set({ items: [] }),
}))

export { useCartStore }
