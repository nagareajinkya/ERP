import React, { useState, useEffect } from 'react';
import { X, Check, Send, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

import WhatsAppIcon from '../ui/WhatsAppIcon';

const BroadcastModal = ({ messages, templateName, onClose }) => {
    const [sentIds, setSentIds] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    // Auto-expand first unsent message
    useEffect(() => {
        if (messages.length > 0) {
            const firstUnsent = messages.find(m => !sentIds.includes(m.customerId));
            if (firstUnsent) {
                setExpandedId(firstUnsent.customerId);
            }
        }
    }, [messages, sentIds]);

    const handleSendWhatsApp = (message) => {
        if (!message.hasValidPhone || !message.whatsappLink) {
            return;
        }

        // Open WhatsApp in new tab
        window.open(message.whatsappLink, '_blank');

        // Mark as sent
        setSentIds(prev => [...prev, message.customerId]);

        // Find next unsent and expand it
        const currentIndex = messages.findIndex(m => m.customerId === message.customerId);
        const nextUnsent = messages.slice(currentIndex + 1).find(m =>
            !sentIds.includes(m.customerId) && m.customerId !== message.customerId
        );

        if (nextUnsent) {
            setExpandedId(nextUnsent.customerId);
            // Scroll to next unsent
            setTimeout(() => {
                const element = document.getElementById(`customer-${nextUnsent.customerId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    };

    const toggleExpand = (customerId) => {
        setExpandedId(expandedId === customerId ? null : customerId);
    };

    const sentCount = sentIds.length;
    const totalCount = messages.length;
    const validPhoneCount = messages.filter(m => m.hasValidPhone).length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* HEADER */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-green-50 to-white">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                                <WhatsAppIcon size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Broadcasting Template</h2>
                                <p className="text-sm text-gray-500 font-medium">{templateName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Progress: {sentCount} of {validPhoneCount} sent
                            </span>
                            <span className="text-xs font-bold text-green-600">
                                {validPhoneCount > 0 ? Math.round((sentCount / validPhoneCount) * 100) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out shadow-lg"
                                style={{
                                    width: `${validPhoneCount > 0 ? (sentCount / validPhoneCount) * 100 : 0}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* INVALID PHONE WARNING */}
                    {validPhoneCount < totalCount && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                            <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700 font-medium">
                                {totalCount - validPhoneCount} customer(s) have invalid/missing phone numbers and will be skipped.
                            </p>
                        </div>
                    )}
                </div>

                {/* CUSTOMER LIST */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {messages.map((message) => {
                        const isSent = sentIds.includes(message.customerId);
                        const isExpanded = expandedId === message.customerId;
                        const hasValidPhone = message.hasValidPhone;

                        return (
                            <div
                                key={message.customerId}
                                id={`customer-${message.customerId}`}
                                className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${isSent
                                    ? 'border-green-200 bg-green-50/50'
                                    : hasValidPhone
                                        ? 'border-gray-100 bg-white hover:border-green-200 hover:shadow-md'
                                        : 'border-red-100 bg-red-50/30'
                                    }`}
                            >
                                {/* CUSTOMER ROW */}
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* CHECKBOX/STATUS */}
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSent
                                            ? 'bg-green-600 border-green-600'
                                            : hasValidPhone
                                                ? 'border-gray-300'
                                                : 'border-red-300 bg-red-100'
                                            }`}>
                                            {isSent && <Check size={16} className="text-white" />}
                                            {!isSent && !hasValidPhone && <AlertCircle size={14} className="text-red-600" />}
                                        </div>

                                        {/* CUSTOMER INFO */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${isSent ? 'text-green-700' : hasValidPhone ? 'text-gray-800' : 'text-red-600'
                                                }`}>
                                                {message.customerName}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium truncate">
                                                {hasValidPhone ? message.phone : 'Invalid/Missing Phone'}
                                            </p>
                                        </div>

                                        {/* STATUS BADGE */}
                                        {isSent && (
                                            <span className="px-3 py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                                                ✓ Sent
                                            </span>
                                        )}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex items-center gap-2">
                                        {!isSent && hasValidPhone && (
                                            <button
                                                onClick={() => handleSendWhatsApp(message)}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-green-200 hover:shadow-lg flex items-center gap-2"
                                            >
                                                <WhatsAppIcon size={16} />
                                                Send
                                            </button>
                                        )}

                                        <button
                                            onClick={() => toggleExpand(message.customerId)}
                                            className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center"
                                        >
                                            {isExpanded ? (
                                                <ChevronUp size={18} className="text-gray-400" />
                                            ) : (
                                                <ChevronDown size={18} className="text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* MESSAGE PREVIEW (EXPANDED) */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                                                Message Preview
                                            </p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap font-medium leading-relaxed">
                                                {message.personalizedMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-all"
                    >
                        {sentCount === validPhoneCount && validPhoneCount > 0 ? 'Done' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BroadcastModal;
