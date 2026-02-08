import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import FormLabel from '../../../../components/common/FormLabel';
import FormError from './FormError';

const PasswordField = ({ value, onChange, onBlur, error, touched }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <FormLabel text="Password" />
            </div>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`w-full pl-10 pr-12 py-3.5 bg-black/30 border ${touched && error ? 'border-red-500' : 'border-white/10'
                        } rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all`}
                />
                <Lock className="absolute left-3.5 top-4 text-gray-500" size={18} />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3.5 top-4 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <FormError error={error} touched={touched} />
        </div>
    );
};

export default PasswordField;
