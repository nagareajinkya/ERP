import { useEffect } from 'react';

/**
 * Custom hook for click-outside detection
 * @param {Array} refs - Array of refs to exclude from outside clicks
 * @param {Function} handler - Callback when clicking outside
 */
export const useClickOutside = (refs, handler) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInside = refs.some(ref =>
                ref.current && ref.current.contains(event.target)
            );

            if (!clickedInside) {
                handler(event);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [refs, handler]);
};
