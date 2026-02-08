import React from 'react';
import { Phone } from 'lucide-react';
import FormLabel from '../../../../components/common/FormLabel';
import FormError from './FormError';

const PhoneField = ({ value, onChange, onBlur, error, touched }) => {
    const handleChange = (e) => {
        const numericValue = e.target.value.replace(/\D/g, '');
        onChange({ target: { value: numericValue } });
    };

    return (
        <div>
            <FormLabel text="Mobile Number" />
            <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400 font-bold border-r border-gray-600 pr-3">
                    +91
                </span>
                <input
                    type="tel"
                    maxLength="10"
                    placeholder="99999 99999"
                    required
                    value={value}
                    onChange={handleChange}
                    onBlur={onBlur}
                    className={`w-full pl-16 pr-3 py-3.5 bg-black/30 border ${touched && error ? 'border-red-500' : 'border-white/10'
                        } rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all`}
                />
                <Phone className="absolute right-3.5 top-4 text-gray-500" size={16} />
            </div>
            <FormError error={error} touched={touched} />
        </div>
    );
};

export default PhoneField;
