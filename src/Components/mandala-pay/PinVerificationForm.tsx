'use client';

import { useEffect, useState, useTransition } from 'react';
import { verifyPin } from '@/lib/actions/wallet'; // Đảm bảo đường dẫn đúng

// Import các component UI cần thiết
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card";
import { Input, Button as AntdButton, Form, Typography, Alert, Avatar } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { maskEmail } from '@/lib/utils';

const { Text } = Typography;

interface PinVerificationFormProps {
    onSuccess: () => void;
}

export default function PinVerificationForm({ onSuccess }: PinVerificationFormProps) {
    const { data: session } = useSession();
    const [form] = Form.useForm(); // Hook quản lý form của Ant Design
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        // Tự động focus vào ô input khi modal mở
        // Cần một chút delay để đảm bảo modal đã render xong
        setTimeout(() => {
            form.getFieldInstance('pin')?.focus();
        }, 100);
    }, []);

    // Xử lý khi submit form
    const handleFinish = (values: { pin: string }) => {
        setError('');
        
        startTransition(async () => {
            // 1. TẠO FORMDATA THỦ CÔNG
            const formData = new FormData();
            formData.append('pin', values.pin);
            
            // 2. GỌI SERVER ACTION VỚI FORMDATA
            const result = await verifyPin(undefined, formData);

            if (result?.success) {
                onSuccess(); // Gọi callback khi thành công
            } else {
                setError(result?.message || 'Có lỗi xảy ra.');
                form.resetFields(); // Xóa pin đã nhập sai
            }
        });
    };

    const maskedEmail = maskEmail(session?.user?.email);

    return (
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
            <CardHeader className="text-center">
                <div className="flex flex-col items-center gap-4 mb-2">
                    <Avatar
                        size={64}
                        src={session?.user?.image}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <CardTitle className="text-2xl">Truy cập Ví Mandala Pay</CardTitle>
                        {maskedEmail && (
                             <Text type="secondary" className="mt-1">{maskedEmail}</Text>
                        )}
                    </div>
                </div>
                <CardDescription>
                    Vui lòng nhập mã PIN gồm 6 chữ số để tiếp tục.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* 3. SỬ DỤNG Form CỦA ANT DESIGN */}
                <Form 
                    form={form} 
                    onFinish={handleFinish} 
                    className="flex flex-col items-center gap-6"
                >
                    <Form.Item
                        name="pin"
                        rules={[
                            { required: true, message: '' },
                            { len: 6, message: 'PIN phải có 6 chữ số!' }
                        ]}
                        className="mb-0" // Bỏ margin-bottom mặc định
                    >
                        <Input.OTP
                            mask="●"
                            length={6}
                            size="large"
                        />
                    </Form.Item>

                    {error && (
                        <Alert message={error} type="error" showIcon className="w-full" />
                    )}

                    <div className="w-full max-w-xs">
                         <AntdButton 
                            type="primary" 
                            htmlType="submit" 
                            loading={isPending} 
                            block 
                            size="large"
                         >
                            {isPending ? 'Đang kiểm tra...' : 'Xác nhận'}
                        </AntdButton>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
}
