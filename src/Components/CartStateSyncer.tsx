'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import type { PopulatedCart } from '@/store/useCartStore';

interface CartStateSyncerProps {
  serverCart: PopulatedCart | null;
}

// Component có chức năng đồng bộ state cart
function CartStateSyncer({ serverCart }: CartStateSyncerProps): null {
  const syncCart = useCartStore((state) => state.syncCart);

  //  useEffect để theo dõi sự thay đổi của dữ liệu từ server
  useEffect(() => {
    syncCart(serverCart);
  }, [serverCart, syncCart]); // Chạy lại mỗi khi serverCart thay đổi

  return null;
}

export default CartStateSyncer;
