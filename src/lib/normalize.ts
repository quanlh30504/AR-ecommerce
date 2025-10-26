// Vai trò: Chuẩn hóa chuỗi không dấu, viết thường, trim

// Tối ưu hiệu năng nhỏ: tái sử dụng regex (không tạo lại mỗi lần gọi),
// Regex để loại combining marks (U+0300–U+036F). Đặt ở module scope
// để không phải biên dịch lại regex cho mỗi lần gọi hàm.
const COMBINING_MARKS_RE = /[\u0300-\u036f]/g;
// Regex để ánh xạ cả 'đ' và 'Đ' về chữ 'd'.
const D_RE = /[đĐ]/g;

export function normalizeStr(s?: unknown): string {
  if (typeof s !== 'string') return '';

  // Trim sớm: bỏ khoảng trắng thừa trước khi thực hiện normalize/replace
  // giúp giảm số ký tự phải xử lý trong các bước tiếp theo.
  const str = s.trim();
  if (str === '') return '';

  // NFD để tách base character + combining mark, sau đó loại combining marks
  // và ánh xạ đ/Đ -> 'd'. Cuối cùng chuyển về chữ thường.
  const noDiacritics = str.normalize('NFD').replace(COMBINING_MARKS_RE, '').replace(D_RE, 'd');

  return noDiacritics.toLowerCase();
}

export default normalizeStr;
