import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Phone, Mail, MessageCircle, Send, Upload, Clock,
    Globe, ExternalLink, ChevronDown, ChevronUp,
    Star, ArrowRight, Shield, Zap, Award, Heart, Check, Share2, AtSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const QUICK_CONTACTS = [
    { icon: MapPin, title: 'Visit Us', detail: 'Addis Ababa, Ethiopia', sub: 'Open in Maps', color: '#2563EB', bg: '#eff6ff' },
    { icon: Phone, title: 'Call Us', detail: '+251 901 243 826', sub: 'Available 24/7', color: '#22C55E', bg: '#f0fdf4' },
    { icon: Mail, title: 'Email', detail: 'support@abpharma.com', sub: 'Quick Response', color: '#06B6D4', bg: '#f0fdfa' },
    { icon: MessageCircle, title: 'Live Chat', detail: 'Chat with Pharmacist', sub: 'Avg. reply: 2 min', color: '#7c3aed', bg: '#f5f3ff' },
];

const DEPARTMENTS = ['General Inquiry', 'Prescription Support', 'Order & Delivery', 'Billing & Insurance', 'Technical Support'];

const FAQS = [
    { q: 'How do I upload a prescription?', a: 'Navigate to the prescription section, take a photo or upload an image of your prescription. Our pharmacists will review and prepare your medicines for pickup or delivery.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 30-60 minutes within the city. Express delivery is available for urgent orders. You can track your order in real-time through the app.' },
    { q: 'Can I return medicines?', a: 'Unopened and sealed medicines can be returned within 24 hours with a valid receipt. Prescription medications and opened items cannot be returned for safety reasons.' },
    { q: 'How do I contact a pharmacist?', a: 'You can reach our pharmacists via live chat, phone call, or by visiting our physical store. Our licensed pharmacists are available 24/7 for consultations.' },
];

const TESTIMONIALS = [
    { name: 'Fatima A.', role: 'Loyal Customer', text: 'ABPharma responded to my prescription question within minutes. The pharmacist was thorough and professional. Excellent service!', rating: 5, avatar: 'F' },
    { name: 'Daniel K.', role: 'First-time User', text: 'I was nervous about ordering medicine online, but the live chat support walked me through everything. Now I order regularly.', rating: 5, avatar: 'D' },
    { name: 'Hana M.', role: 'Healthcare Professional', text: 'As a nurse, I appreciate the accuracy and care ABPharma puts into every order. The consultation service is genuinely helpful.', rating: 5, avatar: 'H' },
];

