
/**
 * Core Offer Engine
 * Applies active offers to the current cart (products)
 * @param {Array} products - List of {id, name, qty, price, amount, ...}
 * @param {Array} activeOffers - List of Offer documents from DB
 * @returns {Object} { appliedOffers, subTotal, discount, grandTotal, products }
 */
const calculateOffers = (products, activeOffers) => {
    let appliedOffers = [];
    let subTotal = 0;

    // 1. Calculate Initial Subtotal & Reset Free Items
    // Filter out previously auto-added free items if we are recalculating from scratch
    // But usually frontend sends what's visible. If frontend sends "Free" items, we should re-evaluate them.
    // Strategy: We recalculate everything. We might need to identify manual vs auto items.
    // For now, assume 'products' contains only what user manually added OR we clear auto-added ones first?
    // Simpler: The input 'products' should clean out any 'isFree: true' items before sending, OR we clean them here.

    let workingProducts = products.filter(p => !p.isFree).map(p => ({
        ...p,
        amount: (p.qty || 0) * (p.price || 0),
        finalPrice: p.price
    }));

    subTotal = workingProducts.reduce((acc, p) => acc + p.amount, 0);

    let discountTotal = 0;
    const newFreeItems = [];

    // 2. Apply Offers
    activeOffers.forEach(offer => {
        let applied = false;

        // --- TRIGGER TYPE: PRODUCT_BUY ---
        if (offer.triggerType === 'product_buy') {
            const triggerItem = workingProducts.find(p =>
                p.name && offer.triggerProduct && p.name.toLowerCase().includes(offer.triggerProduct.toLowerCase())
            );

            if (triggerItem && triggerItem.qty >= (offer.minQty || 1)) {

                // ACTION: AUTO_ADD (Buy X Get Y)
                if (offer.action === 'auto_add') {
                    // Calculate how many sets of free items
                    // e.g. Buy 1 Rice get 1 Maggi. Bought 2 Rice -> Get 2 Maggi.
                    const sets = Math.floor(triggerItem.qty / (offer.minQty || 1));
                    const freeQty = sets * (offer.rewardQty || 1);

                    if (freeQty > 0) {
                        newFreeItems.push({
                            id: Date.now() + Math.random(), // Temporary ID
                            name: offer.rewardProduct,
                            qty: freeQty,
                            price: 0,
                            amount: 0,
                            isFree: true,
                            offerId: offer.id
                        });
                        applied = true;
                    }
                }

                // ACTION: ITEM_DISCOUNT (Discount on the trigger item itself)
                else if (offer.action === 'item_discount') {
                    // e.g. Buy 5kg Sugar, get 20Rs off
                    const discountAmount = offer.value; // Fixed amount off? OR percentage?
                    discountTotal += discountAmount;
                    applied = true;
                }
            }
        }

        // --- TRIGGER TYPE: ALL (Storewide) ---
        else if (offer.triggerType === 'all') {
            if (offer.action === 'cart_discount') {
                const disc = (subTotal * offer.value) / 100; // Assuming value is Percentage
                discountTotal += disc;
                applied = true;
            }
        }

        if (applied) {
            appliedOffers.push({
                id: offer.id,
                desc: offer.desc,
                value: offer.value
            });
        }
    });

    // Merge Free Items into Products
    const finalProducts = [...workingProducts, ...newFreeItems];
    const grandTotal = Math.max(0, subTotal - discountTotal);

    return {
        products: finalProducts,
        totals: {
            sub: subTotal,
            disc: discountTotal,
            total: grandTotal
        },
        appliedOffers,
        availableOffers: activeOffers.filter(o => !appliedOffers.find(ao => ao.id === o.id)) // Simplified 'available' logic
    };
};

module.exports = { calculateOffers };
