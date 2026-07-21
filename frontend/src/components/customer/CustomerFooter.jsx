import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdLocalPharmacy } from 'react-icons/md';
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiTwitter, FiInstagram, FiChevronRight, FiHeart } from 'react-icons/fi';

const MedCross = ({ size = 16, color = '#0ea5e9', opacity = 0.1 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={opacity}>
        <rect x="9" y="2" width="6" height="20" rx="2" />
        <rect x="2" y="9" width="20" height="6" rx="2" />
    </svg>
);

const Pill = ({ w = 24, h = 10, opacity = 0.08 }) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} opacity={opacity}>
        <rect x="0" y="0" width={w} height={h} rx={h / 2} fill="#0ea5e9" />
        <rect x={w / 2} y="0" width={w / 2} height={h} rx={`0 ${h / 2} ${h / 2} 0`} fill="#059669" />
    </svg>
);

const FLOATING_DECOR = [
    { type: 'cross', x: 5, y: 12, size: 18, delay: 0, dur: 5 },
    { type: 'cross', x: 93, y: 8, size: 14, delay: 1.2, dur: 6 },
    { type: 'cross', x: 3, y: 85, size: 16, delay: 2, dur: 4.5 },
    { type: 'cross', x: 95, y: 80, size: 20, delay: 0.5, dur: 7 },
    { type: 'cross', x: 48, y: 4, size: 12, delay: 1.8, dur: 5.5 },
    { type: 'pill', x: 10, y: 25, delay: 0.3, dur: 5 },
    { type: 'pill', x: 85, y: 22, delay: 1.5, dur: 6.5 },
    { type: 'pill', x: 15, y: 92, delay: 2.5, dur: 4 },
    { type: 'pill', x: 88, y: 90, delay: 0.9, dur: 5.5 },
    { type: 'dot', x: 25, y: 6, size: 6, delay: 0.6, dur: 4 },
    { type: 'dot', x: 72, y: 10, size: 5, delay: 1.4, dur: 5 },
    { type: 'dot', x: 6, y: 55, size: 7, delay: 2.2, dur: 6 },
    { type: 'dot', x: 92, y: 50, size: 6, delay: 0.4, dur: 4.5 },
    { type: 'ring', x: 8, y: 40, size: 30, delay: 1, dur: 8 },
    { type: 'ring', x: 85, y: 65, size: 36, delay: 2, dur: 10 },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const linkVariants = {
    hidden: { opacity: 0, x: -10 },
    show: (i) => ({ opacity: 1, x: 0, transition: { delay: 0.3 + i * 0.05, duration: 0.4 } }),
};

const SOCIAL_ICONS = [
    { Icon: FiFacebook, href: '#', hoverColor: '#1877F2' },
    { Icon: FiTwitter, href: '#', hoverColor: '#1DA1F2' },
    { Icon: FiInstagram, href: '#', hoverColor: '#E4405F' },
];

const QUICK_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/medicines', label: 'Shop Medicines' },
    { to: '/services', label: 'Our Services' },
    { to: '/track-order', label: 'Track Order' },
    { to: '/cart', label: 'My Cart' },
];

const CATEGORIES = [
    { to: '/medicines?category=Prescription', label: 'Prescription Drugs' },
    { to: '/medicines?category=Vitamins', label: 'Vitamins & Supplements' },
    { to: '/medicines?category=First Aid', label: 'First Aid' },
    { to: '/medicines?category=Personal Care', label: 'Personal Care' },
    { to: '/medicines?category=Baby', label: 'Baby Care' },
];

const CONTACTS = [
    { Icon: FiMapPin, text: '123 Health Avenue, Medical District, City, Country' },
    { Icon: FiPhone, text: '+234 800 000 0000' },
    { Icon: FiMail, text: 'support@abpharma.com' },
];

