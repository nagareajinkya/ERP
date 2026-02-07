import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Walk-in customer details modal
 */
const WalkInModal = ({ isOpen, onClose, onSave }) => {
    const [details, setDetails] = useState({
        name: '',
        phone: '',
        address: '',
        gstin: '',
        state: ''
    });

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(details);
        setDetails({ name: '', phone: '', address: '', gstin: '', state: '' }); // Reset
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-gray-800">Walk-in Customer</h3>
                    <button onClick={onClose}>
                        <X size={18} className="text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            placeholder="Name"
                            className="w-full border-b py-2 outline-none focus:border-green-500"
                            autoFocus
                            value={details.name}
                            onChange={e => setDetails({ ...details, name: e.target.value })}
                        />
                        <input
                            placeholder="Phone"
                            className="w-full border-b py-2 outline-none focus:border-green-500"
                            value={details.phone}
                            onChange={e => setDetails({ ...details, phone: e.target.value })}
                        />
                    </div>
                    <input
                        placeholder="Address"
                        className="w-full border-b py-2 outline-none focus:border-green-500"
                        value={details.address}
                        onChange={e => setDetails({ ...details, address: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            placeholder="GSTIN"
                            className="w-full border-b py-2 outline-none focus:border-green-500"
                            value={details.gstin}
                            onChange={e => setDetails({ ...details, gstin: e.target.value })}
                        />
                        <input
                            placeholder="State"
                            className="w-full border-b py-2 outline-none focus:border-green-500"
                            value={details.state}
                            onChange={e => setDetails({ ...details, state: e.target.value })}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 rounded-b-xl flex justify-end gap-3 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded hover:bg-green-700 shadow"
                    >
                        Save Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalkInModal;
