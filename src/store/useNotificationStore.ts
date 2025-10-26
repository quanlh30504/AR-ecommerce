import { create } from "zustand";
import { INotification } from "@/models/Notification"; 
import {
  getNotificationsForCurrentUser,
  markNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/actions/notification"; 
import toast from "react-hot-toast";

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  fetchInitialNotifications: () => Promise<void>;
  addNotification: (newNotif: INotification) => void;
  markAllAsRead: () => Promise<void>;
  markOneAsRead: (notificationId: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial State
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  hasMore: true,
  page: 1,

  // --- ACTIONS ---
  fetchInitialNotifications: async () => {
    set({ isLoading: true });
    const { notifications: initialNotifs, hasMore } =
      await getNotificationsForCurrentUser({ page: 1 });
    set({
      notifications: initialNotifs,
      unreadCount: initialNotifs.filter((n) => !n.isRead).length,
      hasMore,
      page: 2,
      isLoading: false,
    });
  },

  addNotification: (newNotif: INotification) => {
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAllAsRead: async () => {
    const currentUnreadCount = get().unreadCount;
    if (currentUnreadCount === 0) return;

    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));

    try {
      await markNotificationsAsRead();
    } catch (error) {
      toast.error("Không thể đánh dấu đã đọc.");
      set({ unreadCount: currentUnreadCount });
    }
  },

  markOneAsRead: (notificationId: string) => {
    const { notifications } = get();
    const targetNotif = notifications.find((n) => n._id === notificationId);

    if (targetNotif && !targetNotif.isRead) {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));

      markNotificationAsRead(notificationId).catch((err) => {
        console.error("Failed to mark notification as read on server:", err);
      });
    }
  },
}));
