import React from 'react';
import { ShieldCheck } from 'lucide-react';

const BrandHeader = () => {
    return (
        <div className="relative z-10 flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.4)]">
                <ShieldCheck size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">S-BMS.</h1>
        </div>
    );
};

export default BrandHeader;
