"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createAddress, updateAddress } from "@/lib/actions/address";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormProvider,
} from "@/Components/ui/form";
import AddressFormFields from "./AddressFormFields";
import { addressSchema, type AddressFormData } from "@/lib/validations/forms";

// Sử dụng AddressFormData thay vì tự định nghĩa type
interface AddressFormProps {
    initialData?: AddressFormData & { _id?: string | number };
    onSuccess?: () => void;
}

export default function AddressForm({ initialData, onSuccess }: AddressFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Ensure _id is a string if it exists
    const addressId =
        typeof initialData?._id === 'number'
            ? initialData._id.toString()
            : initialData?._id;

    const isEditMode = !!addressId;

    const form = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            fullName: initialData?.fullName || "",
            phoneNumber: initialData?.phoneNumber || "",
            street: initialData?.street || "",
            city: initialData?.city || "",
            district: initialData?.district || "",
            ward: initialData?.ward || "",
            isDefault: initialData?.isDefault || false,
        },
    });

    const onSubmit = (data: AddressFormData) => {
        startTransition(async () => {
            try {
                const result = isEditMode
                    ? await updateAddress(addressId!, data)
                    : await createAddress(data);

                if (result.success) {
                    toast.success(result.message);

                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.back();
                    }
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                console.error("Form submission error:", error);
                toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
            }
        });
    };

    const handleCancel = () => {
        if (onSuccess) {
            onSuccess();
        } else {
            router.back();
        }
    };

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <AddressFormFields isPending={isPending} isEditMode={isEditMode} handleCancel={handleCancel} />
                </form>
            </Form>
        </FormProvider>
    );
}
