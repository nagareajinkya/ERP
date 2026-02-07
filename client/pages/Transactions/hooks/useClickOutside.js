import { useEffect } from 'react';

/**
 * Reusable hook to detect clicks outside a referenced element
 * @param {React.RefObject} ref - The ref to monitor
 * @param {Function} callback - Function to call when clicked outside
 */
export const useClickOutside = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback]);
};
