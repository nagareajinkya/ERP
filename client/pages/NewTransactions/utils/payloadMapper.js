/**
 * API payload mapping utilities
 */

/**
 * Build transaction payload for API
 */
export const buildTransactionPayload = ({
    selectedCustomer,
    date,
    isSale,
    filledProducts,
    totals,
    paidAmount,
    paymentMode,
    notes,
    appliedOffers
}) => {
    return {
        partyId: (selectedCustomer?.id && selectedCustomer.id !== 'walk-in')
            ? selectedCustomer.id
            : null,
        partyName: selectedCustomer
            ? selectedCustomer.name
            : 'Walk-in Customer',
        date,
        type: isSale ? 'SALE' : 'PURCHASE',
        products: filledProducts.map(p => ({
            productId: p.productId,
            qty: p.qty,
            price: p.price,
            amount: p.amount,
            isFree: p.isFree,
            free: p.isFree,
        })),
        subTotal: totals.sub,
        discount: totals.disc,
        totalAmount: totals.total,
        paidAmount: Number(paidAmount) || 0,
        paymentMode,
        notes,
        appliedOffers: (appliedOffers || []).map(o => ({
            offerId: o.id,
            offerName: o.desc || o.name || 'Offer',
            discountAmount: o.value || o.discountAmount || 0
        }))
    };
};
