import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiHome, FiGrid, FiHeart, FiShield, FiPackage } from 'react-icons/fi';

/* ETB ETB  Medical cross SVG icon ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
const MedCross = ({ size = 20, color = '#0ea5e9', opacity = 0.18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={opacity}>
        <rect x="9" y="2" width="6" height="20" rx="2" />
        <rect x="2" y="9" width="20" height="6" rx="2" />
    </svg>
);

/* ETB ETB  Small pill shape ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
const Pill = ({ w = 36, h = 14, color = '#0ea5e9', opacity = 0.13 }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} opacity={opacity}>
        <rect x="0" y="0" width={w} height={h} rx={h / 2} fill={color} />
        <rect x={w / 2} y="0" width={w / 2} height={h} rx={`0 ${h / 2} ${h / 2} 0`} fill="#059669" />
    </svg>
);

/* ETB ETB  Heartbeat path data ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
const ECG_PATH = "M0,30 L30,30 L38,10 L46,50 L54,12 L62,48 L70,30 L200,30";

/* ETB ETB  Floating medical decor items ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
const DECOR = [
    { type: 'cross', x: 6, y: 8, size: 28, delay: 0, dur: 5 },
    { type: 'cross', x: 88, y: 5, size: 22, delay: 1.2, dur: 6 },
    { type: 'cross', x: 3, y: 72, size: 18, delay: 2, dur: 4.5 },
    { type: 'cross', x: 92, y: 75, size: 32, delay: 0.5, dur: 7 },
    { type: 'cross', x: 50, y: 2, size: 16, delay: 1.8, dur: 5.5 },
    { type: 'cross', x: 15, y: 45, size: 14, delay: 3, dur: 6 },
    { type: 'cross', x: 80, y: 40, size: 20, delay: 0.8, dur: 5 },
    { type: 'pill', x: 10, y: 20, delay: 0.3, dur: 5 },
    { type: 'pill', x: 75, y: 18, delay: 1.5, dur: 6.5 },
    { type: 'pill', x: 20, y: 85, delay: 2.5, dur: 4 },
    { type: 'pill', x: 82, y: 88, delay: 0.9, dur: 5.5 },
    { type: 'pill', x: 55, y: 92, delay: 1.1, dur: 7 },
    { type: 'dot', x: 35, y: 6, size: 8, delay: 0.6, dur: 4 },
    { type: 'dot', x: 65, y: 8, size: 6, delay: 1.4, dur: 5 },
    { type: 'dot', x: 8, y: 55, size: 10, delay: 2.2, dur: 6 },
    { type: 'dot', x: 94, y: 52, size: 7, delay: 0.4, dur: 4.5 },
    { type: 'dot', x: 45, y: 95, size: 9, delay: 1.7, dur: 5.5 },
    { type: 'ring', x: 12, y: 30, size: 40, delay: 1, dur: 8 },
    { type: 'ring', x: 78, y: 60, size: 55, delay: 2, dur: 10 },
    { type: 'ring', x: 45, y: 88, size: 35, delay: 0.5, dur: 7 },
];

export default function SplashScreen({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);
    const [clicked, setClicked] = useState(false);
    const [hoveredBtn, setHoveredBtn] = useState(null);

    const handleEnter = () => {
        if (clicked) return;
        setClicked(true);
        setIsVisible(false);
        setTimeout(onComplete, 900);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.9, ease: 'easeInOut' } }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                        background: 'linear-gradient(160deg, #ffffff 0%, #f0f9ff 35%, #ecfdf5 65%, #f0f9ff 100%)',
                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                    }}
                >
                    {/* ETB ETB  Soft background gradient blobs ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    <div style={{
                        position: 'absolute', top: '-10%', left: '-8%',
                        width: 500, height: 500, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '-12%', right: '-10%',
                        width: 600, height: 600, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <motion.div
                        style={{
                            position: 'absolute', top: '30%', right: '15%',
                            width: 300, height: 300, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* ETB ETB  Floating medical decorations ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    {DECOR.map((d, i) => (
                        <motion.div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${d.x}%`, top: `${d.y}%`,
                                pointerEvents: 'none',
                            }}
                            animate={{ y: [0, -16, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            {d.type === 'cross' && <MedCross size={d.size} color="#0ea5e9" opacity={0.15} />}
                            {d.type === 'pill' && <Pill opacity={0.15} />}
                            {d.type === 'dot' && (
                                <div style={{
                                    width: d.size, height: d.size, borderRadius: '50%',
                                    background: i % 2 === 0 ? 'rgba(14,165,233,0.2)' : 'rgba(5,150,105,0.2)',
                                    boxShadow: i % 2 === 0 ? '0 0 12px rgba(14,165,233,0.3)' : '0 0 12px rgba(5,150,105,0.3)',
                                }} />
                            )}
                            {d.type === 'ring' && (
                                <motion.div
                                    style={{
                                        width: d.size, height: d.size, borderRadius: '50%',
                                        border: '1.5px solid rgba(14,165,233,0.12)',
                                    }}
                                    animate={{ rotate: 360, scale: [1, 1.06, 1] }}
                                    transition={{ duration: d.dur, repeat: Infinity, ease: 'linear' }}
                                />
                            )}
                        </motion.div>
                    ))}

                    {/* ETB ETB  ECG / heartbeat strip (top) ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    <div style={{
                        position: 'absolute', top: 24, left: 0, right: 0,
                        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
                    }}>
                        <motion.svg width="400" height="50" viewBox="0 0 400 50" fill="none"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                            <motion.path
                                d={`M0,25 L100,25 L108,5 L116,45 L124,8 L132,42 L140,25 L400,25`}
                                stroke="url(#ecgGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5 }}
                            />
                            <defs>
                                <linearGradient id="ecgGrad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
                                    <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.4" />
                                    <stop offset="60%" stopColor="#059669" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </motion.svg>
                    </div>

                    {/* ETB ETB  Corner accent lines ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    {[
                        { top: 16, left: 16, rot: 0 },
                        { top: 16, right: 16, rot: 90 },
                        { bottom: 16, right: 16, rot: 180 },
                        { bottom: 16, left: 16, rot: 270 },
                    ].map((c, i) => (
                        <motion.div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: c.top, left: c.left, right: c.right, bottom: c.bottom,
                                width: 44, height: 44,
                                transform: `rotate(${c.rot}deg)`,
                                pointerEvents: 'none',
                            }}
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 3, delay: i * 0.6, repeat: Infinity }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2.5px', background: 'linear-gradient(to right, #0ea5e9, transparent)', borderRadius: 2 }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '2.5px', height: '100%', background: 'linear-gradient(to bottom, #0ea5e9, transparent)', borderRadius: 2 }} />
                        </motion.div>
                    ))}

                    {/* ETB ETB  Horizontal medical stripe accent ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    <motion.div
                        style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 5,
                            background: 'linear-gradient(to right, #0ea5e9, #059669, #0ea5e9)',
                            backgroundSize: '200% 100%',
                        }}
                        animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* ETB ETB ETB ETB  MAIN CONTENT CARD ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        style={{
                            position: 'relative', zIndex: 20,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            padding: '40px 40px 32px',
                            background: 'rgba(255,255,255,0.75)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 32,
                            border: '1.5px solid rgba(14,165,233,0.15)',
                            boxShadow: '0 8px 60px rgba(14,165,233,0.1), 0 2px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                            maxWidth: 600, width: '90%',
                        }}
                    >
                        {/* Red-cross top badge on card */}
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
                            style={{
                                position: 'absolute', top: -18,
                                background: 'linear-gradient(135deg, #0ea5e9, #059669)',
                                borderRadius: 999, padding: '6px 20px',
                                fontSize: 10, fontWeight: 800, color: 'white',
                                letterSpacing: '0.2em', textTransform: 'uppercase',
                                boxShadow: '0 4px 20px rgba(14,165,233,0.4)',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            <motion.div
                                style={{ width: 7, height: 7, background: '#4ade80', borderRadius: '50%' }}
                                animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.4, repeat: Infinity }}
                            />
                            Smart Pharmacy Management
                        </motion.div>

                        {/* Logo + Orbital Ring System */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.9, type: 'spring', bounce: 0.4 }}
                            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 290, height: 290 }}
                        >
                            {/* Outer dashed ring */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute', width: 280, height: 280,
                                    borderRadius: '50%',
                                    border: '1px dashed rgba(14,165,233,0.2)',
                                }}
                            />
                            {/* Mid ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute', width: 232, height: 232,
                                    borderRadius: '50%',
                                    border: '1.5px dashed rgba(5,150,105,0.18)',
                                }}
                            />
                            {/* Inner ring */}
                            <motion.div
                                animate={{ rotate: -360, scale: [1, 1.03, 1] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute', width: 196, height: 196,
                                    borderRadius: '50%',
                                    border: '1.5px solid rgba(14,165,233,0.25)',
                                    boxShadow: '0 0 20px rgba(14,165,233,0.08)',
                                }}
                            />

                            {/* Blue orbiting dot */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                style={{ position: 'absolute', width: 232, height: 232, borderRadius: '50%' }}
                            >
                                <div style={{
                                    position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
                                    width: 12, height: 12, borderRadius: '50%',
                                    background: '#0ea5e9', boxShadow: '0 0 14px 5px rgba(14,165,233,0.5)',
                                }} />
                            </motion.div>

                            {/* Green orbiting dot */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                style={{ position: 'absolute', width: 196, height: 196, borderRadius: '50%' }}
                            >
                                <div style={{
                                    position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
                                    width: 10, height: 10, borderRadius: '50%',
                                    background: '#059669', boxShadow: '0 0 12px 4px rgba(5,150,105,0.5)',
                                }} />
                            </motion.div>

                            {/* Outer teal orbiting dot */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%' }}
                            >
                                <div style={{
                                    position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: '#34d399', boxShadow: '0 0 10px 3px rgba(52,211,153,0.5)',
                                }} />
                            </motion.div>

                            {/* Pulsing glow */}
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.35, 0.15] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    position: 'absolute', width: 160, height: 160, borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, rgba(5,150,105,0.12) 50%, transparent 70%)',
                                    pointerEvents: 'none',
                                }}
                            />

                            {/* ETB ETB  Logo Circle ETB ETB  */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, type: 'spring', bounce: 0.45, delay: 0.3 }}
                                style={{
                                    position: 'relative', zIndex: 10,
                                    width: 158, height: 158, borderRadius: '50%',
                                    background: 'white',
                                    boxShadow: '0 0 0 4px rgba(14,165,233,0.12), 0 0 0 10px rgba(14,165,233,0.05), 0 20px 60px rgba(14,165,233,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 0, overflow: 'hidden',
                                }}
                            >
                                <img
                                    src="/logo.png"
                                    alt="AB Pharma"
                                    style={{
                                        width: '100%', height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        display: 'block',
                                    }}
                                    onError={e => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML =
                                            '<div style="text-align:center;padding:12px"><span style="font-size:34px;font-weight:900;background:linear-gradient(135deg,#0369a1,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent">AB</span><div style="font-size:11px;font-weight:700;color:#059669;letter-spacing:3px;margin-top:2px">PHARMA</div></div>';
                                    }}
                                />
                                {/* Shimmer overlay */}
                                <motion.div
                                    style={{
                                        position: 'absolute', inset: 0, borderRadius: '50%',
                                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
                                        pointerEvents: 'none',
                                    }}
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* ETB ETB  Brand Text ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.7 }}
                            style={{ textAlign: 'center', marginTop: 20 }}
                        >
                            {/* Title */}
                            <motion.h1
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                                style={{ fontSize: 'clamp(1.8rem,4.5vw,3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 8, margin: '0 0 8px' }}
                            >
                                <span style={{ color: '#1e293b' }}>Welcome to </span>
                                <span style={{
                                    background: 'linear-gradient(90deg, #0ea5e9, #059669)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                }}>AB Pharma</span>
                            </motion.h1>

                            {/* Tagline */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                                style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}
                            >
                                <p style={{ color: '#64748b', letterSpacing: '0.25em', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>
                                    Your Health, Our Priority
                                </p>
                                <motion.div
                                    initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 1.5, duration: 0.8 }}
                                    style={{ position: 'absolute', bottom: -3, left: 0, height: 1.5, background: 'linear-gradient(to right, transparent, #0ea5e9, #059669, transparent)', borderRadius: 2 }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* ETB ETB  Stats Row ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
                            style={{
                                display: 'flex', alignItems: 'stretch', gap: 0,
                                marginBottom: 28, borderRadius: 16, overflow: 'hidden',
                                border: '1px solid rgba(14,165,233,0.12)',
                                background: 'rgba(255,255,255,0.8)',
                                boxShadow: '0 2px 16px rgba(14,165,233,0.08)',
                            }}
                        >
                            {[
                                { val: '500+', label: 'Medicines', icon: <FiPackage size={14} />, color: '#0ea5e9' },
                                { val: '24/7', label: 'Support', icon: <FiHeart size={14} />, color: '#059669' },
                                { val: '100%', label: 'Genuine', icon: <FiShield size={14} />, color: '#0284c7' },
                            ].map(({ val, label, icon, color }, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ background: 'rgba(14,165,233,0.04)' }}
                                    style={{
                                        flex: 1, textAlign: 'center', padding: '14px 20px',
                                        borderRight: i < 2 ? '1px solid rgba(14,165,233,0.1)' : 'none',
                                        cursor: 'default',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, color }}>{icon}</div>
                                    <div style={{
                                        fontSize: 17, fontWeight: 900, color,
                                        marginBottom: 2,
                                    }}>{val}</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* ETB ETB  Buttons ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6, duration: 0.6, type: 'spring' }}
                            style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}
                        >
                            {/* Primary ETB  Go to Home */}
                            <motion.button
                                whileHover={{ scale: 1.04, y: -2, boxShadow: '0 16px 48px rgba(14,165,233,0.35)' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleEnter} disabled={clicked}
                                onMouseEnter={() => setHoveredBtn('home')}
                                onMouseLeave={() => setHoveredBtn(null)}
                                style={{
                                    position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '14px 30px', borderRadius: 14, fontWeight: 700, fontSize: 14,
                                    cursor: 'pointer', border: 'none', overflow: 'hidden',
                                    background: 'linear-gradient(135deg, #0ea5e9, #059669)',
                                    color: 'white', flex: 1, minWidth: 170, justifyContent: 'center',
                                    boxShadow: '0 8px 32px rgba(14,165,233,0.3)',
                                    transition: 'box-shadow 0.2s',
                                }}
                            >
                                <motion.div
                                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.22) 50%,transparent 65%)' }}
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                                />
                                <FiHome size={15} style={{ position: 'relative', zIndex: 1, flexShrink: 0 }} />
                                <span style={{ position: 'relative', zIndex: 1, letterSpacing: '0.04em' }}>Go to Home Page</span>
                                <motion.span style={{ position: 'relative', zIndex: 1 }} animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                                    <FiArrowRight size={15} />
                                </motion.span>
                            </motion.button>

                            {/* Secondary ETB  Dashboard */}
                            <motion.button
                                whileHover={{ scale: 1.04, y: -2, boxShadow: '0 12px 36px rgba(14,165,233,0.18)', background: 'rgba(14,165,233,0.06)' }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => window.location.href = '/admin/dashboard'}
                                onMouseEnter={() => setHoveredBtn('dash')}
                                onMouseLeave={() => setHoveredBtn(null)}
                                style={{
                                    position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '14px 30px', borderRadius: 14, fontWeight: 700, fontSize: 14,
                                    cursor: 'pointer', overflow: 'hidden',
                                    background: 'white',
                                    border: '1.5px solid rgba(14,165,233,0.25)',
                                    color: '#0369a1', flex: 1, minWidth: 170, justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(14,165,233,0.1)',
                                    transition: 'background 0.2s, box-shadow 0.2s',
                                }}
                            >
                                <FiGrid size={15} style={{ flexShrink: 0, color: '#059669' }} />
                                <span style={{ letterSpacing: '0.04em' }}>Go to Dashboard</span>
                            </motion.button>
                        </motion.div>

                        {/* Footer */}
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}
                            style={{ marginTop: 24, marginBottom: 0, color: '#cbd5e1', fontSize: 10, letterSpacing: '0.15em', fontWeight: 500, textTransform: 'uppercase' }}
                        >
                            �� 2026 AB Pharma �� All Rights Reserved
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
