import React from 'react';
import { Calendar, History, Save, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNewSettlementContext } from '../../context/NewSettlementContext';
import SettlementModeSwitcher from './SettlementModeSwitcher';
import SettlementPartySearch from './SettlementPartySearch';

const SettlementHeader = () => {
    const navigate = useNavigate();
    const { date, setDate, handleSave, theme, loading } = useNewSettlementContext();

    return (
        <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-30">
            {/* Left: Mode Switcher & Date */}
            <div className="flex items-center gap-4">
                <SettlementModeSwitcher />

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-4">
                    <SettlementPartySearch />
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
                >
                    <History size={20} />
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary} ${theme.primaryHover}`}
                >
                    {loading ? 'Saving...' : <><Check size={18} /> Save Record</>}
                </button>
            </div>
        </div>
    );
};

export default SettlementHeader;
