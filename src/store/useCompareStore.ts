import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import type { Product } from '@/types/product';

// Định nghĩa đầy đủ state và actions, tương tự như Context cũ
interface CompareState {
  compareProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const compareStateCreator: StateCreator<CompareState> = (set, get) => ({
  // --- STATE ---
  compareProducts: [],

  // --- ACTIONS ---
  addToCompare: (product) => {
    set((state) => {
  if (get().isInCompare(product._id)) {
        return {}; // Không làm gì nếu sản phẩm đã tồn tại
      }
      
      const updatedProducts = [...state.compareProducts, product];
      // Giới hạn chỉ giữ lại 3 sản phẩm so sánh cuối cùng
      if (updatedProducts.length > 3) {
        updatedProducts.shift(); // Xóa sản phẩm đầu tiên (cũ nhất)
      }
      return { compareProducts: updatedProducts };
    });
  },

  removeFromCompare: (productId) => {
    set((state) => ({
      compareProducts: state.compareProducts.filter((p) => p._id !== productId),
    }));
  },

  clearCompare: () => set({ compareProducts: [] }),

  isInCompare: (productId) => {
    return get().compareProducts.some((p) => p._id === productId);
  },
});

export const useCompareStore = create<CompareState>(compareStateCreator);