const WHY_CONTACT = [
    { icon: Shield, title: 'Licensed Pharmacists', desc: 'Expert guidance from certified healthcare professionals.' },
    { icon: Zap, title: 'Fast Response', desc: 'Average response time under 2 minutes for all inquiries.' },
    { icon: Award, title: 'Trusted Healthcare', desc: 'HIPAA-compliant data protection and privacy standards.' },
];

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', subject: '', message: '' });
    const [agreed, setAgreed] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!agreed) return toast.error('Please agree to the privacy policy.');
        toast.success('Message sent! We will get back to you shortly.');
        setForm({ name: '', email: '', phone: '', department: '', subject: '', message: '' });
        setAgreed(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* ───── Hero ───── */}
            <section className="relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <motion.div initial="hidden" animate="visible" variants={stagger}>
                            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-blue-600 text-xs font-semibold uppercase tracking-widest">Contact Us</span>
                            </motion.div>

                            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1] mb-6">
                                We're Here to{' '}
                                <span className="text-[#2563EB]">Help</span>
                            </motion.h1>

                            <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-500 leading-relaxed max-w-xl mb-8">
                                Need assistance with your medicines, prescriptions, healthcare services, or online orders? Our pharmacists are available every day.
                            </motion.p>

                            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                                <a href="#contact-form" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] bg-[#2563EB] text-white font-semibold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                                    Contact Support <ArrowRight size={16} />
                                </a>
                                <a href="tel:+251901243826" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] border border-slate-200 text-[#0F172A] font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                                    <Phone size={16} /> Call Now
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
                                <div className="absolute inset-0 m-auto w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full bg-blue-50/80 border border-blue-100/60" />

                                <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-auto">
                                    {/* Chat bubble */}
                                    <rect x="60" y="60" width="160" height="120" rx="20" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
                                    <rect x="80" y="84" width="90" height="6" rx="3" fill="#2563EB" opacity="0.2" />
                                    <rect x="80" y="98" width="120" height="4" rx="2" fill="#E5E7EB" />
                                    <rect x="80" y="108" width="100" height="4" rx="2" fill="#E5E7EB" />
                                    <rect x="80" y="126" width="60" height="24" rx="12" fill="#2563EB" opacity="0.9" />
                                    <rect x="92" y="134" width="36" height="8" rx="4" fill="white" opacity="0.9" />
                                    {/* Medical cross */}
                                    <rect x="300" y="40" width="120" height="120" rx="24" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
                                    <rect x="340" y="55" width="40" height="90" rx="8" fill="#22C55E" opacity="0.85" />
                                    <rect x="315" y="80" width="90" height="40" rx="8" fill="#22C55E" opacity="0.85" />
                                    {/* Stethoscope */}
                                    <circle cx="130" cy="300" r="50" fill="#F8FAFC" stroke="#E5E7EB" strokeWidth="1.5" />
                                    <path d="M118 290 C118 272, 142 272, 142 290" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                    <circle cx="130" cy="300" r="8" fill="#2563EB" opacity="0.3" />
                                    <circle cx="130" cy="300" r="4" fill="#2563EB" />
                                    {/* Hospital */}
                                    <rect x="280" y="220" width="140" height="140" rx="18" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
                                    <rect x="296" y="236" width="108" height="28" rx="6" fill="#2563EB" opacity="0.08" />
                                    <rect x="330" y="228" width="40" height="16" rx="4" fill="#2563EB" opacity="0.9" />
                                    <rect x="296" y="280" width="32" height="32" rx="6" fill="#EFF6FF" />
                                    <rect x="336" y="280" width="32" height="32" rx="6" fill="#EFF6FF" />
                                    <rect x="376" y="280" width="32" height="32" rx="6" fill="#EFF6FF" />
                                    <rect x="296" y="324" width="32" height="32" rx="6" fill="#EFF6FF" />
                                    <rect x="336" y="324" width="32" height="32" rx="6" fill="#2563EB" opacity="0.08" />
                                    <rect x="376" y="324" width="32" height="32" rx="6" fill="#EFF6FF" />
                                    {/* Pill */}
                                    <ellipse cx="420" cy="320" rx="20" ry="10" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" transform="rotate(-30 420 320)" />
                                    <ellipse cx="420" cy="320" rx="10" ry="10" fill="#22C55E" opacity="0.6" transform="rotate(-30 420 320)" />
                                    {/* Dots */}
                                    <circle cx="80" cy="200" r="4" fill="#2563EB" opacity="0.12" />
                                    <circle cx="460" cy="160" r="3" fill="#22C55E" opacity="0.12" />
                                </svg>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ───── Quick Contact Cards ───── */}
            <section className="py-12 sm:py-16 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
                        {QUICK_CONTACTS.map((c, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="bg-white rounded-[20px] border border-slate-100 p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: c.bg }}>
                                    <c.icon size={22} style={{ color: c.color }} strokeWidth={1.8} />
                                </div>
                                <h3 className="text-base font-bold text-[#0F172A] mb-1">{c.title}</h3>
                                <p className="text-sm text-slate-600 font-medium mb-2">{c.detail}</p>
                                <p className="text-xs font-semibold" style={{ color: c.color }}>{c.sub}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ───── Main Form + Info ───── */}
            <section id="contact-form" className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">

                        {/* Form */}
                        <motion.div className="lg:col-span-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                            <motion.div variants={fadeUp} className="bg-white rounded-[20px] border border-slate-100 p-7 sm:p-10 shadow-sm">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-2">Send us a Message</h2>
                                <p className="text-sm text-slate-500 mb-8">Fill out the form below and our team will respond within 24 hours.</p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Name</label>
                                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                placeholder="John Doe" required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email Address</label>
                                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                placeholder="john@example.com" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone Number</label>
                                            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                placeholder="+251 901 243 826" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Department</label>
                                            <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer">
                                                <option value="">Select department</option>
                                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Subject</label>
                                        <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                            placeholder="How can we help you?" required />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Message</label>
                                        <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                                            placeholder="Write your message here..." required />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Upload Prescription (Optional)</label>
                                        <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-400 hover:border-blue-300 hover:text-blue-500 cursor-pointer transition-all">
                                            <Upload size={16} />
                                            <span>Choose file or drag & drop</span>
                                            <input type="file" className="hidden" accept="image/*,.pdf" />
                                        </label>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative mt-0.5">
                                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only peer" />
                                            <div className="w-5 h-5 rounded-md border-2 border-slate-200 peer-checked:border-[#2563EB] peer-checked:bg-[#2563EB] transition-all flex items-center justify-center group-hover:border-slate-300">
                                                {agreed && <Check size={12} className="text-white" strokeWidth={3} />}
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 leading-relaxed">
                                            I agree to the <a href="#" className="text-[#2563EB] font-semibold hover:underline">privacy policy</a> and consent to being contacted regarding my inquiry.
                                        </span>
                                    </label>

                                    <button type="submit"
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[14px] bg-[#2563EB] text-white font-semibold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                                        <Send size={16} /> Send Message
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>

                        {/* Info Sidebar */}
                        <motion.div className="lg:col-span-2 space-y-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                            {/* Office Hours */}
                            <motion.div variants={fadeUp} custom={0} className="bg-white rounded-[20px] border border-slate-100 p-7 shadow-sm">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Clock size={20} className="text-[#2563EB]" strokeWidth={1.8} />
                                    </div>
                                    <h3 className="text-base font-bold text-[#0F172A]">Office Hours</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { day: 'Monday – Friday', time: '8:00 AM – 8:00 PM' },
                                        { day: 'Saturday', time: '9:00 AM – 6:00 PM' },
                                        { day: 'Sunday', time: 'Emergency Only', highlight: true },
                                    ].map((h, i) => (
                                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                                            <span className="text-sm font-medium text-slate-600">{h.day}</span>
                                            <span className={`text-sm font-semibold ${h.highlight ? 'text-amber-600' : 'text-[#0F172A]'}`}>{h.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Emergency */}
                            <motion.div variants={fadeUp} custom={1} className="bg-white rounded-[20px] border border-slate-100 p-7 shadow-sm">
                                <h3 className="text-base font-bold text-[#0F172A] mb-4">Emergency Contact</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Ambulance', value: '907', icon: Heart },
                                        { label: 'Support', value: '+251 901 243 826', icon: Phone },
                                        { label: 'Email', value: 'support@abpharma.com', icon: Mail },
                                    ].map((e, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <e.icon size={15} className="text-[#2563EB]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-slate-400 font-medium">{e.label}</div>
                                                <div className="text-sm font-semibold text-[#0F172A] truncate">{e.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Social */}
                            <motion.div variants={fadeUp} custom={2} className="bg-white rounded-[20px] border border-slate-100 p-7 shadow-sm">
                                <h3 className="text-base font-bold text-[#0F172A] mb-4">Follow Us</h3>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { icon: Globe, label: 'Facebook', color: '#1877F2' },
                                        { icon: AtSign, label: 'Instagram', color: '#E4405F' },
                                        { icon: MessageCircle, label: 'Telegram', color: '#0088cc' },
                                        { icon: Share2, label: 'LinkedIn', color: '#0A66C2' },
                                    ].map((s, i) => (
                                        <a key={i} href="#" aria-label={s.label}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600 hover:border-slate-200 hover:shadow-sm transition-all duration-200"
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '40'; e.currentTarget.style.color = s.color; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                                        >
                                            <s.icon size={15} /> {s.label}
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ───── Map ───── */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="rounded-[20px] overflow-hidden border border-slate-100 shadow-sm">
                        <div className="bg-slate-100 h-[300px] sm:h-[400px] flex items-center justify-center relative">
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #2563EB 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            <div className="text-center z-10">
                                <MapPin size={40} className="text-[#2563EB] mx-auto mb-3" strokeWidth={1.5} />
                                <p className="text-lg font-bold text-[#0F172A] mb-1">ABPharma Headquarters</p>
                                <p className="text-sm text-slate-500">Addis Ababa, Ethiopia</p>
                                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#2563EB] hover:underline">
                                    Open in Google Maps <ExternalLink size={13} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ───── Why Contact ───── */}
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">Why Contact ABPharma</motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg">Trusted by thousands for reliable, professional healthcare support.</motion.p>
                    </motion.div>

                    <motion.div className="grid md:grid-cols-3 gap-6 sm:gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {WHY_CONTACT.map((item, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="p-8 sm:p-10 rounded-[20px] bg-white border border-slate-100 text-center hover:border-blue-200 hover:shadow-md transition-all duration-300">
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

            {/* ───── FAQ ───── */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">Frequently Asked Questions</motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg">Quick answers to common questions.</motion.p>
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

            {/* ───── Testimonials ───── */}
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">What Customers Say</motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg">Real feedback from real customers.</motion.p>
                    </motion.div>

                    <motion.div className="grid sm:grid-cols-3 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i}
                                className="bg-white rounded-[20px] border border-slate-100 p-7 hover:border-blue-200 hover:shadow-md transition-all duration-300">
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

            {/* ───── Newsletter ───── */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">Stay Updated</h2>
                        <p className="text-slate-500 text-lg mb-8">Subscribe to receive health tips, promotions, and pharmacy updates.</p>
                        <form onSubmit={e => { e.preventDefault(); toast.success('Subscribed successfully!'); }}
                            className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
                            <input type="email" placeholder="Enter your email"
                                className="flex-1 w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                required />
                            <button type="submit"
                                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all duration-300">
                                Subscribe
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
