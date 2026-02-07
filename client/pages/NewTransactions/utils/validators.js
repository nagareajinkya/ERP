/**
 * Validation utilities for NewTransactions
 */

/**
 * Validate customer selection
 */
export const validateCustomer = (selectedCustomer) => {
    if (!selectedCustomer) {
        return { valid: false, error: 'Please select a party.' };
    }
    return { valid: true };
};

/**
 * Validate that at least one product is filled
 */
export const validateProducts = (products) => {
    const filledProducts = products.filter(p => p.name && p.name.trim() !== '');

    if (filledProducts.length === 0) {
        return { valid: false, error: 'Please add at least one product.', filledProducts: [] };
    }

    return { valid: true, filledProducts };
};

/**
 * Validate individual product fields
 */
export const validateProductFields = (product) => {
    // Check if product exists in master list (unless it's a free item)
    if (!product.productId && !product.isFree) {
        return { valid: false, error: `Product '${product.name}' not found in list.` };
    }

    // Check quantity
    if (!product.qty || Number(product.qty) <= 0) {
        return { valid: false, error: `Invalid quantity for '${product.name}'.` };
    }

    // Check price (skip for free items)
    if (!product.isFree && (!product.price || Number(product.price) < 0)) {
        return { valid: false, error: `Price missing for '${product.name}'.` };
    }

    return { valid: true };
};

/**
 * Validate entire transaction
 */
export const validateTransaction = (selectedCustomer, products) => {
    // Validate customer
    const customerValidation = validateCustomer(selectedCustomer);
    if (!customerValidation.valid) {
        return customerValidation;
    }

    // Validate products exist
    const productsValidation = validateProducts(products);
    if (!productsValidation.valid) {
        return productsValidation;
    }

    // Validate each product's fields
    for (const product of productsValidation.filledProducts) {
        const fieldValidation = validateProductFields(product);
        if (!fieldValidation.valid) {
            return fieldValidation;
        }
    }

    return { valid: true, filledProducts: productsValidation.filledProducts };
};
