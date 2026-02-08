import React from 'react';
import { ArrowRight } from 'lucide-react';

const AuthButton = ({
    type = 'submit',
    onClick,
    disabled = false,
    loading = false,
    children,
    variant = 'primary',
    icon: Icon = ArrowRight,
    className = ''
}) => {
    const baseClasses = "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98]";

    const variants = {
        primary: "bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]",
        secondary: "bg-transparent border border-white/10 text-white hover:bg-white/5",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            {loading ? 'Please wait...' : children}
            {!loading && Icon && <Icon size={20} />}
        </button>
    );
};

export default AuthButton;
