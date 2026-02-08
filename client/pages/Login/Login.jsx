import React, { useState } from 'react';
import { useValidation } from './hooks/useValidation';
import { useAuthForm } from './hooks/useAuthForm';
import AuthLayout from './components/layout/AuthLayout';
import BrandHeader from './components/layout/BrandHeader';
import LoginForm from './components/forms/LoginForm';
import SignupForm from './components/forms/SignupForm';
import CompleteProfileForm from './components/forms/CompleteProfileForm';
import AuthToggle from './components/common/AuthToggle';

const Login = () => {
  // --- UI STATE ---
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);

  // --- FORM STATE ---
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bizState, setBizState] = useState('');
  const [gstin, setGstin] = useState('');
  const [upiId, setUpiId] = useState('');

  // --- CUSTOM HOOKS ---
  const { fieldErrors, touched, handleBlur, validateForm, resetValidation, setTouched } = useValidation();
  const { loading, error, handleLogin, handleCompleteProfile, clearError } = useAuthForm();

  // --- HANDLERS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const formData = { email, password, phone, storeName, ownerName, bizState };
    if (!validateForm(formData, mode)) {
      return;
    }

    if (mode === 'signup') {
      setStep(3); // Go to final step
      return;
    }

    // Login
    await handleLogin(email, password);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const formData = { ownerName, email, phone, password, storeName, bizState, gstin, upiId };
    await handleCompleteProfile(formData);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setStep(1);
    clearError();
    resetValidation();
  };

  const handleFieldBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
  };

  return (
    <AuthLayout>
      <BrandHeader />

      {/* MAIN CARD */}
      <div className={`relative z-10 ${mode === 'signup' && step === 1 ? 'w-full max-w-xl' : 'w-full max-w-md'} bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-500 transition-all`}>

        {step === 1 ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-gray-400">
                {mode === 'login' ? 'Sign in to manage your store' : 'Start managing your business smartly today'}
              </p>
            </div>

            {mode === 'login' ? (
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={handleAuthSubmit}
                fieldErrors={fieldErrors}
                touched={touched}
                handleBlur={handleFieldBlur}
                loading={loading}
              />
            ) : (
              <SignupForm
                storeName={storeName}
                setStoreName={setStoreName}
                ownerName={ownerName}
                setOwnerName={setOwnerName}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                bizState={bizState}
                setBizState={setBizState}
                onSubmit={handleAuthSubmit}
                fieldErrors={fieldErrors}
                touched={touched}
                handleBlur={handleFieldBlur}
                loading={loading}
              />
            )}

            {error && <div className="mt-3 text-sm text-red-400 font-medium">{error}</div>}

            <AuthToggle mode={mode} onToggle={toggleMode} />
          </>
        ) : (
          <CompleteProfileForm
            gstin={gstin}
            setGstin={setGstin}
            upiId={upiId}
            setUpiId={setUpiId}
            onSubmit={handleProfileSubmit}
            loading={loading}
          />
        )}
      </div>
    </AuthLayout>
  );
};

export default Login;