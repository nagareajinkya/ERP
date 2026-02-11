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
        selectedIndex,
    } = useNewTransactionContext();

    const scrollRef = React.useRef(null);

    React.useEffect(() => {
        if (scrollRef.current && selectedIndex >= 0) {
            const activeItem = scrollRef.current.children[selectedIndex];
            if (activeItem) {
                activeItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [selectedIndex]);

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
            <div className="flex-1 overflow-y-auto p-2" ref={scrollRef}>
                {searchProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                        <Search size={24} className="opacity-20" />
                        <p className="text-xs">No products found</p>
                    </div>
                ) : (
                    searchProducts.map((p, index) => (
                        <div
                            key={p.id}
                            onMouseDown={() => handleProductSelect(focusedRowId, p)}
                            className={`group px-3 py-2.5 mb-1 rounded-xl text-sm cursor-pointer flex justify-between items-center transition-all border ${index === selectedIndex
                                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                                    : 'hover:bg-blue-50 border-transparent hover:border-blue-100'
                                }`}
                        >
                            <span className={`font-medium ${index === selectedIndex ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-700'}`}>
                                {p.name}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${index === selectedIndex
                                    ? 'text-blue-600 bg-white'
                                    : 'text-gray-400 group-hover:text-blue-600 bg-gray-50 group-hover:bg-white'
                                }`}>
                                {p.categoryName}/{p.unitName}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductMasterList;
