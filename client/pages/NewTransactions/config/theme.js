/**
 * Theme configuration for Sale and Purchase modes
 */

export const getTheme = (type) => {
    // Backward compatibility or direct string check
    const isSale = type === 'sale' || type === true;


    if (isSale) {
        return {
            primary: 'bg-green-600',
            primaryHover: 'hover:bg-green-700',
            text: 'text-green-600',
            lightBg: 'bg-green-50',
            borderFocus: 'focus:border-green-500',
        };
    }

    // Default / Purchase
    return {
        primary: 'bg-red-600',
        primaryHover: 'hover:bg-red-700',
        text: 'text-red-600',
        lightBg: 'bg-red-50',
        borderFocus: 'focus:border-red-500',
    };
};
