'use client';

import { useEffect, useState } from 'react';
import { verifyPin } from '@/lib/actions/wallet';

import { Modal, Form, Input, Button, Alert, Typography, Avatar, Space } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion'; // Thư viện animation
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const { Title, Text } = Typography;

interface PinVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void; 
    title?: string;
    description?: string;
}

export default function PinVerificationModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    title = "Xác thực Giao dịch",
    description = "Vui lòng nhập mã PIN Mandala Pay để hoàn tất."
}: PinVerificationModalProps) {
    const [form] = Form.useForm();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();

    // Xử lý khi submit form
    const onFinish = async (values: { pin: string }) => {
        setError('');
        setIsLoading(true);

        const formData = new FormData();
        formData.append('pin', values.pin);
        const result = await verifyPin(undefined, formData);

        setIsLoading(false);

        if (result?.success) {
            onSuccess(values.pin);
        } else {
            setError(result?.message || 'Có lỗi xảy ra.');
            form.resetFields();
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            form.resetFields();
            setError('');
        }
    }, [isOpen, form]);

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
            width={400}
        >
            <AnimatePresence>
                <motion.div
                    key={isOpen ? "visible" : "hidden"}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="text-center p-4"
                >
                    <Space direction="vertical" size="middle" className="w-full">
                        <Avatar 
                            size={64} 
                            src={session?.user?.image ? <Image src={session.user.image} alt="avatar" width={64} height={64}/> : <UserOutlined />}
                        />
                        <Title level={4}>{title}</Title>
                        <Text type="secondary">{description}</Text>
                        
                        <Form form={form} onFinish={onFinish} className="w-full">
                            <Form.Item
                                name="pin"
                                rules={[{ required: true, message: 'Vui lòng nhập mã PIN!' }]}
                            >
                                <Input.OTP 
                                    mask="●"
                                    length={6} 
                                    size="large"
                                />
                            </Form.Item>

                            {error && <Alert message={error} type="error" showIcon className="mb-4" />}

                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    loading={isLoading}
                                    block
                                    size="large"
                                    icon={<LockOutlined />}
                                >
                                    {isLoading ? 'Đang kiểm tra...' : 'Xác nhận'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Space>
                </motion.div>
            </AnimatePresence>
        </Modal>
    );
}
