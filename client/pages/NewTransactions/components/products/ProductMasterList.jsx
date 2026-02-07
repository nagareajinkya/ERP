import React from 'react';
import { Search } from 'lucide-react';
import { useNewTransactionContext } from '../../context/NewTransactionContext';

/**
 * Product master list sidebar
 */
const ProductMasterList = () => {
    const {
        searchProducts,
        focusedRowId,
        handleProductSelect,
    } = useNewTransactionContext();

    return (
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden min-h-0">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase">
                    {focusedRowId ? 'Select Product' : 'Product Master'}
                </span>
                <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                    {searchProducts.length}
                </span>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-2">
                {searchProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                        <Search size={24} className="opacity-20" />
                        <p className="text-xs">No products found</p>
                    </div>
                ) : (
                    searchProducts.map(p => (
                        <div
                            key={p.id}
                            onMouseDown={() => handleProductSelect(focusedRowId, p)}
                            className="group px-3 py-2.5 mb-1 rounded-xl text-sm hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-all border border-transparent hover:border-blue-100"
                        >
                            <span className="text-gray-700 font-medium group-hover:text-blue-700">{p.name}</span>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600 bg-gray-50 group-hover:bg-white px-2 py-1 rounded-md">
                                ₹{p.price}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductMasterList;
