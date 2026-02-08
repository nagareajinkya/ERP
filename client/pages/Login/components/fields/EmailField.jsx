import React from 'react';
import { Mail } from 'lucide-react';
import FormLabel from '../../../../components/common/FormLabel';
import FormError from './FormError';

const EmailField = ({ value, onChange, onBlur, error, touched }) => {
    return (
        <div>
            <FormLabel text="Email Address" />
            <div className="relative">
                <input
                    type="email"
                    placeholder="store@store.com"
                    required
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`w-full pl-10 pr-4 py-3.5 bg-black/30 border ${touched && error ? 'border-red-500' : 'border-white/10'
                        } rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all`}
                />
                <Mail className="absolute left-3.5 top-4 text-gray-500" size={18} />
            </div>
            <FormError error={error} touched={touched} />
        </div>
    );
};

export default EmailField;
