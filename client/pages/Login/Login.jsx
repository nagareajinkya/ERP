import React, { useState, useRef, useEffect } from 'react';
import api from '../../src/api';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, ArrowRight, ShieldCheck, Lock, CheckCircle2, ChevronLeft, Store, User, MapPin, FileText, QrCode, Search, ChevronDown } from 'lucide-react';
import FormLabel from '../../components/common/FormLabel';

// --- GOOGLE ICON SVG ---
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // --- UI STATE ---
  const [mode, setMode] = useState('login');
  const [method, setMethod] = useState('phone');
  const [step, setStep] = useState(1);

  // --- FORM STATE ---
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State API & Dropdown logic
  const [bizState, setBizState] = useState('');
  const [statesList, setStatesList] = useState([]);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const stateDropdownRef = useRef(null);

  const [otp, setOtp] = useState(['', '', '', '']);
  const [gstin, setGstin] = useState('');
  const [upiId, setUpiId] = useState('');

  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // --- 1. FETCH INDIAN STATES FROM API ON LOAD ---
  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: "India" })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          // Map names and sort alphabetically
          const sortedStates = data.data.states.map(s => s.name).sort((a, b) => a.localeCompare(b));
          setStatesList(sortedStates);
        }
      })
      .catch(err => console.error("Failed to fetch states:", err));
  }, []);

  // --- 2. CLICK OUTSIDE TO CLOSE STATE DROPDOWN ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setIsStateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 3. FILTER STATES WHILE TYPING ---
  const filteredStates = statesList.filter(s => s.toLowerCase().includes(bizState.toLowerCase()));

  // --- INTERACTIVE BACKGROUND EFFECT ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouse = { x: null, y: null };

    const initCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2;
      }
      update() {
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        this.x += this.vx; this.y += this.vy;
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.5)'; ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(window.innerWidth / 15);
      for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    };

    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });

      for (let i = 0; i < particles.length; i++) {
        if (mouse.x != null) {
          const dx = mouse.x - particles[i].x; const dy = mouse.y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${1 - dist / 150})`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - dist / 100) * 0.2})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => { initCanvas(); initParticles(); });
    window.addEventListener('mousemove', handleMouseMove);
    initCanvas(); initParticles(); animate();

    return () => {
      window.removeEventListener('resize', initCanvas); window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- HANDLERS ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      setStep(2);
      setTimeout(() => otpRefs[0].current.focus(), 100);
      return;
    }

    // Email/password login
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', { identifier: email, password });
      const { token, ...user } = res.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/Dashboard');
      } else {
        setError('Login failed: no token returned');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/send-otp', { phone: `+91${phone}` });
      setStep(2);
      setTimeout(() => otpRefs[0].current.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value !== '' && index < 3) otpRefs[index + 1].current.focus();
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1].current.focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/verify-otp', { phone: `+91${phone}`, code: otp.join('') });
      const { token, ...user } = res.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/Dashboard');
      } else if (mode === 'signup') {
        setStep(3);
      } else {
        setError('Invalid OTP or no token returned');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const payload = {
        fullName: ownerName,
        email: email,
        phoneNumber: `+91${phone}`,
        password: password,
        businessName: storeName,
        addressState: bizState,
        gstin: gstin || null,
        upiId: upiId || null
      };

      const res = await api.post('/auth/register', payload);
      const { token, ...user } = res.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/Dashboard');
      } else {
        setError('Registration successful but no token received. Please login.');
        setTimeout(() => setStep(1), 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setStep(1);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4 font-sans overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-[#0B1120]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] z-0 pointer-events-none" />

      {/* BRAND HEADER */}
      <div className="relative z-10 flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.4)]">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">S-BMS.</h1>
      </div>

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

            {/* Login Toggle Method */}
            {mode === 'login' && (
              <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
                <button onClick={() => setMethod('phone')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${method === 'phone' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Phone</button>
                <button onClick={() => setMethod('email')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${method === 'email' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Email</button>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={mode === 'login' && method === 'phone' ? handleSendOTP : handleAuthSubmit} className="space-y-5">

              {/* --- COMPACT SIGNUP GRID --- */}
              {mode === 'signup' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <FormLabel text="Store Name" />
                    <div className="relative">
                      <input type="text" placeholder="e.g. Rahul Supermarket" required value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full pl-10 pr-3 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                      <Store className="absolute left-3.5 top-4 text-gray-500" size={16} />
                    </div>
                  </div>
                  <div>
                    <FormLabel text="Owner Name" />
                    <div className="relative">
                      <input type="text" placeholder="Your Full Name" required value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full pl-10 pr-3 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                      <User className="absolute left-3.5 top-4 text-gray-500" size={16} />
                    </div>
                  </div>
                  <div>
                    <FormLabel text="Mobile Number" />
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-400 font-bold border-r border-gray-600 pr-3">+91</span>
                      <input type="tel" maxLength="10" placeholder="99999 99999" required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full pl-16 pr-3 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                      <Phone className="absolute right-3.5 top-4 text-gray-500" size={16} />
                    </div>
                  </div>
                  <div>
                    <FormLabel text="Email Address" />
                    <div className="relative">
                      <input type="email" placeholder="admin@store.com" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                      <Mail className="absolute left-3.5 top-4 text-gray-500" size={16} />
                    </div>
                  </div>
                  <div>
                    <FormLabel text="Password" />
                    <div className="relative">
                      <input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                      <Lock className="absolute left-3.5 top-4 text-gray-500" size={16} />
                    </div>
                  </div>

                  {/* --- SMART STATE SELECTION WITH API --- */}
                  <div ref={stateDropdownRef} className="relative z-50">
                    <FormLabel text="State (Required)" />
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search State..."
                        required
                        value={bizState}
                        onChange={e => {
                          setBizState(e.target.value);
                          setIsStateDropdownOpen(true);
                        }}
                        onFocus={() => setIsStateDropdownOpen(true)}
                        className="w-full pl-10 pr-10 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                      />
                      <MapPin className="absolute left-3.5 top-4 text-gray-500" size={16} />
                      <ChevronDown className="absolute right-3.5 top-4 text-gray-500 pointer-events-none" size={16} />

                      {/* State Dropdown */}
                      {isStateDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B2332] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50">
                          {statesList.length === 0 ? (
                            <div className="p-3 text-sm text-gray-400 text-center">Loading states...</div>
                          ) : filteredStates.length > 0 ? (
                            filteredStates.map((state, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setBizState(state);
                                  setIsStateDropdownOpen(false);
                                }}
                                className="px-4 py-3 text-sm text-gray-300 hover:bg-green-600 hover:text-white cursor-pointer transition-colors border-b border-white/5 last:border-0"
                              >
                                {state}
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-sm text-gray-500 text-center">No state found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- LOGIN MODE --- */}
              {mode === 'login' && method === 'phone' && (
                <div>
                  <FormLabel text="Mobile Number" />
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold border-r border-gray-600 pr-3">+91</span>
                    <input type="tel" maxLength="10" placeholder="99999 99999" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} autoFocus className="w-full pl-16 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl font-bold text-white placeholder-gray-600 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-lg tracking-wider" />
                    <Phone className="absolute right-4 top-4 text-gray-500" size={20} />
                  </div>
                </div>
              )}

              {mode === 'login' && method === 'email' && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <FormLabel text="Email Address" />
                    <div className="relative">
                      <input type="email" placeholder="admin@store.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                      <Mail className="absolute left-3.5 top-4 text-gray-500" size={18} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel text="Password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider" />
                      <button type="button" className="text-xs font-bold text-green-500 hover:text-green-400">Forgot?</button>
                    </div>
                    <div className="relative">
                      <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                      <Lock className="absolute left-3.5 top-4 text-gray-500" size={18} />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading || (mode === 'login' && method === 'phone' ? phone.length !== 10 : false)} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all active:scale-[0.98] mt-4">
                {mode === 'signup' ? 'Continue & Verify' : (method === 'phone' ? 'Get OTP' : 'Login')} <ArrowRight size={20} />
              </button>
            </form>

            {error && <div className="mt-3 text-sm text-red-400 font-medium">{error}</div>}

            <div className="relative mt-8 mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-3 bg-[#131926] text-gray-500 font-medium tracking-wide">Or continue with</span></div>
            </div>

            <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold text-base shadow-lg transition-all active:scale-[0.98]">
              <GoogleIcon /> {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
            </button>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-500">{mode === 'login' ? "Don't have an account? " : "Already have an account? "}</span>
              <button onClick={toggleMode} className="font-bold text-green-500 hover:text-green-400 hover:underline transition-all">
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </>
        ) : step === 2 ? (
          /* --- STEP 2: OTP VERIFICATION --- */
          <div className="animate-in slide-in-from-right-4 fade-in">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white mb-6 transition-colors"><ChevronLeft size={16} /> Back</button>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
              <p className="text-sm text-gray-400">Code sent to <span className="font-bold text-white">+91 {phone}</span></p>
            </div>
            <form onSubmit={handleVerifyOTP} className="space-y-8">
              <div className="flex justify-between gap-3">
                {otp.map((digit, index) => (
                  <input key={index} ref={otpRefs[index]} type="text" maxLength="1" value={digit} onChange={(e) => handleOTPChange(index, e.target.value)} onKeyDown={(e) => handleOTPKeyDown(index, e)} className="w-16 h-16 text-center text-2xl font-extrabold text-white bg-black/30 border border-white/10 rounded-2xl outline-none focus:bg-black/50 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                ))}
              </div>
              <div className="space-y-4">
                <button type="submit" disabled={loading || otp.join('').length !== 4} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all active:scale-[0.98]">
                  {mode === 'signup' ? 'Verify' : 'Verify & Login'} <CheckCircle2 size={20} />
                </button>
                <div className="text-center"><button type="button" className="text-sm font-bold text-gray-400 hover:text-green-500 transition-colors">Resend Code</button></div>
              </div>
            </form>
          </div>
        ) : (
          /* --- STEP 3: OPTIONAL SETUP --- */
          <div className="animate-in slide-in-from-right-4 fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Final Step!</h2>
              <p className="text-sm text-gray-400">Set up your billing and payments. You can also do this later from Settings.</p>
            </div>

            <form onSubmit={handleCompleteProfile} className="space-y-5">
              <div>
                <FormLabel text="GSTIN / Tax ID" />
                <div className="relative">
                  <input type="text" placeholder="Optional" value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                  <FileText className="absolute left-3.5 top-4 text-gray-500" size={18} />
                </div>
              </div>
              <div>
                <FormLabel text="UPI ID (For QR Code Generation)" />
                <div className="relative">
                  <input type="text" placeholder="storename@upi" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all" />
                  <QrCode className="absolute left-3.5 top-4 text-gray-500" size={18} />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => navigate('/Dashboard')} className="flex-1 py-4 bg-transparent border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all">
                  Skip for now
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all">
                  Save & Start <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <p className="relative z-10 mt-12 text-sm text-gray-600 font-medium">© 2026 S-BMS Point of Sale</p>
    </div>
  );
};

export default Login;