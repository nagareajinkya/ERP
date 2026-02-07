import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

/**
 * Toast notification component
 */
const Toast = ({ notification }) => {
    if (!notification || !notification.message) return null;

    const isError = notification.type === 'error';

    return (
        <div
            className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-lg border shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${isError
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-green-50 text-green-600 border-green-200'
                }`}
        >
            {isError ? <X size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-bold">{notification.message}</span>
        </div>
    );
};

export default Toast;
