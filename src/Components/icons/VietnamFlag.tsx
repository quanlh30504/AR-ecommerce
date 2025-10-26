interface VietnamFlagProps {
    className?: string;
    width?: number;
    height?: number;
}

export default function VietnamFlag({
    className = "",
    width = 24,
    height = 16
}: VietnamFlagProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 16"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Background đỏ - màu chuẩn cờ Việt Nam */}
            <rect width="24" height="16" fill="#DA020E" rx="1" />

            {/* Ngôi sao vàng 5 cánh - màu chuẩn */}
            <polygon
                points="12,3 13.176,6.708 17,6.708 13.912,9.084 15.088,12.792 12,10.416 8.912,12.792 10.088,9.084 7,6.708 10.824,6.708"
                fill="#FFCD00"
                stroke="#FFCD00"
                strokeWidth="0.2"
            />

            {/* Shadow cho ngôi sao để nổi bật hơn */}
            <polygon
                points="12,3.2 13.176,6.908 17.2,6.908 13.912,9.284 15.088,12.992 12,10.616 8.912,12.992 10.088,9.284 6.8,6.908 10.824,6.908"
                fill="#E6B800"
                opacity="0.3"
            />
        </svg>
    );
}
