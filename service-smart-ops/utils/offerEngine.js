
/**
 * Core Offer Engine
 * Applies active offers to the current cart (products) based on strict Schema rules.
 * @param {Array} products - List of {id, productId, name, qty, price, amount, ...}
 * @param {Array} activeOffers - List of Offer documents from DB
 * @param {String} customerId - ID of selected customer (optional)
 * @returns {Object} { appliedOffers, subTotal, discount, grandTotal, products }
 */
const calculateOffers = (products, activeOffers, customerId, excludedOfferIds = []) => {
    let appliedOffers = [];
    let subTotal = 0;

    // 1. Clean & Calculate Initial Subtotal
    // Remove previously auto-added free items to recalculate from fresh state
    let workingProducts = products
        .filter(p => !p.isFree)
        .map(p => ({
            ...p,
            amount: (Number(p.qty) || 0) * (Number(p.price) || 0),
            finalPrice: Number(p.price) || 0,
            originalPrice: Number(p.price) || 0
        }));

    subTotal = workingProducts.reduce((acc, p) => acc + p.amount, 0);

    let discountTotal = 0;
    const newFreeItems = [];

    // 2. Filter Active Offers (Targeting & Exclusion Check)
    // We only process offers relevant to this customer AND not manually excluded.

    const relevantOffers = activeOffers.filter(offer => {
        // Exclusion Check
        if (excludedOfferIds && excludedOfferIds.includes(offer._id.toString())) {
            return false;
        }

        // Targeting Check
        if (offer.targetType === 'specific') {
            const match = offer.selectedCustomers && offer.selectedCustomers.includes(customerId);
            return match;
        }
        return true;
    });

    console.log(`[OfferEngine] Relevant Offers: ${relevantOffers.length}`);

    // 3. Iterate Relevant Offers
    relevantOffers.forEach(offer => {
        let applied = false;

        // --- RULE: BOGO (Buy X Get Y) ---
        if (offer.ruleType === 'bogo') {
            // Find trigger product
            const triggerItem = workingProducts.find(p =>
                (p.productId && offer.buyProductId && p.productId === offer.buyProductId) || // ID Match (Strong)
                (p.name && offer.buyProductName && p.name.toLowerCase().includes(offer.buyProductName.toLowerCase())) // Name Match (Fallback)
            );

            if (triggerItem && triggerItem.qty >= (offer.buyQty || 1)) {
                // Calculate Sets
                const sets = Math.floor(triggerItem.qty / (offer.buyQty || 1));
                const freeQty = sets * (offer.getQty || 1);

                if (freeQty > 0) {
                    newFreeItems.push({
                        id: Date.now() + Math.random(),
                        productId: offer.getProductId || null, // Robust ID if available
                        name: offer.getProductName,
                        qty: freeQty,
                        price: 0.01, // DB Requirement: Non-zero price
                        amount: 0, // Visual amount is 0 (or we can make it 0.01 * qty)
                        isFree: true,
                        offerId: offer._id,
                        manual: false
                    });
                    applied = true;
                }
            }
        }

        // --- RULE: PRODUCT DISCOUNT ---
        else if (offer.ruleType === 'product_disc') {
            const targetItem = workingProducts.find(p =>
                (p.productId && offer.buyProductId && p.productId === offer.buyProductId) ||
                (p.name && offer.buyProductName && p.name.toLowerCase().includes(offer.buyProductName.toLowerCase()))
            );

            if (targetItem && targetItem.qty >= 1) {
                let itemDisc = 0;
                if (offer.discountType === 'percentage') {
                    itemDisc = (targetItem.amount * (offer.discountValue || 0)) / 100;
                } else {
                    itemDisc = (offer.discountValue || 0) * targetItem.qty;
                }

                if (itemDisc > targetItem.amount) itemDisc = targetItem.amount;

                discountTotal += itemDisc;
                applied = true;
            }
        }

        // --- RULE: CART VALUE ---
        else if (offer.ruleType === 'cart_value') {
            if (subTotal >= (offer.minPurchase || 0)) {
                let cartDisc = 0;
                if (offer.discountType === 'percentage') {
                    cartDisc = (subTotal * (offer.discountValue || 0)) / 100;
                } else {
                    cartDisc = (offer.discountValue || 0);
                }

                discountTotal += cartDisc;
                applied = true;
            }
        }

        if (applied) {
            appliedOffers.push({
                id: offer._id,
                desc: offer.description || offer.name,
                value: offer.discountValue
            });
        }
    });

    // 4. Finalize
    if (discountTotal > subTotal) discountTotal = subTotal;
    const grandTotal = subTotal - discountTotal;

    const finalProducts = [...workingProducts, ...newFreeItems];

    // Determine Available Offers
    const availableOffers = relevantOffers
        .filter(o => !appliedOffers.find(ao => ao.id.toString() === o._id.toString()))
        .map(o => ({
            id: o._id,
            desc: o.description || o.name
        }));

    return {
        products: finalProducts,
        totals: {
            sub: subTotal,
            disc: discountTotal,
            total: grandTotal
        },
        appliedOffers,
        availableOffers
    };
};

module.exports = { calculateOffers };
