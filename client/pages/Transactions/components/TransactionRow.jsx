import React, { memo } from 'react';
import { Eye, Edit, Trash2, Printer } from 'lucide-react';
import { useTransactionsContext } from '../context/TransactionsContext';
import { getTypeIcon, getStatusBadge, formatCurrency, calculateDueAmount, getTypeColorClass } from '../utils/formatters';

/**
 * Individual transaction row component
 * Memoized to prevent unnecessary re-renders
 */
const TransactionRow = memo(({ transaction }) => {
    const { handleView, handleEdit, handlePrint, handleDelete, isDeleting, deletingId } = useTransactionsContext();

    const isCurrentlyDeleting = isDeleting && deletingId === transaction.id;

    return (
        <tr
            className={`hover:bg-gray-50/50 transition-colors ${isCurrentlyDeleting ? 'opacity-50' : ''}`}
        >
            <td className="py-4 px-6 w-[15%]">
                <div className="flex items-center gap-3">
                    {getTypeIcon(transaction.type)}
                    <div>
                        <p className="font-bold text-gray-800">{transaction.id}</p>
                        <p className={`text-xs font-bold ${getTypeColorClass(transaction.type)}`}>
                            {transaction.type}
                        </p>
                    </div>
                </div>
            </td>

            <td className="py-4 px-6 w-[25%]">
                <p className="font-bold text-gray-800">{transaction.party}</p>
                <p className="text-xs text-gray-400 font-medium">
                    {transaction.products} Products • {transaction.paymentMode}
                </p>
            </td>

            <td className="py-4 px-6 w-[20%]">
                <p className="font-medium text-gray-700">{transaction.date}</p>
                <p className="text-xs text-gray-400">{transaction.time}</p>
            </td>

            <td className="py-4 px-6 text-center w-[15%]">
                {getStatusBadge(transaction.status)}
            </td>

            <td className="py-4 px-6 text-right w-[15%]">
                <p className={`text-base font-extrabold ${transaction.type === 'Sale' ? 'text-green-600' :
                    transaction.type === 'Purchase' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                    {['Sale'].includes(transaction.type) ? '+' : ['Purchase'].includes(transaction.type) ? '-' : ''} {formatCurrency(transaction.amount)}
                </p>
                {transaction.status === 'Partial' && (
                    <p className="text-[10px] text-red-500 font-bold">
                        Due: {formatCurrency(calculateDueAmount(transaction))}
                    </p>
                )}
            </td>

            <td className="py-4 px-6 text-center w-[10%]">
                <button
                    onClick={() => handleView(transaction)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    disabled={isCurrentlyDeleting}
                >
                    <Eye size={18} />
                </button>
                <button
                    onClick={() => handlePrint(transaction)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    disabled={isCurrentlyDeleting}
                    title="Print Invoice"
                >
                    <Printer size={18} />
                </button>
                <button
                    onClick={() => handleEdit(transaction)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    disabled={isCurrentlyDeleting}
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => handleDelete(transaction)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={isCurrentlyDeleting}
                >
                    <Trash2 size={18} />
                </button>
            </td>
        </tr>
    );
});

TransactionRow.displayName = 'TransactionRow';

export default TransactionRow;
