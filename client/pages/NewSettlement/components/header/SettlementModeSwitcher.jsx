import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNewSettlementContext } from '../../context/NewSettlementContext';

const SettlementModeSwitcher = () => {
    const navigate = useNavigate();
    const { isReceipt } = useNewSettlementContext();

    return (
        <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200">
            <button
                onClick={() => navigate('/new-receipt')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isReceipt
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                Receipt
            </button>
            <button
                onClick={() => navigate('/new-payment')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!isReceipt
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
            >
                Payment
            </button>
        </div>
    );
};

export default SettlementModeSwitcher;
