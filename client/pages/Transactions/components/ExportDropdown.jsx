import React, { useState, useRef } from 'react';
import { Download, ChevronDown, Printer } from 'lucide-react';
import { useTransactionsContext } from '../context/TransactionsContext';
import { useClickOutside } from '../hooks/useClickOutside';

/**
 * Reusable export dropdown component
 * Can be used in Transactions page (with context) or other pages (with props)
 */
const ExportDropdown = ({ onExportCSV, onExportPDF }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Try to get handlers from context if not provided as props
    const context = useTransactionsContext();
    const csvHandler = onExportCSV || context?.handleExportCSV;
    const pdfHandler = onExportPDF || context?.handleExportPDF;

    // Close dropdown when clicking outside
    useClickOutside(dropdownRef, () => setIsOpen(false));

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-green-50 hover:border-green-500 hover:text-green-600 hover:shadow-md transition-all shadow-sm"
            >
                <Download size={18} /> Export Report
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => {
                            csvHandler?.();
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3"
                    >
                        <Download size={16} />
                        <div>
                            <div className="font-bold">Export as CSV</div>
                            <div className="text-xs text-gray-400 font-normal">Spreadsheet format</div>
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            pdfHandler?.();
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-3 border-t border-gray-100"
                    >
                        <Printer size={16} />
                        <div>
                            <div className="font-bold">Export as PDF</div>
                            <div className="text-xs text-gray-400 font-normal">Professional report</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;
