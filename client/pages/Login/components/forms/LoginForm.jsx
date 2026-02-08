import React from 'react';
import EmailField from '../fields/EmailField';
import PasswordField from '../fields/PasswordField';
import AuthButton from '../common/AuthButton';

const LoginForm = ({
    email,
    setEmail,
    password,
    setPassword,
    onSubmit,
    fieldErrors,
    touched,
    handleBlur,
    loading
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-5 animate-in fade-in">
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

            <AuthButton type="submit" loading={loading} className="mt-4">
                Login
            </AuthButton>
        </form>
    );
};

export default LoginForm;
