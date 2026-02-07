import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

/**
 * Product transaction history modal
 */
const ProductHistoryModal = ({ isOpen, onClose, product, sales, purchases, loading }) => {
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0">
                    <h3 className="font-bold text-gray-800">
                        Transaction History - {product.name || 'Product'}
                    </h3>
                    <button onClick={onClose}>
                        <X size={18} className="text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-6">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading transaction history...</p>
                            </div>
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* Sales Section */}
                            <div>
                                <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={16} /> Last 5 Sales
                                </h4>
                                {sales.length > 0 ? (
                                    <div className="space-y-2">
                                        {sales.map((sale, idx) => (
                                            <div key={idx} className="bg-green-50 border border-green-100 p-3 rounded-lg text-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{sale.party}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Qty: {sale.qty} | Price: ₹{Number(sale.rate).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-green-700">₹{Number(sale.total).toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">No sales found</p>
                                )}
                            </div>

                            {/* Purchases Section */}
                            <div>
                                <h4 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={16} /> Last 5 Purchases
                                </h4>
                                {purchases.length > 0 ? (
                                    <div className="space-y-2">
                                        {purchases.map((purchase, idx) => (
                                            <div key={idx} className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{purchase.party}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Qty: {purchase.qty} | Price: ₹{Number(purchase.rate).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-red-700">₹{Number(purchase.total).toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500">{new Date(purchase.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">No purchases found</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductHistoryModal;
