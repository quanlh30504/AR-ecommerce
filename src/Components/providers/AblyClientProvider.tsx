"use client";

import { Realtime } from "ably";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { INotification } from "@/models/Notification";

export default function AblyClientProvider() {
  const { data: session, status } = useSession();
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const fetchInitialNotifications = useNotificationStore(
    (state) => state.fetchInitialNotifications
  );

  // Dùng useRef để đảm bảo Ably client chỉ được khởi tạo một lần
  const ablyClientRef = useRef<Realtime | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Chỉ thực hiện khi user đã đăng nhập và chưa được khởi tạo
    if (
      status === "authenticated" &&
      session.user.id &&
      !isInitialized.current
    ) {
      console.log("[ABLY_PROVIDER] Authenticated. Initializing Ably client...");
      isInitialized.current = true; // Đánh dấu đã khởi tạo

      // 1. Khởi tạo Ably Client
      const client = new Realtime({
        authUrl: "/api/auth/ably-auth",
        clientId: session.user.id,
      });
      ablyClientRef.current = client;

      // 2. Lấy danh sách thông báo ban đầu
      fetchInitialNotifications();

      // 3. Lắng nghe kênh của người dùng
      const userChannel = client.channels.get(`user:${session.user.id}`);
      userChannel.subscribe((message) => {
        const newNotif = message.data as INotification;
        addNotification(newNotif);
      });

      // 4. (Tùy chọn) Lắng nghe kênh global
      // const globalChannel = client.channels.get('global:announcements');
      // globalChannel.subscribe((message) => { ... });

      // Dọn dẹp khi component unmount
      return () => {
        console.log("[ABLY_PROVIDER] Closing Ably connection.");
        client.close();
        ablyClientRef.current = null;
        isInitialized.current = false;
      };
    }
  }, [status, session, fetchInitialNotifications, addNotification]);

  // Component này là "headless", không render ra UI
  return null;
}
