import React from 'react';
import { FileText, QrCode, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextField from '../fields/TextField';
import AuthButton from '../common/AuthButton';

const CompleteProfileForm = ({
    gstin,
    setGstin,
    upiId,
    setUpiId,
    onSubmit,
    loading,
    error
}) => {
    const navigate = useNavigate();
    const isFormEmpty = !gstin && !upiId;

    return (
        <div className="animate-in slide-in-from-right-4 fade-in">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Final Step!</h2>
                <p className="text-sm text-gray-400">
                    Set up your billing and payments. You can also do this later from Settings.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
                <TextField
                    label="GSTIN / Tax ID"
                    placeholder="Optional"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    icon={FileText}
                />

                <TextField
                    label="UPI ID (For QR Code Generation)"
                    placeholder="storename@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    icon={QrCode}
                />

                {error && <div className="text-sm text-red-400 font-medium">{error}</div>}

                <div className="flex gap-4 mt-8">
                    <AuthButton
                        type="button"
                        onClick={() => navigate('/Dashboard')}
                        variant="secondary"
                        icon={null}
                    >
                        Skip for now
                    </AuthButton>

                    <AuthButton
                        type="submit"
                        loading={loading}
                        disabled={isFormEmpty}
                    >
                        Save & Start
                    </AuthButton>
                </div>
            </form>
        </div>
    );
};

export default CompleteProfileForm;
