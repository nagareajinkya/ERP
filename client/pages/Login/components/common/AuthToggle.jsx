import React from 'react';

const AuthToggle = ({ mode, onToggle }) => {
    return (
        <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
                onClick={onToggle}
                className="font-bold text-green-500 hover:text-green-400 hover:underline transition-all"
            >
                {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
        </div>
    );
};

export default AuthToggle;
