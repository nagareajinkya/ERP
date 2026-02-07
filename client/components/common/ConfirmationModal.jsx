import React from 'react';
import { X, Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Reusable confirmation modal component
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback for cancel/close action
 * @param {function} onConfirm - Callback for confirm action
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {'delete'|'warning'|'info'|'success'} type - Modal type (affects icon and colors)
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    // Icon mapping based on type
    const iconMap = {
        delete: Trash2,
        warning: AlertTriangle,
        info: AlertCircle,
        success: CheckCircle2
    };

    // Color scheme mapping based on type
    const colorSchemes = {
        delete: {
            iconBg: 'bg-red-50',
            iconText: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            buttonShadow: 'shadow-red-600/20'
        },
        warning: {
            iconBg: 'bg-orange-50',
            iconText: 'text-orange-600',
            buttonBg: 'bg-orange-500 hover:bg-orange-600',
            buttonShadow: 'shadow-orange-500/20'
        },
        info: {
            iconBg: 'bg-blue-50',
            iconText: 'text-blue-600',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            buttonShadow: 'shadow-blue-600/20'
        },
        success: {
            iconBg: 'bg-green-50',
            iconText: 'text-green-600',
            buttonBg: 'bg-green-600 hover:bg-green-700',
            buttonShadow: 'shadow-green-600/20'
        }
    };

    const Icon = iconMap[type] || AlertTriangle;
    const colors = colorSchemes[type] || colorSchemes.warning;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 p-6">
                {/* Icon Badge */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${colors.iconBg} ${colors.iconText}`}>
                    <Icon size={24} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-gray-500 text-sm text-center mb-6">
                    {message}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all ${colors.buttonBg} ${colors.buttonShadow}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
