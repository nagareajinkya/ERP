import { useMemo } from 'react';

/**
 * Custom hook to calculate transaction totals
 * Uses useMemo for performance optimization
 */
export const useTransactionTotals = (transactions) => {
    const totalCredit = useMemo(() => {
        return transactions
            .filter(trx => trx.type?.toUpperCase() === 'SALE')
            .reduce((sum, trx) => sum + (trx.amount || 0), 0);
    }, [transactions]);

    const totalDebit = useMemo(() => {
        return transactions
            .filter(trx => trx.type?.toUpperCase() === 'PURCHASE' || trx.type?.toUpperCase() === 'ADJUSTMENT')
            .reduce((sum, trx) => sum + (trx.amount || 0), 0);
    }, [transactions]);

    const netBalance = useMemo(() => {
        return totalCredit - totalDebit;
    }, [totalCredit, totalDebit]);

    return {
        totalCredit,
        totalDebit,
        netBalance
    };
};
