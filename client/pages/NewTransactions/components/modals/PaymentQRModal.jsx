import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Share2, Download } from 'lucide-react';

const PaymentQRModal = ({ isOpen, onClose, amount, upiId, payeeName }) => {
    if (!isOpen) return null;

    // UPI Link Format:
    // upi://pay?pa=<UPI_ID>&pn=<PAYEE_NAME>&am=<AMOUNT>&cu=INR
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
                        Scan to Pay
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col items-center text-center">

                    <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <QRCodeSVG
                            value={upiLink}
                            size={200}
                            level={"H"}
                            includeMargin={true}
                            imageSettings={{
                                src: "/upi-logo-vector.svg", // Optional: Add UPI logo if available
                                x: undefined,
                                y: undefined,
                                height: 24,
                                width: 24,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="space-y-1 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">₹{parseFloat(amount).toFixed(2)}</h2>
                        <p className="text-sm font-medium text-gray-500">To: <span className="text-gray-800 font-bold">{payeeName}</span></p>
                        <p className="text-xs text-gray-400 font-mono mt-2 bg-gray-50 py-1 px-3 rounded-full inline-block">
                            {upiId}
                        </p>
                    </div>

                    <div className="w-full">
                        <button
                            className="w-full py-3 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-xl transition-colors flex items-center justify-center gap-2"
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PaymentQRModal;
