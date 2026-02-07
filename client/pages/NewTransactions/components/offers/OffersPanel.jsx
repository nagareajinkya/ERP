import React, { useState } from 'react';
import { Ticket, CheckCircle2, X } from 'lucide-react';
import { useNewTransactionContext } from '../../context/NewTransactionContext';

/**
 * Offers and deals panel
 */
const OffersPanel = () => {
    const {
        isSale,
        appliedOffers,
        availableOffers,
        removedOfferIds,
        handleRemoveOffer,
        handleReapplyOffer,
    } = useNewTransactionContext();

    const [showOffers, setShowOffers] = useState(true);

    // Only show for sales
    if (!isSale) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col max-h-[40%]">
            {/* Header */}
            <div
                className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowOffers(!showOffers)}
            >
                <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-purple-500" />
                    <span className="text-xs font-bold text-gray-600 uppercase">Offers & Deals</span>
                </div>
                <span className="text-xs text-blue-600 font-medium">{showOffers ? 'Hide' : 'Show'}</span>
            </div>

            {/* Offers List */}
            {showOffers && (
                <div className="overflow-y-auto p-3 space-y-3">
                    {/* Applied Offers */}
                    {appliedOffers.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Applied</p>
                            {appliedOffers.map(o => (
                                <div key={o.id} className="bg-green-50 border border-green-100 p-2 rounded-lg flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <CheckCircle2 size={14} className="text-green-600 mt-0.5" />
                                        <span className="text-xs text-green-800 font-medium leading-tight">{o.desc}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveOffer(o.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Available Offers */}
                    {availableOffers.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Available</p>
                            {availableOffers.map(o => (
                                <div key={o.id} className="bg-gray-50 border border-dashed border-gray-300 p-2 rounded-lg flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-gray-600">{o.desc}</span>
                                    {removedOfferIds.includes(o.id) && (
                                        <button
                                            onClick={() => handleReapplyOffer(o.id)}
                                            className="text-[10px] underline text-blue-600 font-bold"
                                        >
                                            Apply
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {appliedOffers.length === 0 && availableOffers.length === 0 && (
                        <div className="text-center py-4 text-xs text-gray-400">No active offers</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OffersPanel;
