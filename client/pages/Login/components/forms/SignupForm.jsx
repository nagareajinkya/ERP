import React from 'react';
import { Store, User } from 'lucide-react';
import TextField from '../fields/TextField';
import EmailField from '../fields/EmailField';
import PasswordField from '../fields/PasswordField';
import PhoneField from '../fields/PhoneField';
import StateSelect from './StateSelect';
import AuthButton from '../common/AuthButton';

const SignupForm = ({
    storeName,
    setStoreName,
    ownerName,
    setOwnerName,
    phone,
    setPhone,
    email,
    setEmail,
    password,
    setPassword,
    bizState,
    setBizState,
    onSubmit,
    fieldErrors,
    touched,
    handleBlur,
    loading
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <TextField
                    label="Store Name"
                    placeholder="e.g. Rahul Supermarket"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    onBlur={() => handleBlur('storeName')}
                    icon={Store}
                    error={fieldErrors.storeName}
                    touched={touched.storeName}
                    required
                />

                <TextField
                    label="Owner Name"
                    placeholder="Your Full Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    onBlur={() => handleBlur('ownerName')}
                    icon={User}
                    error={fieldErrors.ownerName}
                    touched={touched.ownerName}
                    required
                />

                <PhoneField
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    error={fieldErrors.phone}
                    touched={touched.phone}
                />

                <EmailField
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    error={fieldErrors.email}
                    touched={touched.email}
                />

                <PasswordField
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    error={fieldErrors.password}
                    touched={touched.password}
                />

                <StateSelect
                    value={bizState}
                    onChange={(e) => setBizState(e.target.value)}
                    onBlur={() => handleBlur('bizState')}
                    error={fieldErrors.bizState}
                    touched={touched.bizState}
                />
            </div>

            <AuthButton type="submit" loading={loading} className="mt-4">
                Continue
            </AuthButton>
        </form>
    );
};

export default SignupForm;
