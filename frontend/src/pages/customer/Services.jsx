import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Syringe, Activity, Truck, Stethoscope, Pill,
    ArrowRight, Check, Star, Clock, DollarSign, ChevronDown, ChevronUp,
    Shield, Zap, Award, CalendarCheck, UserCheck, BadgeCheck,
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

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
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* ───── Hero ───── */}
            <section className="relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <motion.div initial="hidden" animate="visible" variants={stagger}>
                            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-blue-600 text-xs font-semibold uppercase tracking-widest">Our Premium Services</span>
                            </motion.div>

                            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1] mb-6">
                                Comprehensive{' '}
                                <span className="text-[#2563EB]">Healthcare</span>{' '}
                                Services
                            </motion.h1>

                            <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-500 leading-relaxed max-w-xl mb-8">
                                At ABPharma, we provide healthcare solutions beyond medicines. Book professional pharmacy services, health screenings, vaccinations, and expert consultations—all in one place.
                            </motion.p>

                            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                                <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] bg-[#2563EB] text-white font-semibold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                                    Book Appointment <ArrowRight size={16} />
                                </Link>
                                <a href="#services" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] border border-slate-200 text-[#0F172A] font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                                    View All Services
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* Illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="relative flex items-center justify-center"
                        >
                            <div className="relative w-full max-w-lg mx-auto">
                                <div className="absolute inset-0 m-auto w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full bg-blue-50/80 border border-blue-100/60" />

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
            <section className="py-12 sm:py-16 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
                        {STATS.map((s, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i} className="text-center p-6 sm:p-8 rounded-[20px] bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                    <s.icon size={22} className="text-[#2563EB]" strokeWidth={1.8} />
                                </div>
                                <div className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-1">{s.value}</div>
                                <div className="text-sm text-slate-500 font-medium">{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── Services Grid ───── */}
            <section id="services" className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">What We Offer</motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg">Professional pharmacy services designed to keep you and your family healthy.</motion.p>
                    </motion.div>

                    <motion.div className="grid md:grid-cols-2 gap-6 sm:gap-8" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
                        {SERVICES.map((svc, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="group bg-white rounded-[20px] border border-slate-100 p-7 sm:p-8 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-200 transition-all duration-300">
                                <div className="flex items-start gap-5 mb-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2563EB] group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-300">
                                        <svc.icon size={26} className="text-[#2563EB] group-hover:text-white transition-colors duration-300" strokeWidth={1.8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-[#0F172A] mb-1">{svc.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{svc.desc}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {svc.features.map((f, j) => (
                                        <span key={j} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                                            <Check size={12} className="text-[#22C55E]" />
                                            {f}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                        <span className="inline-flex items-center gap-1"><Clock size={13} /> {svc.duration}</span>
                                        <span className="inline-flex items-center gap-1"><DollarSign size={13} /> {svc.price}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Star size={13} className="text-amber-400 fill-amber-400" /> {svc.rating}
                                            <span className="text-slate-300">({svc.reviews.toLocaleString()})</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-5">
                                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-sm shadow-blue-200">
                                        Book Now <ArrowRight size={14} />
                                    </button>
                                    <button className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                                        Learn More
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── Why Choose Us ───── */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">Why Choose ABPharma</motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg">Trusted by thousands of patients for reliable, professional healthcare.</motion.p>
                    </motion.div>

                    <motion.div className="grid md:grid-cols-3 gap-6 sm:gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {WHY_US.map((item, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="p-8 sm:p-10 rounded-[20px] bg-[#F8FAFC] border border-slate-100 text-center hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                                    <item.icon size={30} className="text-[#2563EB]" strokeWidth={1.6} />
                                </div>
                                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── How It Works ───── */}
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">How It Works</motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg">Four simple steps to get the care you need.</motion.p>
                    </motion.div>

                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {STEPS.map((step, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i} className="relative text-center">
                                {i < STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-slate-100 z-0" />
                                )}
                                <div className="relative z-10 w-20 h-20 rounded-[20px] bg-white border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <step.icon size={30} className="text-[#2563EB]" strokeWidth={1.6} />
                                </div>
                                <div className="text-xs font-bold text-blue-500 tracking-widest mb-2">STEP {step.num}</div>
                                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{step.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── Testimonials ───── */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">What Our Customers Say</motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg">Real reviews from real customers who trust ABPharma.</motion.p>
                    </motion.div>

                    <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="bg-[#F8FAFC] rounded-[20px] border border-slate-100 p-6 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-0.5 mb-4">
                                    {Array.from({ length: t.rating }).map((_, s) => (
                                        <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed mb-6">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-[#2563EB]">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#0F172A]">{t.name}</div>
                                        <div className="text-xs text-slate-400">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── FAQ ───── */}
            <section className="py-16 sm:py-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">Frequently Asked Questions</motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg">Everything you need to know about our services.</motion.p>
                    </motion.div>

                    <motion.div className="space-y-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {FAQS.map((faq, i) => {
                            const isOpen = openFaq === i;
                            return (
                                <motion.div key={i} variants={fadeUp} custom={i}
                                    className={`rounded-[16px] border transition-all duration-300 ${isOpen ? 'bg-white border-blue-200 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                    <button onClick={() => setOpenFaq(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left" aria-expanded={isOpen}>
                                        <span className="text-sm sm:text-base font-semibold text-[#0F172A]">{faq.q}</span>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-blue-50 text-[#2563EB]' : 'bg-slate-50 text-slate-400'}`}>
                                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                                            <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ───── CTA ───── */}
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="relative bg-[#2563EB] rounded-[24px] p-10 sm:p-16 lg:p-20 text-center overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                                Need Professional Healthcare Assistance?
                            </h2>
                            <p className="text-blue-100 text-lg mb-8">Book your appointment today and experience the ABPharma difference.</p>
                            <Link to="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-[14px] bg-white text-[#2563EB] font-bold text-base shadow-xl hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5">
                                Book Appointment <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
