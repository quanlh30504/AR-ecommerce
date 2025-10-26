import React from "react";

interface SectionCardProps {
    children: React.ReactNode;
    className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ children, className = "" }) => {
    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/50 p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-gray-600/50 hover:-translate-y-1 transition-all duration-300 ${className}`}
        >
            {children}
        </div>
    );
};

export default React.memo(SectionCard);
