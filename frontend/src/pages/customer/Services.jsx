import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Syringe, Activity, Truck, Stethoscope, Pill,
    ArrowRight, Check, Star, Clock, DollarSign, ChevronDown, ChevronUp,
    Shield, Zap, Award, CalendarCheck, UserCheck, BadgeCheck,
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const SERVICES = [
    {
        icon: FileText,
        title: 'Prescription Fulfillment',
        desc: 'Upload your doctor\'s prescription and receive your medicines quickly. Our pharmacists verify every detail for accurate dispensing.',
        features: ['Fast Processing', 'Insurance Support', 'Digital Records', 'Same Day Pickup'],
        duration: '15 min',
        price: 'Free',
        rating: 4.9,
        reviews: 1240,
    },
    {
        icon: Stethoscope,
        title: 'Health Consultation',
        desc: 'Video or in-person consultation with certified pharmacists. Get expert advice on medication, dosage, and health management.',
        features: ['Certified Experts', 'Private Sessions', 'Follow-up Care', 'Video Available'],
        duration: '30 min',
        price: '$10',
        rating: 4.8,
        reviews: 890,
    },
    {
        icon: Syringe,
        title: 'Vaccination',
        desc: 'Stay protected with our comprehensive vaccination services. Administered by licensed healthcare professionals in a safe environment.',
        features: ['Licensed Staff', 'All Vaccines', 'Walk-in Available', 'Digital Certificate'],
        duration: '20 min',
        price: '$25',
        rating: 4.9,
        reviews: 2100,
    },
    {
        icon: Activity,
        title: 'Blood Pressure Check',
        desc: 'Quick and accurate blood pressure monitoring with instant results and personalized health recommendations.',
        features: ['Instant Results', 'No Appointment', 'Health Report', 'Free Recheck'],
        duration: '10 min',
        price: 'Free',
        rating: 4.7,
        reviews: 560,
    },
    {
        icon: Pill,
        title: 'Diabetes Screening',
        desc: 'Comprehensive diabetes screening including blood glucose and HbA1c testing with detailed health assessment.',
        features: ['Accurate Testing', 'Lab Certified', 'Health Report', 'Diet Advice'],
        duration: '15 min',
        price: '$15',
        rating: 4.8,
        reviews: 780,
    },
    {
        icon: Truck,
        title: 'Medicine Home Delivery',
        desc: 'Get your medicines delivered to your doorstep. Track your order in real-time with secure, tamper-proof packaging.',
        features: ['Free Delivery', 'Real-time Tracking', 'Secure Packaging', 'Same Day'],
        duration: '30-60 min',
        price: 'Free',
        rating: 4.9,
        reviews: 3200,
    },
];

const STATS = [
    { value: '150+', label: 'Professional Pharmacists', icon: UserCheck },
    { value: '50K+', label: 'Happy Customers', icon: BadgeCheck },
    { value: '24/7', label: 'Support', icon: Clock },
    { value: '99%', label: 'Customer Satisfaction', icon: Award },
];

const WHY_US = [
    { icon: Shield, title: 'Certified Pharmacists', desc: 'Licensed healthcare experts with years of professional experience.' },
    { icon: Zap, title: 'Fast Delivery', desc: 'Same-day delivery with real-time tracking and secure packaging.' },
    { icon: Award, title: 'Secure Healthcare', desc: 'HIPAA-compliant data protection for complete privacy and trust.' },
];

const STEPS = [
    { icon: CalendarCheck, num: '01', title: 'Book Service', desc: 'Choose your service and select a convenient time slot.' },
    { icon: Clock, num: '02', title: 'Choose Schedule', desc: 'Pick a date and time that works best for you.' },
    { icon: UserCheck, num: '03', title: 'Meet Pharmacist', desc: 'Consult with our certified pharmacists in person or online.' },
    { icon: BadgeCheck, num: '04', title: 'Receive Care', desc: 'Get professional care and personalized health guidance.' },
];

const TESTIMONIALS = [
    { name: 'Sarah M.', role: 'Regular Customer', text: 'ABPharma made it so easy to get my prescription filled. The pharmacist consultation was incredibly helpful and professional.', rating: 5, avatar: 'S' },
    { name: 'James K.', role: 'Health Screening', text: 'Quick blood pressure check with instant results. The staff was very friendly and the facility is modern and clean.', rating: 5, avatar: 'J' },
    { name: 'Maria L.', role: 'Home Delivery', text: 'Medicines delivered to my door within an hour. The tracking feature gave me peace of mind. Highly recommended!', rating: 5, avatar: 'M' },
    { name: 'Ahmed R.', role: 'Vaccination', text: 'Professional vaccination service with proper documentation. The whole process was smooth and well-organized.', rating: 5, avatar: 'A' },
];

