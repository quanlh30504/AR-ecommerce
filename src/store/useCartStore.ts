import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { toast } from 'react-hot-toast';
import { updateItemQuantity, removeItemsFromCart } from '@/lib/actions/cart';

// --- Type Definitions (Giữ nguyên) ---
export interface PopulatedCartItem {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    salePrice?: number;
    stock: number;
    slug: string;
  };
}

export interface PopulatedCart {
  _id: string;
  user: string;
  items: PopulatedCartItem[];
  totalItems: number;
}

// --- Store State and Actions Type (Đầy đủ) ---
interface CartState {
  items: PopulatedCartItem[];
  totalItems: number;
  selectedItemIds: string[];
  isPending: boolean;
  initialized: boolean;
  
  // Actions
  syncCart: (serverCart: PopulatedCart | null) => void; 
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  removeItems: (cartItemIds: string[]) => Promise<void>;
  clearOrderedItems: (orderedItemIds: string[]) => void;
  toggleItemSelected: (cartItemId: string) => void;
  toggleSelectAll: () => void;
  selectItemsByIds: (ids: string[]) => void; 
}

// --- Store Creator (Đã xác thực) ---
const cartStateCreator: StateCreator<CartState> = (set, get) => ({
  // Initial State
  items: [],
  totalItems: 0,
  selectedItemIds: [],
  isPending: false,
  initialized: false,

  // --- ACTIONS ---
  syncCart: (serverCart) => {
    // Luôn cập nhật state của client với dữ liệu mới nhất từ server
    set({
      items: serverCart?.items ?? [],
      totalItems: serverCart?.totalItems ?? 0,
    });
  },

  updateQuantity: async (cartItemId, newQuantity) => {
    set({ isPending: true });
    try {
      const result = await updateItemQuantity(cartItemId, newQuantity);
      if (result.success) {
        // Cập nhật state ở client ngay sau khi server xác nhận thành công
        set((state) => ({
          items: state.items.map((item) =>
            item._id === cartItemId ? { ...item, quantity: newQuantity } : item
          ),
        }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred while updating quantity.');
    } finally {
      set({ isPending: false });
    }
  },

   removeItems: async (cartItemIds) => {
    set({ isPending: true });
    try {
      const result = await removeItemsFromCart(cartItemIds);
      if (result.success) {
        toast.success(result.message);
        // Cập nhật cả `items` và `selectedItemIds` ở client
        set((state) => {
            const newItems = state.items.filter(
              (item) => !cartItemIds.includes(item._id)
            );
            return {
                items: newItems,
                totalItems: newItems.length,
                selectedItemIds: state.selectedItemIds.filter(
                  (id) => !cartItemIds.includes(id)
                ),
            }
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred while removing items.');
    } finally {
      set({ isPending: false });
    }
  },
  
  clearOrderedItems: (orderedItemIds) => {
    set((state) => {
      const newItems = state.items.filter((item) => !orderedItemIds.includes(item._id));
      return {
        items: newItems,
        selectedItemIds: state.selectedItemIds.filter(
          (id) => !orderedItemIds.includes(id)
        ),
        totalItems: newItems.length, 
      };
    });
  },

  toggleItemSelected: (cartItemId) => {
    set((state) => ({
      selectedItemIds: state.selectedItemIds.includes(cartItemId)
        ? state.selectedItemIds.filter((id) => id !== cartItemId)
        : [...state.selectedItemIds, cartItemId],
    }));
  },

  toggleSelectAll: () => {
    set((state) => ({
      selectedItemIds: state.selectedItemIds.length === state.items.length
        ? []
        : state.items.map((item) => item._id),
    }));
  },
  
  selectItemsByIds: (idsToSelect) => {
    const currentSelected = new Set(get().selectedItemIds);
    idsToSelect.forEach(id => currentSelected.add(id));
    set({ selectedItemIds: Array.from(currentSelected) });
  },
});

export const useCartStore = create<CartState>(cartStateCreator);
