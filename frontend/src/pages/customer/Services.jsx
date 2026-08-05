import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FileText, Syringe, Activity, Truck, Stethoscope, Pill,
    ArrowRight, CheckCircle2, Shield, HeartPulse, Clock
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

const SERVICES = [
    {
        icon: FileText, title: 'Prescription Fulfillment',
        desc: 'Upload your valid doctor\'s prescription and our certified pharmacists will prepare your medicines swiftly and accurately.',
        features: ['Fast Processing', 'Digital Records', 'Same Day Pickup'],
        badge: 'Top Choice'
    },
    {
        icon: Stethoscope, title: 'Health Consultation',
        desc: 'Get expert advice on medication, dosage, and health management directly from clinical pharmacy specialists.',
        features: ['Certified Experts', 'Private Sessions', 'Follow-up Care'],
    },
    {
        icon: Activity, title: 'Vitals & Screening',
        desc: 'Instant blood pressure and blood glucose checks right at the pharmacy, complete with personalized health insights.',
        features: ['Instant Results', 'Health Report', 'Diet Advice'],
    },
    {
        icon: Truck, title: 'Express Delivery',
        desc: 'Skip the line. Get your vital medicines delivered to your doorstep securely in temperature-controlled packaging.',
        features: ['Free Delivery', 'Same Day', 'Secure Packaging'],
        badge: 'Popular'
    },
];

export default function Services() {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-400 rounded-full blur-[140px] mix-blend-multiply opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-emerald-300 rounded-full blur-[140px] mix-blend-multiply opacity-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 mb-6">
                        <HeartPulse size={14} className="text-blue-600" />
                        <span className="text-blue-700 text-xs font-bold uppercase tracking-widest">Premium Healthcare</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                        More Than Just a <span className="text-blue-600">Pharmacy.</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        We provide clinical services, expert consultations, and rapid fulfillment designed entirely around your health.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SERVICES.map((svc, i) => (
                        <motion.div
                            key={i}
                            initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                            whileHover={{ y: -6, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/80 backdrop-blur-xl border border-white rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(37,99,235,0.08)] relative overflow-hidden group flex flex-col"
                        >
                            {/* Accent Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-start justify-between mb-6 relative">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                                    <svc.icon size={28} className="text-blue-600 group-hover:text-white transition-colors duration-300" strokeWidth={1.8} />
                                </div>
                                {svc.badge && (
                                    <span className="bg-sky-100 text-sky-700 font-bold px-3 py-1 text-xs rounded-full uppercase tracking-wider">
                                        {svc.badge}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-3 relative z-10">{svc.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow relative z-10">
                                {svc.desc}
                            </p>

                            <div className="space-y-2 mb-8 relative z-10">
                                {svc.features.map((f, j) => (
                                    <div key={j} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> {f}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100 relative z-10">
                                <Link to="/contact" className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                                    Book Service <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}

                    {/* Consult Banner inside Grid */}
                    <motion.div
                        initial="hidden" animate="visible" variants={fadeUp} custom={SERVICES.length + 1}
                        className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 to-sky-500 rounded-[28px] p-8 text-white shadow-xl flex flex-col justify-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

                        <Shield size={40} className="mb-6 opacity-80" />
                        <h3 className="text-2xl font-bold mb-3">Not sure what you need?</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-8 font-medium">
                            Talk directly to a licensed pharmacist today. Free evaluation over chat or call.
                        </p>

                        <Link to="/contact" className="w-full bg-white hover:bg-slate-50 text-blue-600 rounded-xl py-3.5 font-bold text-sm flex items-center justify-center transition-colors">
                            Contact Us
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
