import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Định nghĩa các loại đối tượng mà thông báo liên quan đến.
 */
export enum NotificationEntity {
  Order = "Order",
  Product = "Product",
  User = "User",
  Transaction = "Transaction",
}

export interface INotification extends Document {
  recipient: Types.ObjectId; // Người nhận thông báo
  channel: "user" | "admin" | "global"; // Kênh thông báo
  event: string; // Tên sự kiện (vd: 'order.shipped', 'review.new')

  actor?: {
    // Ai/cái gì đã tạo ra thông báo này
    id: Types.ObjectId;
    model: NotificationEntity; // Model của actor (vd: User, System)
  };

  entity?: {
    // Đối tượng chính mà thông báo này nói về
    id: Types.ObjectId;
    model: NotificationEntity; // Model của entity (vd: Order, Product)
  };

  data?: Record<string, any>; // Dữ liệu bổ sung, linh hoạt (vd: { orderCode: '#12345' })
  message: string; // Chuỗi thông báo đã được tạo sẵn để hiển thị nhanh
  isRead: boolean;
  readAt?: Date; // Thời gian đánh dấu đã đọc
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ["user", "admin", "global"],
      required: true,
      index: true,
    },
    event: { type: String, required: true, index: true },

    actor: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "actor.model",
      },
      model: {
        type: String,
        required: true,
        enum: Object.values(NotificationEntity),
      },
    },

    entity: {
      id: {
        type: Schema.Types.ObjectId,
        required: false,
        refPath: "entity.model",
      },
      model: {
        type: String,
        required: false,
        enum: Object.values(NotificationEntity),
      },
    },

    data: { type: Schema.Types.Mixed },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    link: { type: String },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