export default function CustomerFooter() {
    return (
        <motion.footer
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="relative pt-16 pb-8 overflow-hidden"
            style={{
                background: 'linear-gradient(160deg, #0c2340 0%, #082f49 30%, #0f3b5e 55%, #0d4f3c 100%)',
            }}
        >
            {/* ETB ETB ETB  Floating Decors ETB ETB ETB  */}
            {FLOATING_DECOR.map((d, i) => (
                <motion.div
                    key={i}
                    style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, pointerEvents: 'none', zIndex: 0 }}
                    animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {d.type === 'cross' && <MedCross size={d.size} opacity={0.1} color="#7dd3fc" />}
                    {d.type === 'pill' && <Pill opacity={0.08} />}
                    {d.type === 'dot' && (
                        <div style={{
                            width: d.size, height: d.size, borderRadius: '50%',
                            background: i % 2 === 0 ? 'rgba(14,165,233,0.15)' : 'rgba(5,150,105,0.15)',
                            boxShadow: i % 2 === 0 ? '0 0 10px rgba(14,165,233,0.2)' : '0 0 10px rgba(5,150,105,0.2)',
                        }} />
                    )}
                    {d.type === 'ring' && (
                        <motion.div
                            style={{ width: d.size, height: d.size, borderRadius: '50%', border: '1px solid rgba(125,211,252,0.08)' }}
                            animate={{ rotate: 360, scale: [1, 1.04, 1] }}
                            transition={{ duration: d.dur, repeat: Infinity, ease: 'linear' }}
                        />
                    )}
                </motion.div>
            ))}

            {/* ETB ETB ETB  Background Gradient Blobs ETB ETB ETB  */}
            <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '-15%', right: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(14,165,233,0.06)', pointerEvents: 'none', zIndex: 0 }}
            />
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(5,150,105,0.06)', pointerEvents: 'none', zIndex: 0 }}
            />

            {/* ETB ETB ETB  Top Accent Stripe ETB ETB ETB  */}
            <motion.div
                style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(to right, #0ea5e9, #10b981, #0ea5e9)',
                    backgroundSize: '200% 100%', zIndex: 2,
                }}
                animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            {/* ETB ETB ETB  Corner Accents ETB ETB ETB  */}
            {[
                { top: 12, left: 12, rot: 0 },
                { top: 12, right: 12, rot: 90 },
                { bottom: 12, right: 12, rot: 180 },
                { bottom: 12, left: 12, rot: 270 },
            ].map((c, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute', top: c.top, left: c.left, right: c.right, bottom: c.bottom,
                        width: 36, height: 36, transform: `rotate(${c.rot}deg)`, pointerEvents: 'none', zIndex: 1,
                    }}
                    animate={{ opacity: [0.15, 0.5, 0.15] }}
                    transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: 'linear-gradient(to right, rgba(14,165,233,0.3), transparent)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: 'linear-gradient(to bottom, rgba(14,165,233,0.3), transparent)', borderRadius: 2 }} />
                </motion.div>
            ))}

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <motion.div variants={itemVariants}>
                        <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-2 mb-6"
                        >
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.08 }}
                                className="w-11 h-11 bg-gradient-to-br from-sky-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20"
                            >
                                <MdLocalPharmacy className="text-white" size={26} />
                            </motion.div>
                            <div>
                                <div className="font-bold text-xl text-white leading-none">AB Pharma</div>
                                <div className="text-[10px] uppercase tracking-wider text-sky-400">Smart Pharmacy</div>
                            </div>
                        </motion.div>

                        <p className="text-sm text-sky-200/60 leading-relaxed mb-6">
                            Your trusted online pharmacy for authentic medicines, health products, and professional healthcare advice.
                        </p>

                        <div className="flex items-center gap-3">
                            {SOCIAL_ICONS.map(({ Icon, href, hoverColor }, i) => (
                                <motion.a
                                    key={i}
                                    href={href}
                                    whileHover={{ y: -3, scale: 1.1, backgroundColor: hoverColor, color: 'white' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                                >
                                    <Icon size={15} />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={itemVariants}>
                        <motion.h3
                            whileHover={{ x: 4 }}
                            className="text-white font-bold mb-6 flex items-center gap-2"
                        >
                            <span className="w-1 h-5 rounded-full bg-sky-400 inline-block" />
                            Quick Links
                        </motion.h3>
                        <ul className="space-y-3 text-sm">
                            {QUICK_LINKS.map((link, i) => (
                                <motion.li
                                    key={i}
                                    custom={i}
                                    variants={linkVariants}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                >
                                    <Link
                                        to={link.to}
                                        className="group flex items-center gap-2 text-sky-200/60 hover:text-white transition-all duration-300"
                                    >
                                        <motion.span
                                            whileHover={{ x: 4 }}
                                            className="flex items-center gap-2"
                                        >
                                            <FiChevronRight size={12} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-5 group-hover:ml-0" />
                                            <span>{link.label}</span>
                                        </motion.span>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Categories */}
                    <motion.div variants={itemVariants}>
                        <motion.h3
                            whileHover={{ x: 4 }}
                            className="text-white font-bold mb-6 flex items-center gap-2"
                        >
                            <span className="w-1 h-5 rounded-full bg-emerald-400 inline-block" />
                            Categories
                        </motion.h3>
                        <ul className="space-y-3 text-sm">
                            {CATEGORIES.map((link, i) => (
                                <motion.li
                                    key={i}
                                    custom={i}
                                    variants={linkVariants}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                >
                                    <Link
                                        to={link.to}
                                        className="group flex items-center gap-2 text-sky-200/60 hover:text-white transition-all duration-300"
                                    >
                                        <motion.span
                                            whileHover={{ x: 4 }}
                                            className="flex items-center gap-2"
                                        >
                                            <FiChevronRight size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-5 group-hover:ml-0" />
                                            <span>{link.label}</span>
                                        </motion.span>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div variants={itemVariants}>
                        <motion.h3
                            whileHover={{ x: 4 }}
                            className="text-white font-bold mb-6 flex items-center gap-2"
                        >
                            <span className="w-1 h-5 rounded-full bg-sky-400 inline-block" />
                            Contact Us
                        </motion.h3>
                        <ul className="space-y-4 text-sm">
                            {CONTACTS.map(({ Icon, text }, i) => (
                                <motion.li
                                    key={i}
                                    custom={i}
                                    variants={linkVariants}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    className="flex items-start gap-3 group"
                                >
                                    <motion.span
                                        whileHover={{ scale: 1.15, color: '#38bdf8' }}
                                        className="mt-0.5 flex-shrink-0"
                                        style={{ color: 'rgba(56,189,248,0.6)' }}
                                    >
                                        <Icon size={16} />
                                    </motion.span>
                                    <span className="text-sky-200/60 group-hover:text-white transition-colors duration-300">{text}</span>
                                </motion.li>
                            ))}
                        </ul>

                        {/* Interactive mini badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="mt-8"
                        >
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }}
                                />
                                <span className="text-[11px] font-semibold text-sky-300/80">Response time: &lt; 2hrs</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="pt-8"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between text-xs">
                        <motion.p
                            whileHover={{ color: 'rgba(255,255,255,0.7)' }}
                            className="text-sky-200/40 mb-4 md:mb-0 flex items-center gap-2"
                        >
                            <span>�� {new Date().getFullYear()} AB Pharma Management System.</span>
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <FiHeart size={10} className="text-emerald-400" />
                            </motion.span>
                            <span>All rights reserved.</span>
                        </motion.p>
                        <div className="flex gap-5">
                            {[
                                { to: '/admin/login', label: 'Admin Login' },
                                { href: '#', label: 'Privacy Policy' },
                                { href: '#', label: 'Terms of Service' },
                            ].map((link, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -1 }}
                                >
                                    {link.to ? (
                                        <Link
                                            to={link.to}
                                            className="text-sky-200/40 hover:text-sky-300 transition-colors duration-300"
                                        >
                                            {link.label}
                                        </Link>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className="text-sky-200/40 hover:text-sky-300 transition-colors duration-300"
                                        >
                                            {link.label}
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    );
}