const FAQS = [
    { q: 'How do I upload my prescription?', a: 'Simply navigate to the prescription section, take a photo or upload an image of your prescription. Our pharmacists will review and prepare your medicines for pickup or delivery.' },
    { q: 'Can I book services online?', a: 'Yes, you can book any of our services directly from this page. Select your preferred service, choose a time slot, and confirm your booking instantly.' },
    { q: 'Is delivery free?', a: 'Yes, medicine home delivery is completely free for all orders. There is no minimum order requirement. Express delivery options are also available.' },
    { q: 'Do you accept insurance?', a: 'We accept most major insurance plans. You can verify your coverage during checkout or contact our support team for assistance with your specific plan.' },
];

export default function Services() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="min-h-screen" style={{ background: '#F8FAFC' }}>

            {/* ───── Hero ───── */}
            <section className="relative overflow-hidden bg-white">
                {/* Subtle radial background */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(37,99,235,0.03) 0%, transparent 70%)' }} />

                <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                        <motion.div initial="hidden" animate="visible" variants={stagger}>
                            <motion.div variants={fadeUp} custom={0}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.1)' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                                <span className="text-[#2563EB] text-[11px] font-semibold uppercase" style={{ letterSpacing: '0.12em' }}>Our Premium Services</span>
                            </motion.div>

                            <motion.h1 variants={fadeUp} custom={1}
                                className="mb-8"
                                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
                                Comprehensive{' '}
                                <span style={{ color: '#2563EB' }}>Healthcare</span>{' '}
                                Services
                            </motion.h1>

                            <motion.p variants={fadeUp} custom={2}
                                className="mb-10 max-w-xl"
                                style={{ fontSize: '18px', lineHeight: 1.8, color: '#64748B', fontWeight: 400, letterSpacing: '-0.01em' }}>
                                At ABPharma, we provide healthcare solutions beyond medicines. Book professional pharmacy services, health screenings, vaccinations, and expert consultations—all in one place.
                            </motion.p>

                            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-4">
                                <Link to="/contact"
                                    className="inline-flex items-center gap-2.5 font-semibold transition-all duration-300"
                                    style={{ height: '48px', padding: '0 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)', color: '#fff', fontSize: '14px', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.4)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.3)'; }}>
                                    Book Appointment <ArrowRight size={16} />
                                </Link>
                                <a href="#services"
                                    className="inline-flex items-center gap-2 font-semibold transition-all duration-300"
                                    style={{ height: '48px', padding: '0 28px', borderRadius: '12px', border: '1px solid #E5E7EB', color: '#0F172A', fontSize: '14px' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                                    View All Services
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* Illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="relative flex items-center justify-center"
                        >
                            <div className="relative w-full max-w-lg mx-auto">
                                <div className="absolute inset-0 m-auto w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full" style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.08)' }} />

                                <svg viewBox="0 0 500 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-auto">
                                    <rect x="180" y="40" width="140" height="140" rx="28" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
                                    <rect x="225" y="55" width="50" height="110" rx="10" fill="#2563EB" opacity="0.9" />
                                    <rect x="195" y="85" width="110" height="50" rx="10" fill="#2563EB" opacity="0.9" />
                                    <circle cx="380" cy="120" r="45" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
                                    <circle cx="380" cy="120" r="18" fill="#22C55E" opacity="0.15" />
                                    <path d="M370 120 C370 105, 395 105, 395 120" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none" />
                                    <circle cx="380" cy="128" r="5" fill="#22C55E" />
                                    <rect x="80" y="130" width="120" height="150" rx="16" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
                                    <rect x="96" y="152" width="70" height="6" rx="3" fill="#2563EB" opacity="0.2" />
                                    <rect x="96" y="168" width="88" height="4" rx="2" fill="#E5E7EB" />
                                    <rect x="96" y="180" width="80" height="4" rx="2" fill="#E5E7EB" />
                                    <rect x="96" y="192" width="88" height="4" rx="2" fill="#E5E7EB" />
                                    <rect x="96" y="204" width="60" height="4" rx="2" fill="#E5E7EB" />
                                    <rect x="96" y="224" width="40" height="4" rx="2" fill="#2563EB" opacity="0.15" />
                                    <rect x="96" y="236" width="50" height="4" rx="2" fill="#2563EB" opacity="0.15" />
                                    <rect x="320" y="240" width="80" height="110" rx="14" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
                                    <rect x="340" y="228" width="40" height="20" rx="6" fill="#2563EB" opacity="0.9" />
                                    <circle cx="360" cy="285" r="12" fill="#2563EB" opacity="0.12" />
                                    <rect x="348" y="278" width="24" height="14" rx="4" fill="#2563EB" opacity="0.6" />
                                    <ellipse cx="140" cy="340" rx="22" ry="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" transform="rotate(-20 140 340)" />
                                    <ellipse cx="140" cy="340" rx="11" ry="12" fill="#2563EB" opacity="0.7" transform="rotate(-20 140 340)" />
                                    <ellipse cx="200" cy="370" rx="18" ry="10" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" transform="rotate(15 200 370)" />
                                    <ellipse cx="200" cy="370" rx="9" ry="10" fill="#22C55E" opacity="0.7" transform="rotate(15 200 370)" />
                                    <path d="M430 300 C430 285, 445 280, 445 295 C445 280, 460 285, 460 300 C460 320, 445 335, 445 335 C445 335, 430 320, 430 300Z" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1" />
                                    <path d="M437 305 C437 298, 445 295, 445 303 C445 295, 453 298, 453 305 C453 315, 445 323, 445 323 C445 323, 437 315, 437 305Z" fill="#EF4444" opacity="0.4" />
                                    <circle cx="100" cy="80" r="4" fill="#2563EB" opacity="0.15" />
                                    <circle cx="440" cy="200" r="5" fill="#22C55E" opacity="0.15" />
                                    <circle cx="300" cy="380" r="3" fill="#2563EB" opacity="0.1" />
                                </svg>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ───── Stats ───── */}
            <section className="bg-white" style={{ borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12" style={{ paddingBlock: '48px' }}>
                    <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
                        {STATS.map((s, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="text-center rounded-2xl transition-all duration-300"
                                style={{ padding: '32px 24px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '16px' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(15,23,42,0.06)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#F1F5F9'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(37,99,235,0.06)' }}>
                                    <s.icon size={22} className="text-[#2563EB]" strokeWidth={1.8} />
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '4px' }}>{s.value}</div>
                                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── Services Grid ───── */}
            <section id="services">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12" style={{ paddingBlock: '80px' }}>
                    <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '12px' }}>
                            What We Offer
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={1}
                            style={{ fontSize: '17px', lineHeight: 1.7, color: '#64748B' }}>
                            Professional pharmacy services designed to keep you and your family healthy.
                        </motion.p>
                    </motion.div>

                    <motion.div className="grid md:grid-cols-2 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
                        {SERVICES.map((svc, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="group bg-white transition-all duration-300"
                                style={{ borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(15,23,42,0.06)', padding: '32px' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(15,23,42,0.1)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(15,23,42,0.06)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>

                                {/* Top: Icon + Rating */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
                                        style={{ background: 'rgba(37,99,235,0.06)' }}>
                                        <svc.icon size={28} className="text-[#2563EB] transition-transform duration-300 group-hover:scale-110" strokeWidth={1.8} />
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                                        <Star size={13} className="text-amber-500 fill-amber-400" />
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{svc.rating}</span>
                                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>({svc.reviews.toLocaleString()})</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '22px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '10px', lineHeight: 1.3 }}>
                                    {svc.title}
                                </h3>

                                {/* Description */}
                                <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#64748B', marginBottom: '20px', letterSpacing: '-0.01em' }}>
                                    {svc.desc}
                                </p>

                                {/* Feature Chips */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {svc.features.map((f, j) => (
                                        <span key={j}
                                            className="inline-flex items-center gap-1.5 transition-all duration-200"
                                            style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)', padding: '6px 12px', borderRadius: '9999px' }}>
                                            <Check size={12} strokeWidth={2.5} />
                                            {f}
                                        </span>
                                    ))}
                                </div>

                                {/* Divider + Meta */}
                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginBottom: '20px' }}>
                                    <div className="flex items-center gap-5" style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>
                                        <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {svc.duration}</span>
                                        <span className="inline-flex items-center gap-1.5"><DollarSign size={14} /> {svc.price}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <button
                                        className="flex-1 inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300"
                                        style={{ height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)', color: '#fff', fontSize: '14px', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.35)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.25)'; }}>
                                        Book Now <ArrowRight size={14} />
                                    </button>
                                    <button
                                        className="font-medium transition-all duration-200"
                                        style={{ height: '48px', padding: '0 20px', borderRadius: '12px', border: '1px solid #E5E7EB', color: '#64748B', fontSize: '14px', background: 'transparent' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#64748B'; }}>
                                        Learn More
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── Why Choose Us ───── */}
            <section className="bg-white">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12" style={{ paddingBlock: '80px' }}>
                    <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '12px' }}>
                            Why Choose ABPharma
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={1}
                            style={{ fontSize: '17px', lineHeight: 1.7, color: '#64748B' }}>
                            Trusted by thousands of patients for reliable, professional healthcare.
                        </motion.p>
                    </motion.div>

                    <motion.div className="grid md:grid-cols-3 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {WHY_US.map((item, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="text-center transition-all duration-300"
                                style={{ padding: '40px 32px', borderRadius: '20px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(15,23,42,0.06)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#F1F5F9'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(37,99,235,0.06)' }}>
                                    <item.icon size={28} className="text-[#2563EB]" strokeWidth={1.6} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.02em' }}>{item.title}</h3>
                                <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#64748B' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── How It Works ───── */}
            <section>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12" style={{ paddingBlock: '80px' }}>
                    <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '12px' }}>
                            How It Works
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={1}
                            style={{ fontSize: '17px', lineHeight: 1.7, color: '#64748B' }}>
                            Four simple steps to get the care you need.
                        </motion.p>
                    </motion.div>

                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {STEPS.map((step, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i} className="relative text-center">
                                {i < STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute" style={{ top: '40px', left: '60%', width: '80%', height: '2px', background: '#F1F5F9', zIndex: 0 }} />
                                )}
                                <div className="relative z-10 mx-auto mb-6" style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
                                    <step.icon size={30} className="text-[#2563EB]" strokeWidth={1.6} />
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', letterSpacing: '0.12em', marginBottom: '8px' }}>STEP {step.num}</div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.02em' }}>{step.title}</h3>
                                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#64748B' }}>{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── Testimonials ───── */}
            <section className="bg-white">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12" style={{ paddingBlock: '80px' }}>
                    <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '12px' }}>
                            What Our Customers Say
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={1}
                            style={{ fontSize: '17px', lineHeight: 1.7, color: '#64748B' }}>
                            Real reviews from real customers who trust ABPharma.
                        </motion.p>
                    </motion.div>

                    <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="transition-all duration-300"
                                style={{ borderRadius: '20px', border: '1px solid #E5E7EB', padding: '24px', background: '#F8FAFC' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(15,23,42,0.06)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}>
                                <div className="flex items-center gap-0.5 mb-4">
                                    {Array.from({ length: t.rating }).map((_, s) => (
                                        <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#475569', marginBottom: '20px' }}>"{t.text}"</p>
                                <div className="flex items-center gap-3" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.1)', fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{t.name}</div>
                                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── FAQ ───── */}
            <section>
                <div className="max-w-3xl mx-auto px-5 sm:px-8" style={{ paddingBlock: '80px' }}>
                    <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '12px' }}>
                            Frequently Asked Questions
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={1}
                            style={{ fontSize: '17px', lineHeight: 1.7, color: '#64748B' }}>
                            Everything you need to know about our services.
                        </motion.p>
                    </motion.div>

                    <motion.div className="space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {FAQS.map((faq, i) => {
                            const isOpen = openFaq === i;
                            return (
                                <motion.div key={i} variants={fadeUp} custom={i}
                                    className="transition-all duration-300"
                                    style={{ borderRadius: '16px', border: isOpen ? '1px solid rgba(37,99,235,0.2)' : '1px solid #E5E7EB', background: '#fff', boxShadow: isOpen ? '0 8px 30px rgba(15,23,42,0.06)' : 'none' }}>
                                    <button onClick={() => setOpenFaq(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between gap-4 text-left"
                                        style={{ padding: '20px 24px' }}
                                        aria-expanded={isOpen}>
                                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>{faq.q}</span>
                                        <div className="flex-shrink-0 transition-all duration-300"
                                            style={{ width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isOpen ? 'rgba(37,99,235,0.06)' : '#F8FAFC', color: isOpen ? '#2563EB' : '#94A3B8' }}>
                                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div style={{ padding: '0 24px 20px' }}>
                                            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#64748B' }}>{faq.a}</p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ───── CTA ───── */}
            <section>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12" style={{ paddingBottom: '80px' }}>
                    <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="relative text-center overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)', borderRadius: '24px', padding: 'clamp(40px, 8vw, 80px)' }}>
                        {/* Pattern */}
                        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        {/* Glow */}
                        <div className="absolute" style={{ top: '-40%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                        <div className="absolute" style={{ bottom: '-40%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(20,184,166,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px' }}>
                                Need Professional Healthcare Assistance?
                            </h2>
                            <p style={{ fontSize: '17px', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>
                                Book your appointment today and experience the ABPharma difference.
                            </p>
                            <Link to="/contact"
                                className="inline-flex items-center gap-2.5 font-semibold transition-all duration-300"
                                style={{ height: '52px', padding: '0 32px', borderRadius: '12px', background: '#fff', color: '#2563EB', fontSize: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}>
                                Book Appointment <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
