import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, MapPin, Send, Upload, Globe, Share2, HeartHandshake, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
    const [form, setForm] = useState({ name: '', phone: '', message: '' });
    const [focusedField, setFocusedField] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Your message has been sent to our pharmacists!');
        setForm({ name: '', phone: '', message: '' });
        setUploadedFile(null);
    };

    const handleFile = (e) => {
        if (e.target.files[0]) {
            setUploadedFile(e.target.files[0].name);
            toast.success("Prescription attached!");
        }
    };

    const SOCIALS = [
        { icon: MessageCircle, label: 'Telegram', link: 'https://t.me/abelzf', color: '#0088cc', bg: 'bg-sky-50' },
        { icon: Globe, label: 'Facebook', link: 'https://facebook.com', color: '#1877F2', bg: 'bg-blue-50' },
        { icon: Share2, label: 'LinkedIn', link: 'https://linkedin.com', color: '#0A66C2', bg: 'bg-indigo-50' }
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-blue-300 rounded-full blur-[120px] mix-blend-multiply opacity-20 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-sky-300 rounded-full blur-[120px] mix-blend-multiply opacity-20" />

            <div className="max-w-5xl w-full mx-auto relative z-10 grid lg:grid-cols-5 gap-8 bg-white/60 backdrop-blur-3xl rounded-[32px] p-3 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">

                {/* ────── LEFT SIDE: Contact Info Card ────── */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                    className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-sky-500 rounded-[24px] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Get in Touch</h2>
                        <p className="text-blue-100 font-medium text-sm mb-10 leading-relaxed">
                            Have questions about a prescription or our medicines? Our certified pharmacists are ready to help you instantly.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: Phone, title: 'Call Us 24/7', text: '+251 901 243 826' },
                                { icon: Mail, title: 'Email Support', text: 'abelzerfu144@gmail.com' },
                                { icon: MapPin, title: 'Main Pharmacy', text: 'Addis Ababa, Ethiopia' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                        <item.icon size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-200 font-medium uppercase tracking-wider">{item.title}</p>
                                        <p className="text-base font-semibold">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/20">
                        <p className="text-xs font-semibold text-blue-200 mb-4 uppercase tracking-wider">Connect with us on</p>
                        <div className="flex gap-4">
                            {SOCIALS.map((s, i) => (
                                <motion.a
                                    whileHover={{ y: -4, scale: 1.05 }}
                                    key={i} href={s.link} target="_blank" rel="noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/30 transition-all border border-white/10"
                                >
                                    <s.icon size={18} className="text-white" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ────── RIGHT SIDE: Interactive Form ────── */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                    className="lg:col-span-3 p-6 sm:p-10 flex flex-col justify-center"
                >
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Send a Message</h2>
                        <p className="text-slate-500 font-medium mt-1">We typically reply within a few minutes.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="relative group">
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${form.name || focusedField === 'name' ? '-top-2.5 bg-white px-1 text-xs font-bold text-sky-600' : 'top-3.5 text-slate-400 font-medium text-sm'}`}>
                                    Your Name
                                </label>
                                <input
                                    type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 outline-none focus:border-sky-500 hover:border-slate-300 transition-colors font-medium"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${form.phone || focusedField === 'phone' ? '-top-2.5 bg-white px-1 text-xs font-bold text-sky-600' : 'top-3.5 text-slate-400 font-medium text-sm'}`}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                    onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 outline-none focus:border-sky-500 hover:border-slate-300 transition-colors font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${form.message || focusedField === 'message' ? '-top-2.5 bg-white px-1 text-xs font-bold text-sky-600' : 'top-3.5 text-slate-400 font-medium text-sm'}`}>
                                How can we help you?
                            </label>
                            <textarea
                                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                                rows={4}
                                className="w-full bg-transparent border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 outline-none focus:border-sky-500 hover:border-slate-300 transition-colors font-medium resize-none"
                                required
                            />
                        </div>

                        {/* Prescription Upload Button */}
                        <div className="pt-2">
                            <input type="file" id="rx-upload" className="hidden" accept="image/*,.pdf" onChange={handleFile} />
                            <label htmlFor="rx-upload" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer transition-all ${uploadedFile ? 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50'}`}>
                                {uploadedFile ? <CheckCircle2 size={16} /> : <Upload size={16} />}
                                <span className="text-sm font-bold">{uploadedFile ? 'Prescription Attached' : 'Attach Prescription (Optional)'}</span>
                            </label>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100">
                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 w-full sm:w-auto">
                                <HeartHandshake size={14} className="text-sky-500" /> All data is secure & encrypted.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full sm:w-auto bg-slate-900 border-2 border-slate-900 text-white rounded-xl px-8 py-3.5 font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-white hover:text-slate-900 transition-all group"
                            >
                                Send Request <Send size={16} className="transition-transform group-hover:translate-x-1" />
                            </motion.button>
                        </div>
                    </form>
                </motion.div>

            </div>
        </div>
    );
}
