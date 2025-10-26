import Ably from "ably";
import connectToDB from "@/lib/db";
import Notification, { NotificationEntity } from "@/models/Notification";
import { Types } from "mongoose";

interface NotificationPayload {
  recipient: string; // User ID người nhận
  channel: "user" | "admin" | "global";
  event: string;
  actor: { id: string; model: NotificationEntity };
  entity?: { id: string; model: NotificationEntity };
  data?: Record<string, any>;
  message: string;
  link?: string;
}

if (!process.env.ABLY_API_KEY) {
  throw new Error("ABLY_API_KEY is not set");
}

// khởi tạo Ably REST client (simgleton)
const ablyClient = new Ably.Rest(process.env.ABLY_API_KEY);

/**
 * Hàm publish chung, có thể gửi đến bất kỳ kênh nào.
 * @param channelName - Tên kênh đầy đủ (ví dụ: 'notifications:user_123' hoặc 'global-announcements').
 * @param eventName - Tên của sự kiện.
 * @param data - Dữ liệu đi kèm.
 */
async function publishToChannel(
  channelName: string,
  eventName: string,
  data: any
) {
  try {
    const channel = ablyClient.channels.get(channelName);
    await channel.publish(eventName, data);
  } catch (error) {
    console.error(
      `[ABLY_PUBLISH_ERROR] Failed to publish to ${channelName}:`,
      error
    );
    throw error;
  }
}

/**
 * Hàm tạo và gửi thông báo mới, vừa lưu vào DB vừa đẩy real-time.
 * hàm trung tâm mới cho việc tạo thông báo.
 */
export async function createAndPublishNotification(
  payload: NotificationPayload
) {
  try {
    await connectToDB();
    const newNotif = await Notification.create({
      recipient: payload.recipient,
      channel: payload.channel,
      event: payload.event,
      actor: {
        id: new Types.ObjectId(payload.actor.id),
        model: payload.actor.model,
      },
      entity: payload.entity
        ? {
            id: new Types.ObjectId(payload.entity.id),
            model: payload.entity.model,
          }
        : undefined,
      data: payload.data,
      message: payload.message,
      link: payload.link,
    });

    // 2. ĐẨY REAL-TIME QUA ABLY
    const channelName = `${payload.channel}:${payload.recipient}`; // vd: user:60d5f...

    // Populate dữ liệu actor để client có thể hiển thị ngay
    const populatedNotif = await newNotif.populate({
      path: "actor.id",
      select: "name avatarUrl",
    });

    await publishToChannel(
      channelName,
      payload.event,
      JSON.parse(JSON.stringify(populatedNotif))
    );

    return populatedNotif;
  } catch (error) {
    console.error("[CREATE_NOTIFICATION_ERROR]", error);
  }
}
