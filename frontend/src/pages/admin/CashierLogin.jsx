import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiShoppingCart, FiUserCheck } from 'react-icons/fi';
import { MdOutlinePointOfSale } from 'react-icons/md';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function CashierLogin() {
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
            if (data.user?.role === 'cashier' || data.user?.role === 'admin') {
                toast.success('Welcome to POS System!');
                navigate('/admin/pos');
            } else {
                toast.error('Access Denied. You do not have POS access.');
                // Handle unauthorized but authenticated user
                navigate('/admin/dashboard');
            }
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
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative', overflow: 'hidden', padding: '24px',
        }}>
            {/* Background design */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', width: '100%', height: '50vh', top: 0, left: 0, background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0% 100%)' }} />
                {/* Floating circles on the dark part */}
                <div style={{ position: 'absolute', width: 400, height: 400, top: '-10%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', animation: 'glow 8s ease-in-out infinite alternate' }} />
                <div style={{ position: 'absolute', width: 300, height: 300, top: '20%', left: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', animation: 'glow 10s ease-in-out 2s infinite alternate' }} />
            </div>

            {/* Back to Home button */}
            <Link to="/" style={{
                position: 'absolute', top: 24, left: 28, zIndex: 20,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'white', textDecoration: 'none',
                fontSize: 13, fontWeight: 700,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '8px 16px', borderRadius: 999,
                transition: 'all 0.2s',
            }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
                <FiArrowLeft size={15} />
                Back to Home
            </Link>

            {/* LOGIN CARD */}
            <div style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: 440,
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(32px)',
                transition: 'all 0.65s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: 24,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                }}>
                    {/* Header area of card */}
                    <div style={{ padding: '40px 40px 0', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 68, height: 68, borderRadius: 20,
                            background: '#eff6ff', color: '#0ea5e9',
                            marginBottom: 20,
                            boxShadow: 'inset 0 0 0 1px rgba(14,165,233,0.2)',
                        }}>
                            <MdOutlinePointOfSale size={34} />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 8px' }}>
                            POS Login
                        </h2>
                        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500, margin: 0 }}>
                            Enter your cashier ID (email) and password to open your register.
                        </p>
                    </div>

                    <div style={{ padding: '32px 40px 40px' }}>
                        <form onSubmit={handleSubmit}>
                            {/* Email field */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                    Cashier Email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiUserCheck style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: focused === 'email' ? '#0ea5e9' : '#9ca3af', transition: 'color 0.2s', zIndex: 1,
                                    }} size={17} />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused('')}
                                        placeholder="cashier@abpharma.com"
                                        required
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '13px 16px 13px 44px', borderRadius: 12,
                                            fontSize: 14, fontWeight: 500, color: '#111827',
                                            background: focused === 'email' ? '#f0f9ff' : '#f8fafc',
                                            border: `2px solid ${focused === 'email' ? '#0ea5e9' : '#e2e8f0'}`,
                                            outline: 'none', transition: 'all 0.2s',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div style={{ marginBottom: 26 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: focused === 'password' ? '#0ea5e9' : '#9ca3af', transition: 'color 0.2s', zIndex: 1,
                                    }} size={17} />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused('')}
                                        placeholder="Enter password"
                                        required
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '13px 48px 13px 44px', borderRadius: 12,
                                            fontSize: 14, fontWeight: 500, color: '#111827',
                                            background: focused === 'password' ? '#f0f9ff' : '#f8fafc',
                                            border: `2px solid ${focused === 'password' ? '#0ea5e9' : '#e2e8f0'}`,
                                            outline: 'none', transition: 'all 0.2s',
                                        }}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0,
                                    }}>
                                        {showPass ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    background: loading ? '#bae6fd' : '#0ea5e9',
                                    color: 'white', fontWeight: 800, fontSize: 16,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: loading ? 'none' : '0 8px 16px rgba(14,165,233,0.25)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#0284c7'; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#0ea5e9'; }}
                            >
                                {loading ? 'Logging in...' : (
                                    <>
                                        Open Register
                                        <FiShoppingCart size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                    AB Pharma &bull; Authorized Retail Access Only
                </p>
            </div>

            <style>{`
                @keyframes glow {
                    from { transform: scale(1) translate(0, 0); opacity: 0.8; }
                    to   { transform: scale(1.15) translate(20px, -20px); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
