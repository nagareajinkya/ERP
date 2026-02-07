import React from 'react';
import { Calendar, History, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNewTransactionContext } from '../../context/NewTransactionContext';
import ModeSwitcher from './ModeSwitcher';
import PartySearch from './PartySearch';

/**
 * Transaction header with mode switcher, party search, date, and actions
 */
const TransactionHeader = () => {
    const navigate = useNavigate();
    const { date, setDate, editMode, handleSave, theme, selectedCustomer } = useNewTransactionContext();

    const getSaveLabel = () => {
        if (editMode) return 'Update';
        return 'Save Bill';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-30">
            {/* Left: Mode Switcher & Date */}
            <div className="flex items-center gap-4">
                <ModeSwitcher />

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-4">
                    <PartySearch />

                    {/* Party Balance Display */}

                </div>

                <div className="relative">
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="pl-9 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm font-medium outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 cursor-pointer"
                    />
                    <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/transactions')}
                    className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="History"
                >
                    <History size={20} />
                </button>
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 font-medium ${theme.primary} ${theme.primaryHover}`}
                >
                    <Save size={18} /> {getSaveLabel()}
                </button>
            </div>
        </div>
    );
};

export default TransactionHeader;
