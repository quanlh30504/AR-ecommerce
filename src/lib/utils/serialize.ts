// Chuyển đổi MongoDB documents thành plain serializable objects 
// do Next.js chỉ cho phép truyền plain objects từ Server sang Client Components

export function serializeMongoDoc<T extends Record<string, unknown>>(doc: T): T {
    if (!doc) return doc;

    // Sử dụng JSON.parse(JSON.stringify()) để deep clone và loại bỏ methods/complex objects
    const serialized = JSON.parse(JSON.stringify(doc));

    // Chuyển đổi ObjectId thành string nếu tồn tại
    if (serialized._id && typeof serialized._id === 'object') {
        serialized._id = serialized._id.toString();
    }

    // Chuyển đổi userId ObjectId thành string nếu tồn tại
    if (serialized.userId && typeof serialized.userId === 'object') {
        serialized.userId = serialized.userId.toString();
    }

    // Xử lý các trường ObjectId khác có thể có
    Object.keys(serialized).forEach(key => {
        if (serialized[key] && typeof serialized[key] === 'object' && serialized[key]._bsontype === 'ObjectId') {
            serialized[key] = serialized[key].toString();
        }
    });

    return serialized;
}

export function serializeMongoArray<T extends Record<string, unknown>>(docs: T[]): T[] {
    if (!Array.isArray(docs)) return [];
    // Áp dụng serializeMongoDoc cho từng phần tử trong mảng
    return docs.map(doc => serializeMongoDoc(doc));
}

// Tiện ích bổ sung cho các object lồng nhau (nested objects)
export function serializeNestedMongo<T extends Record<string, unknown>>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;

    const result: Record<string, unknown> = { ...obj };

    Object.keys(result).forEach(key => {
        const value = result[key];
        if (Array.isArray(value)) {
            result[key] = serializeMongoArray(value as Record<string, unknown>[]);
        } else if (typeof value === 'object' && value !== null) {
            result[key] = serializeMongoDoc(value as Record<string, unknown>);
        }
    });

    return result as T;
}
