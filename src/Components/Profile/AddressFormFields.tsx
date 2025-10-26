import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/Components/ui/form";
import { Loader2 } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useFormContext } from "react-hook-form";

interface AddressFormFieldsProps {
    isPending: boolean;
    isEditMode: boolean;
    handleCancel: () => void;
}

export default function AddressFormFields({ isPending, isEditMode, handleCancel }: AddressFormFieldsProps) {
    const form = useFormContext();
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Họ và tên</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Nguyễn Văn A" 
                                    disabled={isPending}
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="09xxxxxxxx" 
                                    disabled={isPending}
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Địa chỉ cụ thể</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="Số nhà, tên đường..." 
                                disabled={isPending}
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tỉnh / Thành phố</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="TP. Hồ Chí Minh" 
                                    disabled={isPending}
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quận / Huyện</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Quận 1" 
                                    disabled={isPending}
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phường / Xã</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Phường Bến Nghé" 
                                    disabled={isPending}
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 pt-2">
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isPending}
                            />
                        </FormControl>
                        <FormLabel>Đặt làm địa chỉ mặc định</FormLabel>
                    </FormItem>
                )}
            />

            <div className="flex justify-end gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isPending}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        isEditMode ? "Cập nhật" : "Thêm mới"
                    )}
                </Button>
            </div>
        </>
    );
}
