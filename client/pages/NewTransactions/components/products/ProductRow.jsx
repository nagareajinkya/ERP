import React from 'react';
import { Trash2, History, Gift } from 'lucide-react';

/**
 * Individual product row in the table
 */
const ProductRow = ({
    product,
    index,
    onUpdate,
    onRemove,
    onViewHistory,
    allProducts,
    isLast,
    onFocus
}) => {
    return (
        <div
            className={`product-row grid grid-cols-12 gap-3 items-center px-4 py-1.5 rounded-lg transition-colors border border-transparent ${product.isFree ? 'bg-amber-50 border-amber-200' : 'hover:bg-gray-50'
                }`}
        >
            {/* Product Name */}
            <div className="col-span-5 relative">
                <input
                    className={`w-full bg-transparent p-2 text-sm font-medium outline-none rounded-md focus:bg-white focus:shadow-sm ${product.isFree ? 'text-amber-800 placeholder-amber-400' : 'text-gray-800'
                        }`}
                    placeholder="Start typing..."
                    value={product.name}
                    onChange={e => onUpdate(product.id, 'name', e.target.value)}
                    onFocus={onFocus}
                    disabled={product.isFree}
                    autoFocus={isLast && !product.name}
                />
                {product.isFree && (
                    <span className="absolute right-0 top-2.5 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Gift size={10} /> FREE
                    </span>
                )}
            </div>

            {/* Quantity */}
            <div className="col-span-2">
                <input
                    type="number"
                    className="w-full text-right bg-transparent p-2 text-sm outline-none border-b border-transparent focus:border-gray-300 focus:bg-white rounded"
                    value={product.qty}
                    onChange={e => onUpdate(product.id, 'qty', e.target.value)}
                />
            </div>

            {/* Price */}
            <div className="col-span-2">
                <input
                    type="number"
                    min="0"
                    className="w-full text-right bg-transparent p-2 text-sm outline-none border-b border-transparent focus:border-gray-300 focus:bg-white rounded"
                    value={product.price}
                    onChange={e => onUpdate(product.id, 'price', e.target.value)}
                    disabled={product.isFree}
                />
            </div>

            {/* Amount */}
            <div className="col-span-2 text-right font-bold text-gray-700 text-sm">
                ₹{(product.amount || 0).toLocaleString()}
            </div>

            {/* Actions */}
            <div className="col-span-1 flex justify-center gap-1">
                {product.productId && (
                    <button
                        onClick={() => {
                            const prod = allProducts.find(ap => ap.id === product.productId);
                            if (prod) onViewHistory(prod);
                        }}
                        className="text-gray-300 hover:text-blue-500 transition-colors p-1.5 hover:bg-blue-50 rounded-md"
                        title="View History"
                    >
                        <History size={16} />
                    </button>
                )}
                <button
                    onClick={() => onRemove(product.id, !!product.offerId)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-md"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default ProductRow;
