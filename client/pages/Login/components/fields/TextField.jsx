import React from 'react';
import FormLabel from '../../../../components/common/FormLabel';
import FormError from './FormError';

const TextField = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    icon: Icon,
    error,
    touched,
    required = false,
    maxLength,
    className = ''
}) => {
    return (
        <div className={className}>
            <FormLabel text={label} />
            <div className="relative">
                <input
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    className={`w-full pl-10 pr-3 py-3.5 bg-black/30 border ${touched && error ? 'border-red-500' : 'border-white/10'
                        } rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all`}
                />
                {Icon && <Icon className="absolute left-3.5 top-4 text-gray-500" size={16} />}
            </div>
            <FormError error={error} touched={touched} />
        </div>
    );
};

export default TextField;
