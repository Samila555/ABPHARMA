import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiSend, FiArrowLeft } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MedCross = ({ size = 20, color = '#0ea5e9', opacity = 0.12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={opacity}>
        <rect x="9" y="2" width="6" height="20" rx="2" />
        <rect x="2" y="9" width="20" height="6" rx="2" />
    </svg>
);

const Pill = ({ w = 28, h = 12, opacity = 0.1 }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} opacity={opacity}>
        <rect x="0" y="0" width={w} height={h} rx={h / 2} fill="#0ea5e9" />
        <rect x={w / 2} y="0" width={w / 2} height={h} rx={`0 ${h / 2} ${h / 2} 0`} fill="#059669" />
    </svg>
);

const FLOATING_DECOR = [
    { type: 'cross', x: 4, y: 10, size: 22, delay: 0, dur: 5 },
    { type: 'cross', x: 92, y: 6, size: 18, delay: 1.2, dur: 6 },
    { type: 'cross', x: 2, y: 82, size: 16, delay: 2, dur: 4.5 },
    { type: 'cross', x: 96, y: 78, size: 26, delay: 0.5, dur: 7 },
    { type: 'cross', x: 50, y: 3, size: 14, delay: 1.8, dur: 5.5 },
    { type: 'cross', x: 12, y: 52, size: 12, delay: 3, dur: 6 },
    { type: 'cross', x: 85, y: 45, size: 20, delay: 0.8, dur: 5 },
    { type: 'pill', x: 8, y: 22, delay: 0.3, dur: 5 },
    { type: 'pill', x: 80, y: 20, delay: 1.5, dur: 6.5 },
    { type: 'pill', x: 16, y: 90, delay: 2.5, dur: 4 },
    { type: 'pill', x: 88, y: 92, delay: 0.9, dur: 5.5 },
    { type: 'pill', x: 55, y: 95, delay: 1.1, dur: 7 },
    { type: 'dot', x: 30, y: 5, size: 8, delay: 0.6, dur: 4 },
    { type: 'dot', x: 70, y: 10, size: 6, delay: 1.4, dur: 5 },
    { type: 'dot', x: 5, y: 60, size: 10, delay: 2.2, dur: 6 },
    { type: 'dot', x: 96, y: 55, size: 7, delay: 0.4, dur: 4.5 },
    { type: 'dot', x: 40, y: 97, size: 9, delay: 1.7, dur: 5.5 },
    { type: 'ring', x: 10, y: 35, size: 40, delay: 1, dur: 8 },
    { type: 'ring', x: 82, y: 65, size: 50, delay: 2, dur: 10 },
    { type: 'ring', x: 50, y: 90, size: 32, delay: 0.5, dur: 7 },
];

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Message sent! We will get back to you shortly.');
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="relative min-h-screen pt-40 pb-32 overflow-hidden bg-slate-50">
            {/* ETB ETB ETB  Background Gradient Blobs ETB ETB ETB  */}
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[-8%] right-[-5%] w-[45rem] h-[45rem] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-[-12%] left-[-8%] w-[40rem] h-[40rem] bg-sky-200/50 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                className="absolute top-[40%] left-[30%] w-[30rem] h-[30rem] bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
            />

            {/* ETB ETB ETB  Floating Medical Decors ETB ETB ETB  */}
            {FLOATING_DECOR.map((d, i) => (
                <motion.div
                    key={i}
                    style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, pointerEvents: 'none', zIndex: 1 }}
                    animate={{ y: [0, -14, 0], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {d.type === 'cross' && <MedCross size={d.size} opacity={0.12} />}
                    {d.type === 'pill' && <Pill opacity={0.1} />}
                    {d.type === 'dot' && (
                        <div style={{
                            width: d.size, height: d.size, borderRadius: '50%',
                            background: i % 2 === 0 ? 'rgba(14,165,233,0.18)' : 'rgba(5,150,105,0.18)',
                            boxShadow: i % 2 === 0 ? '0 0 12px rgba(14,165,233,0.2)' : '0 0 12px rgba(5,150,105,0.2)',
                        }} />
                    )}
                    {d.type === 'ring' && (
                        <motion.div
                            style={{ width: d.size, height: d.size, borderRadius: '50%', border: '1.5px solid rgba(14,165,233,0.1)' }}
                            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                            transition={{ duration: d.dur, repeat: Infinity, ease: 'linear' }}
                        />
                    )}
                </motion.div>
            ))}

            {/* ETB ETB ETB  Corner Accent Lines ETB ETB ETB  */}
            {[
                { top: 20, left: 20, rot: 0 },
                { top: 20, right: 20, rot: 90 },
                { bottom: 20, right: 20, rot: 180 },
                { bottom: 20, left: 20, rot: 270 },
            ].map((c, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute', top: c.top, left: c.left, right: c.right, bottom: c.bottom,
                        width: 48, height: 48, transform: `rotate(${c.rot}deg)`, pointerEvents: 'none', zIndex: 1,
                    }}
                    animate={{ opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2.5px', background: 'linear-gradient(to right, #0ea5e9, transparent)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '2.5px', height: '100%', background: 'linear-gradient(to bottom, #0ea5e9, transparent)', borderRadius: 2 }} />
                </motion.div>
            ))}

            {/* ETB ETB ETB  ECG / Heartbeat Strip ETB ETB ETB  */}
            <div style={{ position: 'absolute', top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
                <motion.svg width="360" height="44" viewBox="0 0 360 44" fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <motion.path
                        d="M0,22 L90,22 L98,4 L106,40 L114,7 L122,38 L130,22 L360,22"
                        stroke="url(#contactEcgGrad)" strokeWidth="1.2" fill="none" strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
                    />
                    <defs>
                        <linearGradient id="contactEcgGrad" x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
                            <stop offset="25%" stopColor="#0ea5e9" stopOpacity="0.35" />
                            <stop offset="55%" stopColor="#059669" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </motion.svg>
            </div>

            {/* ETB ETB ETB  Bottom Medical Stripe ETB ETB ETB  */}
            <motion.div
                style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
                    background: 'linear-gradient(to right, #0ea5e9, #059669, #0ea5e9)',
                    backgroundSize: '200% 100%', pointerEvents: 'none', zIndex: 1,
                }}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10 container mx-auto px-6 max-w-7xl">
                {/* Back to Home Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 left-6 z-50 hidden md:block"
                >
                    <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full text-slate-600 font-bold shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:text-indigo-600 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgb(79,70,229,0.15)] hover:-translate-x-1 transition-all duration-300">
                        <FiArrowLeft size={18} /> Back to Home
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 md:hidden"
                >
                    <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full text-slate-600 font-bold shadow-sm hover:text-indigo-600 transition-all duration-300">
                        <FiArrowLeft size={18} /> Back to Home
                    </Link>
                </motion.div>

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 border border-indigo-100 shadow-sm mb-6"
                    >
                        <motion.span
                            animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.4, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-indigo-500"
                        />
                        <span className="text-indigo-700 font-bold tracking-widest uppercase text-sm">Always Online</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 leading-tight tracking-tight">
                        We're Here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Help You</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium">
                        Have questions about your medication, our premium services, or an order?
                        Send us a message below or visit our state-of-the-art physical pharmacy.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 container max-w-6xl mx-auto">
                    {/* Contact Information Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <motion.div
                            whileHover={{ y: -4, boxShadow: '0 30px 60px rgba(79,70,229,0.35)' }}
                            className="bg-gradient-to-br from-sky-600 via-indigo-600 to-indigo-800 rounded-3xl p-10 text-white shadow-[0_20px_40px_rgba(79,70,229,0.25)] relative overflow-hidden h-full flex flex-col justify-between"
                        >
                            {/* Card Decoration */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -top-20 -right-20 w-56 h-56 bg-white/10 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute -bottom-20 -left-20 w-40 h-40 bg-sky-300/20 rounded-full blur-2xl"
                            />

                            {/* Floating mini crosses inside the card */}
                            <motion.div style={{ position: 'absolute', top: '15%', right: '12%', pointerEvents: 'none', opacity: 0.15 }}
                                animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <MedCross size={16} color="white" opacity={1} />
                            </motion.div>
                            <motion.div style={{ position: 'absolute', bottom: '25%', right: '8%', pointerEvents: 'none', opacity: 0.1 }}
                                animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                            >
                                <MedCross size={12} color="white" opacity={1} />
                            </motion.div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-extrabold mb-10">Contact Information</h3>
                                <div className="space-y-10">
                                    {[
                                        { Icon: FiMapPin, title: 'Our Location', text: '123 Health Avenue,\nMedical District, City Center' },
                                        { Icon: FiPhone, title: 'Phone Number', text: '+234 800 000 0000\nSupport: 24/7', highlight: true },
                                        { Icon: FiMail, title: 'Email Address', text: 'support@abpharma.com\ninfo@abpharma.com' },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.15 }}
                                            className="flex items-start gap-5 group"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                                                className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-lg"
                                            >
                                                <item.Icon size={24} />
                                            </motion.div>
                                            <div>
                                                <h4 className="text-lg font-bold mb-1 text-white">{item.title}</h4>
                                                <p className="text-sky-100/90 leading-relaxed whitespace-pre-line">
                                                    {item.highlight ? (
                                                        <>{'support@abpharma.com\n'}<span className="text-sky-300 font-semibold">Support: 24/7</span></>
                                                    ) : item.text}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Telegram Card */}
                        <motion.a
                            href="https://t.me/abelzf"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            whileHover={{ y: -4, boxShadow: '0 30px 60px rgba(0,136,204,0.35)' }}
                            className="flex items-center gap-5 bg-gradient-to-r from-[#0088cc] to-[#229ed9] rounded-3xl p-7 text-white shadow-[0_10px_30px_rgba(0,136,204,0.25)] cursor-pointer relative overflow-hidden"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-8 -right-8 w-28 h-28 bg-white rounded-full"
                            />
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.4 }}
                                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                            >
                                <FaTelegramPlane size={32} />
                            </motion.div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-widest text-blue-100 mb-1">Instant Consultation</p>
                                <h3 className="text-xl font-extrabold leading-snug">Ask the Pharmacist</h3>
                                <p className="text-blue-100 text-sm mt-1">Send us a photo of your prescription or medication. We'll reply instantly!</p>
                            </div>
                        </motion.a>
                    </motion.div>

                    {/* Contact Form Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="lg:col-span-2"
                    >
                        <motion.div
                            whileHover={{ boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}
                            className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-10 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full relative overflow-hidden"
                        >
                            {/* Subtle inner decor */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-100/40 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none" />

                            <h2 className="text-3xl font-extrabold text-slate-800 mb-8 relative">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-8 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-sm font-bold text-slate-700 ml-1">Your Name</label>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-700 font-medium placeholder-slate-400 shadow-sm"
                                            placeholder="John Doe" required />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-700 font-medium placeholder-slate-400 shadow-sm"
                                            placeholder="john@example.com" required />
                                    </motion.div>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                                    <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-700 font-medium placeholder-slate-400 shadow-sm"
                                        placeholder="How can we help you?" required />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                                    <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-700 font-medium placeholder-slate-400 shadow-sm resize-none"
                                        placeholder="Write your message here..." required />
                                </motion.div>
                                <motion.button
                                    type="submit"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                    whileHover={{ scale: 1.02, y: -2, boxShadow: '0 20px 40px rgba(3,105,161,0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-lg py-4 px-10 rounded-2xl shadow-[0_10px_20px_rgba(3,105,161,0.2)] transition-all duration-300 md:w-auto w-full relative overflow-hidden"
                                >
                                    <motion.div
                                        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.2) 50%,transparent 65%)' }}
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                                    />
                                    <FiSend size={20} style={{ position: 'relative', zIndex: 1 }} />
                                    <span style={{ position: 'relative', zIndex: 1 }}>Send Message</span>
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
