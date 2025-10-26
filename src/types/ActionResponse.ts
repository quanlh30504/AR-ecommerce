
/**
 * Một cấu trúc phản hồi chuẩn cho tất cả các Server Actions.
 * @template T - Kiểu dữ liệu của payload 'data' nếu action thành công.
 */
export type ActionResponse<T> = {
  /** Cho biết action có thành công hay không. */
  success: boolean;

  /** Một thông báo thân thiện với người dùng để hiển thị (ví dụ: trong toast). */
  message: string;

  /** Dữ liệu trả về khi thành công (ví dụ: một object user, order). */
  data?: T | null;

  /** Một object chứa các lỗi của từng trường dữ liệu, dùng để hiển thị lỗi trên form. */
  errors?: Record<string, string> | null;
};
