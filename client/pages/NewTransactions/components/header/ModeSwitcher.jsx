import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNewTransactionContext } from '../../context/NewTransactionContext';

/**
 * Sale/Purchase mode switcher
 */
const ModeSwitcher = () => {
    const navigate = useNavigate();
    const { isSale } = useNewTransactionContext();

    return (
        <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200">
            <button
                onClick={() => navigate('/new-sale')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isSale
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                Sale
            </button>
            <button
                onClick={() => navigate('/new-purchase')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isSale
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                Purchase
            </button>
        </div>
    );
};

export default ModeSwitcher;
