import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BlogFormData } from "@/lib/validations/forms";

interface BlogContentEditorProps {
    register: UseFormRegister<BlogFormData>;
    errors: FieldErrors<BlogFormData>;
}

export default function BlogContentEditor({ register, errors }: BlogContentEditorProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent>
                <textarea
                    placeholder="Viết nội dung bài viết ở đây..."
                    {...register("content")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={15}
                />
                {errors.content && <span className="text-red-500 text-xs">{errors.content.message as string}</span>}
            </CardContent>
        </Card>
    );
}
