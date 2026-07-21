import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addItem: (medicine, quantity = 1) => {
                set((state) => {
                    const existingItem = state.items.find(i => i.id === medicine.id);
                    if (existingItem) {
                        // Check max stock
                        const newQty = Math.min(existingItem.quantity + quantity, medicine.quantity);
                        return {
                            items: state.items.map(i => i.id === medicine.id ? { ...i, quantity: newQty } : i)
                        };
                    }
                    return {
                        items: [...state.items, { ...medicine, quantity: Math.min(quantity, medicine.quantity) }]
                    };
                });
            },

            removeItem: (id) => {
                set((state) => ({ items: state.items.filter(i => i.id !== id) }));
            },

            updateQuantity: (id, quantity) => {
                if (quantity < 1) {
                    get().removeItem(id);
                    return;
                }
                set((state) => ({
                    items: state.items.map(i => {
                        if (i.id === id) return { ...i, quantity: Math.min(quantity, i.quantity_available || 999) };
                        return i;
                    })
                }));
            },

            clearCart: () => set({ items: [] }),

            getCartTotal: () => {
                return get().items.reduce((total, item) => total + (parseFloat(item.selling_price) * item.quantity), 0);
            },

            getCartCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'abpharma-cart'
        }
    )
);

export default useCartStore;
