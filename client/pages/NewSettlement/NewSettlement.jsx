import React from 'react';
import { NewSettlementProvider, useNewSettlementContext } from './context/NewSettlementContext';
import SettlementHeader from './components/header/SettlementHeader';
import SettlementForm from './components/body/SettlementForm';
import PartyBalanceCard from './components/body/PartyBalanceCard';

const NewSettlementContent = () => {
    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
            {/* Header */}
            <SettlementHeader />

            {/* Body */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-10 gap-4 p-4 overflow-hidden">
                {/* Left Panel: Form */}
                <div className="md:col-span-7 h-full overflow-hidden">
                    <SettlementForm />
                </div>

                {/* Right Panel: Party Info */}
                <div className="md:col-span-3 h-full overflow-hidden">
                    <PartyBalanceCard />
                </div>
            </div>
        </div>
    );
};

const NewSettlement = ({ type = 'receipt' }) => {
    return (
        <NewSettlementProvider type={type}>
            <NewSettlementContent />
        </NewSettlementProvider>
    );
};

export default NewSettlement;
