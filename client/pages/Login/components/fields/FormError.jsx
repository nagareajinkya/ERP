import React from 'react';

const FormError = ({ error, touched }) => {
    if (!touched || !error) return null;

    return (
        <p className="mt-1 text-xs text-red-400">{error}</p>
    );
};

export default FormError;
