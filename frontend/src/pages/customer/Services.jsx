import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShield, FiClock, FiActivity, FiTruck, FiUsers, FiArrowRight, FiArrowLeft, FiCheck, FiStar, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MedCross = ({ size = 18, color = '#0ea5e9', opacity = 0.1 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={opacity}>
        <rect x="9" y="2" width="6" height="20" rx="2" />
        <rect x="2" y="9" width="20" height="6" rx="2" />
    </svg>
);

const FLOATING_DECOR = [
    { type: 'cross', x: 3, y: 6, size: 20, delay: 0, dur: 5 },
    { type: 'cross', x: 95, y: 4, size: 16, delay: 1.2, dur: 6 },
    { type: 'cross', x: 2, y: 80, size: 14, delay: 2, dur: 4.5 },
    { type: 'cross', x: 96, y: 74, size: 22, delay: 0.5, dur: 7 },
    { type: 'cross', x: 48, y: 2, size: 12, delay: 1.8, dur: 5.5 },
    { type: 'dot', x: 28, y: 5, size: 7, delay: 0.6, dur: 4 },
    { type: 'dot', x: 72, y: 8, size: 6, delay: 1.4, dur: 5 },
    { type: 'dot', x: 5, y: 58, size: 8, delay: 2.2, dur: 6 },
    { type: 'dot', x: 94, y: 52, size: 5, delay: 0.4, dur: 4.5 },
    { type: 'dot', x: 42, y: 96, size: 7, delay: 1.7, dur: 5.5 },
    { type: 'ring', x: 8, y: 32, size: 35, delay: 1, dur: 8 },
    { type: 'ring', x: 85, y: 60, size: 45, delay: 2, dur: 10 },
    { type: 'ring', x: 50, y: 88, size: 28, delay: 0.5, dur: 7 },
];

const SERVICES = [
    { id: 0, title: 'Prescription Fulfillment', icon: FiActivity, desc: 'Upload your prescription and we will prepare your medicines for pickup or delivery immediately.', gradient: 'from-blue-600 via-sky-500 to-cyan-400', bg: 'bg-blue-50', border: 'border-blue-200/40', textColor: 'text-blue-700', shadowColor: 'rgba(14,165,233,0.2)', highlights: ['Fast processing', 'Free pickup', 'Digital records', 'Insurance support'] },
    { id: 1, title: '24/7 Delivery', icon: FiTruck, desc: 'Health emergencies dont wait. We provide round-the-clock delivery services within the city limits.', gradient: 'from-emerald-600 via-teal-500 to-green-400', bg: 'bg-emerald-50', border: 'border-emerald-200/40', textColor: 'text-emerald-700', shadowColor: 'rgba(5,150,105,0.2)', highlights: ['Same-day delivery', 'Live tracking', 'Contactless drop', 'City-wide'] },
    { id: 2, title: 'Pharmacist Consultations', icon: FiUsers, desc: 'Get free professional advice on medication dosage, interactions, and general health.', gradient: 'from-violet-600 via-purple-500 to-fuchsia-400', bg: 'bg-violet-50', border: 'border-violet-200/40', textColor: 'text-violet-700', shadowColor: 'rgba(139,92,246,0.2)', highlights: ['Expert pharmacists', 'Private sessions', 'Follow-up care', 'Free advice'] },
    { id: 3, title: 'Health Screenings', icon: FiHeart, desc: 'Visit our physical store for quick blood pressure, blood sugar, and BMI checks.', gradient: 'from-rose-600 via-pink-500 to-red-400', bg: 'bg-rose-50', border: 'border-rose-200/40', textColor: 'text-rose-700', shadowColor: 'rgba(244,63,94,0.2)', highlights: ['No appointment', 'Instant results', 'Free checkups', 'Quarterly plans'] },
    { id: 4, title: 'Authentic Medications', icon: FiShield, desc: 'We source directly from manufacturers and certified distributors to guarantee 100% genuine products.', gradient: 'from-amber-600 via-orange-500 to-yellow-400', bg: 'bg-amber-50', border: 'border-amber-200/40', textColor: 'text-amber-700', shadowColor: 'rgba(245,158,11,0.2)', highlights: ['Certified sources', 'Quality assured', 'Money-back', 'Tracked batches'] },
    { id: 5, title: 'Refill Reminders', icon: FiClock, desc: 'Never run out of your essential medications. We track and remind you when its time for a refill.', gradient: 'from-indigo-600 via-blue-500 to-sky-400', bg: 'bg-indigo-50', border: 'border-indigo-200/40', textColor: 'text-indigo-700', shadowColor: 'rgba(99,102,241,0.2)', highlights: ['Auto reminders', 'SMS & email', 'One-click refill', 'Family plans'] },
];

export default function Services() {
    const [expanded, setExpanded] = useState(null);

    return (
        <div className="relative min-h-screen pt-40 pb-32 overflow-hidden bg-slate-50">
            {/* ETB ETB ETB  Background Blobs ETB ETB ETB  */}
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[-10%] left-[-5%] w-[45rem] h-[45rem] bg-sky-200/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none" />
            <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }} className="absolute top-[20%] right-[-10%] w-[40rem] h-[40rem] bg-teal-100/40 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none" />
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }} className="absolute bottom-[-10%] left-[20%] w-[50rem] h-[50rem] bg-indigo-100/30 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none" />

            {/* Floating Decors */}
            {FLOATING_DECOR.map((d, i) => (
                <motion.div key={i} style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, pointerEvents: 'none', zIndex: 1 }}
                    animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}>
                    {d.type === 'cross' && <MedCross size={d.size} opacity={0.1} />}
                    {d.type === 'dot' && <div style={{ width: d.size, height: d.size, borderRadius: '50%', background: i % 2 === 0 ? 'rgba(14,165,233,0.15)' : 'rgba(5,150,105,0.15)', boxShadow: i % 2 === 0 ? '0 0 12px rgba(14,165,233,0.2)' : '0 0 12px rgba(5,150,105,0.2)' }} />}
                    {d.type === 'ring' && <motion.div style={{ width: d.size, height: d.size, borderRadius: '50%', border: '1.5px solid rgba(14,165,233,0.08)' }} animate={{ rotate: 360, scale: [1, 1.05, 1] }} transition={{ duration: d.dur, repeat: Infinity, ease: 'linear' }} />}
                </motion.div>
            ))}

            {/* Corner Accents */}
            {[{ top: 24, left: 24, rot: 0 }, { top: 24, right: 24, rot: 90 }, { bottom: 24, right: 24, rot: 180 }, { bottom: 24, left: 24, rot: 270 }].map((c, i) => (
                <motion.div key={i} style={{ position: 'absolute', top: c.top, left: c.left, right: c.right, bottom: c.bottom, width: 44, height: 44, transform: `rotate(${c.rot}deg)`, pointerEvents: 'none', zIndex: 1 }}
                    animate={{ opacity: [0.15, 0.6, 0.15] }} transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2.5, background: 'linear-gradient(to right, #0ea5e9, transparent)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 2.5, height: '100%', background: 'linear-gradient(to bottom, #0ea5e9, transparent)', borderRadius: 2 }} />
                </motion.div>
            ))}

            {/* Bottom Stripe */}
            <motion.div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(to right, #0ea5e9, #059669, #0ea5e9)', backgroundSize: '200% 100%', pointerEvents: 'none', zIndex: 1 }}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />

            <div className="relative z-10 container mx-auto px-6 max-w-7xl">
                {/* Back to Home */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="absolute top-0 left-6 z-50 hidden md:block">
                    <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full text-slate-600 font-bold shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:text-sky-600 hover:border-sky-200 hover:shadow-[0_8px_30px_rgb(14,165,233,0.15)] hover:-translate-x-1 transition-all duration-300">
                        <FiArrowLeft size={18} /> Back to Home
                    </Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-8 md:hidden">
                    <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full text-slate-600 font-bold shadow-sm hover:text-sky-600 transition-all duration-300">
                        <FiArrowLeft size={18} /> Back to Home
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto mb-16">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 border border-sky-100 shadow-sm mb-6">
                        <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.4, repeat: Infinity }} className="w-2 h-2 rounded-full bg-sky-500" />
                        <span className="text-sky-700 font-bold tracking-widest uppercase text-sm">Our Premium Services</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 leading-tight tracking-tight">
                        Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Healthcare</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-3xl mx-auto">At AB Pharma, we go beyond just dispensing medications. We provide holistic, state-of-the-art pharmacy services designed to make managing your health easier, safer, and remarkably convenient.</p>
                </motion.div>

                {/* Services List - Alternating Layout */}
                <div className="space-y-12 mb-20">
                    {SERVICES.map((s, idx) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                        >
                            <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>
                                {/* Visual Side */}
                                <motion.div
                                    whileHover={{ scale: 1.02, boxShadow: `0 40px 80px ${s.shadowColor}` }}
                                    className={`w-full lg:w-5/12 relative overflow-hidden rounded-3xl ${s.bg} ${s.border} border p-8 lg:p-12 min-h-[300px] flex items-center justify-center group`}
                                >
                                    {/* Gradient blob */}
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }}
                                        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-3xl`}
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 + 1 }}
                                        className={`absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-3xl`}
                                    />

                                    {/* Floating crosses inside card */}
                                    <motion.div style={{ position: 'absolute', top: '12%', right: '10%', pointerEvents: 'none', opacity: 0.12 }}
                                        animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                                        <MedCross size={20} color={s.shadowColor} opacity={1} />
                                    </motion.div>
                                    <motion.div style={{ position: 'absolute', bottom: '15%', left: '8%', pointerEvents: 'none', opacity: 0.1 }}
                                        animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}>
                                        <MedCross size={14} color={s.shadowColor} opacity={1} />
                                    </motion.div>

                                    {/* Icon */}
                                    <motion.div
                                        whileHover={{ scale: 1.15, rotate: 8 }}
                                        className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-2xl relative z-10`}
                                    >
                                        <s.icon size={56} />
                                    </motion.div>

                                    {/* Rating badge */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5 + idx * 0.1 }}
                                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 z-10"
                                    >
                                        <FiStar size={14} className="text-amber-400 fill-amber-400" />
                                        <span className="text-xs font-bold text-slate-700">4.9</span>
                                    </motion.div>
                                </motion.div>

                                {/* Content Side */}
                                <div className="w-full lg:w-7/12">
                                    <motion.div
                                        initial={{ opacity: 0, x: idx % 2 === 0 ? 20 : -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                                    >
                                        <span className={`inline-block text-xs font-bold uppercase tracking-widest ${s.textColor} mb-3`}>
                                            Service 0{idx + 1}
                                        </span>
                                        <h3 className="text-3xl lg:text-4xl font-extrabold text-slate-800 mb-4 leading-tight">{s.title}</h3>
                                        <p className="text-lg text-slate-600 leading-relaxed mb-6">{s.desc}</p>

                                        {/* Highlights */}
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {s.highlights.map((h, i) => (
                                                <motion.span
                                                    key={i}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.4 + i * 0.08 }}
                                                    className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full ${s.bg} ${s.textColor} border ${s.border}`}
                                                >
                                                    <FiCheck size={12} />
                                                    {h}
                                                </motion.span>
                                            ))}
                                        </div>

                                        {/* Action + Expand */}
                                        <div className="flex items-center gap-6">
                                            <motion.button
                                                whileHover={{ x: 4 }}
                                                className={`inline-flex items-center gap-2 font-bold ${s.textColor} hover:underline underline-offset-4`}
                                            >
                                                Book this service <FiArrowRight size={16} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                <motion.span
                                                    animate={{ rotate: expanded === s.id ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <FiChevronDown size={18} />
                                                </motion.span>
                                                Details
                                            </motion.button>
                                        </div>

                                        {/* Expandable Details */}
                                        <AnimatePresence>
                                            {expanded === s.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {[
                                                                { label: 'Avg. response', value: '< 5 mins' },
                                                                { label: 'Satisfaction', value: '98.5%' },
                                                                { label: 'Coverage', value: 'City-wide' },
                                                                { label: 'Cost', value: 'Free' },
                                                            ].map((stat, i) => (
                                                                <div key={i} className={`p-4 rounded-2xl ${s.bg}`}>
                                                                    <div className="text-xs text-slate-500 font-medium mb-1">{stat.label}</div>
                                                                    <div className={`text-lg font-extrabold ${s.textColor}`}>{stat.value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative rounded-[2.5rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between text-white overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #0c2340, #082f49, #0d4f3c)', boxShadow: '0 30px 70px rgba(3,105,161,0.3)' }}
                >
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
                    <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                    {[{ top: '20%', right: '10%', size: 22, delay: 0 }, { top: '60%', left: '8%', size: 16, delay: 1.5 }, { top: '30%', left: '40%', size: 12, delay: 3 }].map((d, i) => (
                        <motion.div key={i} style={{ position: 'absolute', top: d.top, left: d.left, right: d.right, pointerEvents: 'none', opacity: 0.1 }}
                            animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}>
                            <MedCross size={d.size} color="white" opacity={1} />
                        </motion.div>
                    ))}

                    <div className="relative z-10 max-w-3xl text-center lg:text-left mb-10 lg:mb-0">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sky-200 text-xs font-bold uppercase tracking-widest mb-4">
                                <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Get Started Today
                            </motion.span>
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                            Your Health, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">Our Mission</span>
                        </h2>
                        <p className="text-sky-100 text-xl font-light">Join thousands of satisfied patients who trust AB Pharma for genuine medicines, expert care, and lightning-fast delivery.</p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-5">
                        <motion.a href="/medicines" whileHover={{ y: -3, boxShadow: '0 20px 50px rgba(255,255,255,0.3)' }} whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center bg-white text-sky-900 px-10 py-4 rounded-2xl font-extrabold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-sky-50 transition-all duration-300">
                            Shop Now <FiArrowRight className="ml-2" />
                        </motion.a>
                        <motion.a href="/contact" whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'white' }} whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center bg-transparent text-white border-2 border-white/30 px-10 py-4 rounded-2xl font-extrabold text-lg transition-all duration-300">
                            Contact Us
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
