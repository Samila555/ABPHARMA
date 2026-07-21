import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiShield, FiCheck } from 'react-icons/fi';
import { MdLocalPharmacy } from 'react-icons/md';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');
    const [mounted, setMounted] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error('Please fill all fields.');
        setLoading(true);
        try {
            const data = await login(form.email, form.password, form.remember);
            toast.success('Welcome back!');
            if (data.user?.role === 'cashier') navigate('/admin/pos');
            else navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
            background: 'linear-gradient(140deg, #0f172a 0%, #1e3a5f 45%, #0e4d6e 75%, #134e4a 100%)',
            position: 'relative', overflow: 'hidden', padding: '24px',
        }}>
            {/* Animated radial glows */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', width: 600, height: 600, top: '-15%', left: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)', animation: 'glow 8s ease-in-out infinite alternate' }} />
                <div style={{ position: 'absolute', width: 500, height: 500, bottom: '-15%', right: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)', animation: 'glow 10s ease-in-out 2s infinite alternate' }} />
                <div style={{ position: 'absolute', width: 400, height: 400, top: '40%', left: '50%', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', animation: 'glow 12s ease-in-out 4s infinite alternate' }} />
            </div>

            {/* Grid overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0, pointerEvents: 'none' }} />

            {/* Back to Home button */}
            <Link to="/" style={{
                position: 'absolute', top: 24, left: 28, zIndex: 20,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'rgba(186,230,253,0.85)', textDecoration: 'none',
                fontSize: 13, fontWeight: 700,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '8px 16px', borderRadius: 999,
                transition: 'all 0.2s',
            }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(186,230,253,0.85)'; }}
            >
                <FiArrowLeft size={15} />
                Back to Home
            </Link>

            {/* Floating crosses */}
            {[
                { top: '8%', left: '5%', size: 18, delay: 0 },
                { top: '70%', left: '3%', size: 12, delay: 1.5 },
                { top: '15%', right: '6%', size: 16, delay: 0.8 },
                { top: '80%', right: '4%', size: 10, delay: 2.5 },
                { top: '45%', left: '8%', size: 8, delay: 3 },
                { top: '30%', right: '10%', size: 14, delay: 1.2 },
                { top: '55%', right: '7%', size: 9, delay: 2.1 },
            ].map((d, i) => (
                <div key={i} style={{
                    position: 'absolute', top: d.top, left: d.left, right: d.right,
                    opacity: 0.12, zIndex: 1, pointerEvents: 'none',
                    animation: `float-cross ${8 + i}s ease-in-out ${d.delay}s infinite alternate`,
                }}>
                    <svg width={d.size} height={d.size} viewBox="0 0 24 24" fill="white">
                        <rect x="9" y="2" width="6" height="20" rx="3" />
                        <rect x="2" y="9" width="20" height="6" rx="3" />
                    </svg>
                </div>
            ))}

            {/* ETB ETB  LOGIN CARD ETB ETB  */}
            <div style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: 440,
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
                transition: 'all 0.65s cubic-bezier(0.22,1,0.36,1)',
            }}>

                {/* Logo above card */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 68, height: 68, borderRadius: 20,
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        boxShadow: '0 16px 40px rgba(14,165,233,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
                        marginBottom: 16, position: 'relative',
                    }}>
                        <MdLocalPharmacy size={36} color="white" />
                        {/* Glow ring */}
                        <div style={{ position: 'absolute', inset: -3, borderRadius: 24, border: '1.5px solid rgba(14,165,233,0.3)', animation: 'ring-pulse 3s ease-in-out infinite' }} />
                    </div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 4 }}>
                        AB Pharma
                    </div>
                    <div style={{ color: 'rgba(148,204,232,0.7)', fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Admin Portal
                    </div>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.97)',
                    borderRadius: 24,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                }}>
                    {/* Top accent */}
                    <div style={{ height: 4, background: 'linear-gradient(90deg, #0ea5e9, #6366f1, #8b5cf6, #06b6d4)', backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite' }} />

                    <div style={{ padding: '36px 40px 40px' }}>

                        {/* Card header */}
                        <div style={{ marginBottom: 30 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: '#eff6ff', border: '1px solid #bfdbfe',
                                borderRadius: 999, padding: '5px 14px', marginBottom: 18,
                            }}>
                                <FiShield size={13} color="#2563eb" />
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Secure Admin Access</span>
                            </div>
                            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 8px' }}>
                                Sign in to Dashboard
                            </h2>
                            <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                                Enter your admin credentials to access the pharmacy management system.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Email field */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: focused === 'email' ? '#6366f1' : '#9ca3af', transition: 'color 0.2s', zIndex: 1,
                                    }} size={17} />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused('')}
                                        placeholder="admin@abpharma.com"
                                        required
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '13px 16px 13px 44px', borderRadius: 12,
                                            fontSize: 14, fontWeight: 500, color: '#111827',
                                            background: focused === 'email' ? '#fafbff' : '#f9fafb',
                                            border: `2px solid ${focused === 'email' ? '#6366f1' : '#e5e7eb'}`,
                                            outline: 'none', transition: 'all 0.2s',
                                            boxShadow: focused === 'email' ? '0 0 0 4px rgba(99,102,241,0.08)' : 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                                    <button type="button" style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#4f46e5'}
                                        onMouseLeave={e => e.target.style.color = '#6366f1'}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: focused === 'password' ? '#6366f1' : '#9ca3af', transition: 'color 0.2s', zIndex: 1,
                                    }} size={17} />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused('')}
                                        placeholder="Enter your password"
                                        required
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '13px 48px 13px 44px', borderRadius: 12,
                                            fontSize: 14, fontWeight: 500, color: '#111827',
                                            background: focused === 'password' ? '#fafbff' : '#f9fafb',
                                            border: `2px solid ${focused === 'password' ? '#6366f1' : '#e5e7eb'}`,
                                            outline: 'none', transition: 'all 0.2s',
                                            boxShadow: focused === 'password' ? '0 0 0 4px rgba(99,102,241,0.08)' : 'none',
                                        }}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0, transition: 'color 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                                    >
                                        {showPass ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <div style={{ marginBottom: 26 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                                    onClick={() => setForm({ ...form, remember: !form.remember })}
                                >
                                    <div style={{
                                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                        background: form.remember ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'white',
                                        border: `2px solid ${form.remember ? '#6366f1' : '#d1d5db'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.18s',
                                        boxShadow: form.remember ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                                    }}>
                                        {form.remember && <FiCheck size={11} color="white" strokeWidth={3} />}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', userSelect: 'none' }}>
                                        Keep me signed in for 7 days
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    background: loading
                                        ? 'linear-gradient(135deg, #a5b4fc, #818cf8)'
                                        : 'linear-gradient(135deg, #4f46e5, #6366f1, #818cf8)',
                                    color: 'white', fontWeight: 800, fontSize: 15,
                                    letterSpacing: '-0.01em',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.4)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(99,102,241,0.5)'; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In to Dashboard
                                        <FiArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'rgba(148,163,184,0.7)', fontWeight: 500 }}>
                    �� 2024 AB Pharma �� Secure Connection ETB �
                </p>
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes glow {
                    from { transform: scale(1) translate(0, 0); opacity: 0.8; }
                    to   { transform: scale(1.15) translate(20px, -20px); opacity: 1; }
                }
                @keyframes float-cross {
                    from { transform: translateY(0px) rotate(0deg); opacity: 0.12; }
                    to   { transform: translateY(-28px) rotate(12deg); opacity: 0.2; }
                }
                @keyframes shimmer {
                    0%   { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes ring-pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50%       { opacity: 0.8; transform: scale(1.06); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
