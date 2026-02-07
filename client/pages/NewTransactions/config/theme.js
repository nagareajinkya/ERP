/**
 * Theme configuration for Sale and Purchase modes
 */

export const getTheme = (isSale) => ({
    primary: isSale ? 'bg-green-600' : 'bg-red-600',
    primaryHover: isSale ? 'hover:bg-green-700' : 'hover:bg-red-700',
    text: isSale ? 'text-green-600' : 'text-red-600',
    lightBg: isSale ? 'bg-green-50' : 'bg-red-50',
    borderFocus: isSale ? 'focus:border-green-500' : 'focus:border-red-500',
});
