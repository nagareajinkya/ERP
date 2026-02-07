import React from 'react';
import { Plus } from 'lucide-react';
import { useNewTransactionContext } from '../../context/NewTransactionContext';
import ProductRow from './ProductRow';

/**
 * Products table component
 */
const ProductsTable = () => {
    const {
        products,
        allProducts,
        handleUpdateProduct,
        handleRemoveProduct,
        handleViewProductHistory,
        handleAddProduct,
        theme,
        setFocusedRowId,
    } = useNewTransactionContext();

    return (
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden h-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-3 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Product Name</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                {products.map((product, idx) => (
                    <ProductRow
                        key={product.id}
                        product={product}
                        index={idx}
                        onUpdate={handleUpdateProduct}
                        onRemove={handleRemoveProduct}
                        onViewHistory={handleViewProductHistory}
                        allProducts={allProducts}
                        isLast={idx === products.length - 1}
                        onFocus={() => setFocusedRowId(product.id)}
                    />
                ))}
            </div>

            {/* Add Row Button */}
            <div className="p-2 border-t border-gray-100 bg-gray-50/30">
                <button
                    onClick={handleAddProduct}
                    className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors ${theme.text} hover:bg-gray-50`}
                >
                    <Plus size={16} /> Add Product Row
                </button>
            </div>
        </div>
    );
};

export default ProductsTable;
