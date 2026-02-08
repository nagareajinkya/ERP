import React, { useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { useTransactionsContext } from '../context/TransactionsContext';
import { formatCurrency } from '../utils/formatters';

/**
 * Modal for viewing transaction details
 */
const ViewTransactionModal = () => {
    const { selectedTransaction, handleCloseModal } = useTransactionsContext();

    // Close modal on ESC key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCloseModal();
            }
        };

        if (selectedTransaction) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [selectedTransaction, handleCloseModal]);

    if (!selectedTransaction) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Modal Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Transaction Details</h3>
                        <p className="text-sm text-gray-500">{selectedTransaction.id} • {selectedTransaction.date}</p>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {/* Party Info */}
                    <div className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Party / Customer</p>
                            <p className="font-bold text-gray-800">{selectedTransaction.party}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">Total Amount</p>
                            <p className="font-bold text-xl text-green-600">{formatCurrency(selectedTransaction.amount)}</p>
                        </div>
                    </div>

                    {/* Meta: Payment Mode & Notes */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Payment Mode</p>
                                <p className="font-bold text-gray-800">{selectedTransaction.paymentMode || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Paid Amount</p>
                                <p className="font-bold text-gray-800">{formatCurrency(selectedTransaction.paidAmount || 0)}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">Notes</p>
                            <p className="text-sm text-gray-600 max-w-md">{selectedTransaction.notes || '-'}</p>
                        </div>
                    </div>

                    {/* Items List */}
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Products Purchased</h4>
                    <div className="border rounded-xl overflow-hidden border-gray-100 mb-6">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2 text-center">Qty</th>
                                    <th className="px-4 py-2 text-right">Price</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selectedTransaction.details?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2.5 font-medium text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <span>{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-gray-600">{item.qty}</td>
                                        <td className="px-4 py-2.5 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                                        <td className="px-4 py-2.5 text-right font-bold text-gray-800">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals & Meta */}
                    <div className="flex justify-end gap-6 items-center mb-6">
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">Subtotal</p>
                            <p className="font-bold text-gray-800">{formatCurrency(selectedTransaction.subTotal || selectedTransaction.amount)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">Discount</p>
                            <p className="font-bold text-red-500">- {formatCurrency(selectedTransaction.discount || 0)}</p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3">
                        <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
                            <Download size={18} /> PDF
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all">
                            <Printer size={18} /> Print Bill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewTransactionModal;
