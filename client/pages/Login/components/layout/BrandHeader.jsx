import React from 'react';
import logo from '../../../../src/assets/logo.svg';

const BrandHeader = () => {
    return (
        <div className="relative z-10 flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
                <img src={logo} alt="S-BMS Logo" className="w-full h-full p-1.5 object-contain scale-110" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-widest flex items-baseline">
                S<span className="text-2xl font-bold opacity-90 leading-none ml-1">BMS</span>
            </h1>
        </div>
    );
};

export default BrandHeader;
