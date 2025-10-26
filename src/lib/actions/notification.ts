"use server";

import { auth } from "@/auth";
import connectToDB from "../db";
import Notification from "@/models/Notification";
import User from "@/models/User";

const NOTIFICATIONS_PER_PAGE = 10;

export async function getNotificationsForCurrentUser({
  page = 1,
}: {
  page: number;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { notifications: [], hasMore: false };

    await connectToDB();

    const skipAmount = (page - 1) * NOTIFICATIONS_PER_PAGE;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(NOTIFICATIONS_PER_PAGE)
      .populate({
        path: "actor.id",
        model: User,
        select: "name avatarUrl",
      })
      .lean();

    const totalNotifications = await Notification.countDocuments({
      recipient: userId,
    });
    const hasMore = totalNotifications > skipAmount + notifications.length;

    return {
      notifications: JSON.parse(JSON.stringify(notifications)),
      hasMore,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    return { notifications: [], hasMore: false };
  }
}

export async function markNotificationsAsRead() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return;

    await connectToDB();

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  } catch (error) {
    console.error("Lỗi khi đánh dấu đã đọc:", error);
  }
}

/**
 * Đánh dấu một thông báo cụ thể là đã đọc.
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    await connectToDB();
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: session.user.id }, // Đảm bảo user sở hữu noti này
      { isRead: true, readAt: new Date() }
    );
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi đánh dấu đã đọc:", error);
    return { success: false, message: "Lỗi máy chủ" };
  }
}
