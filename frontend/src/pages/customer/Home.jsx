import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    FiSearch, FiArrowRight, FiShield, FiTruck, FiClock, FiHeart,
    FiPackage, FiStar, FiMapPin, FiPhone, FiMail, FiChevronRight,
    FiPlus, FiShoppingCart, FiActivity, FiCheck, FiAward, FiUsers
} from 'react-icons/fi';
import { MdLocalPharmacy, MdMedication } from 'react-icons/md';
import useCartStore from '../../store/useCartStore';
import toast from 'react-hot-toast';
import axios from 'axios';

/* ETB ETB ETB  public API (no auth needed) ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
const pub = axios.create({ baseURL: '/api/public', timeout: 15000 });

/* ETB ETB ETB  animated counter ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
function Counter({ to, suffix = '' }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = Math.ceil(to / 60);
        const t = setInterval(() => {
            start += step;
            if (start >= to) { setVal(to); clearInterval(t); }
            else setVal(start);
        }, 20);
        return () => clearInterval(t);
    }, [inView, to]);
    return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ETB ETB ETB  skeleton card ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <div className="skeleton aspect-square" />
            <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-5 w-1/3 mt-3" />
            </div>
        </div>
    );
}

/* ETB ETB ETB  medicine card ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
function MedicineCard({ m, index }) {
    const addItem = useCartStore(s => s.addItem);
    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({ id: m.id, name: m.name, price: parseFloat(m.selling_price), image: m.image });
        toast.success(`${m.name} added to cart!`, { icon: 'ETB �' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
        >
            <Link
                to={`/medicines/${m.id}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300 hover:-translate-y-1"
            >
                <div className="relative aspect-square bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-6 overflow-hidden">
                    {/* Category badge */}
                    {m.category_name && (
                        <span className="absolute top-3 left-3 badge badge-info text-[10px] z-10">
                            {m.category_name}
                        </span>
                    )}
                    {/* Prescription badge */}
                    {m.requires_prescription === 1 && (
                        <span className="absolute top-3 right-3 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full z-10">Rx</span>
                    )}
                    {m.image ? (
                        <img src={m.image} alt={m.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg group-hover:scale-110 transition-transform">
                            {m.name?.charAt(0) || 'M'}
                        </div>
                    )}
                    {/* Quick add btn */}
                    <motion.button
                        onClick={handleAdd}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-sky-600 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-sky-600 hover:text-white z-10"
                    >
                        <FiPlus size={16} />
                    </motion.button>
                </div>

                <div className="p-4">
                    <h3 className="font-bold text-slate-800 mb-0.5 line-clamp-1 group-hover:text-sky-600 transition-colors text-sm">
                        {m.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-1">
                        {[m.strength, m.generic_name].filter(Boolean).join(' �� ')}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 text-base">{fmt(m.selling_price)}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.quantity > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                            {m.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cms, setCms] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [newsletter, setNewsletter] = useState('');
    const [nlStatus, setNlStatus] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            pub.get('/medicines?limit=8&featured=true').catch(() => ({ data: { data: [] } })),
            pub.get('/categories').catch(() => ({ data: { data: [] } })),
            pub.get('/medicines?limit=4&sort=newest').catch(() => ({ data: { data: [] } })),
        ]).then(([featRes, catRes]) => {
            setFeatured(featRes.data.data || []);
            setCategories(catRes.data.data || []);
            setLoading(false);
        });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/medicines?search=${encodeURIComponent(searchQuery)}`);
    };

    const handleNewsletter = async (e) => {
        e.preventDefault();
        if (!newsletter.trim()) return;
        try {
            await pub.post('/newsletter', { email: newsletter });
            setNlStatus('success');
            setNewsletter('');
            toast.success('Subscribed successfully! ETB �');
        } catch {
            setNlStatus('error');
            toast.error('Subscription failed. Please try again.');
        }
    };

    const STATS = [
        { label: 'Medicines', value: 500, suffix: '+', icon: MdMedication, color: '#0ea5e9' },
        { label: 'Happy Patients', value: 12000, suffix: '+', icon: FiUsers, color: '#059669' },
        { label: 'Licensed', value: 100, suffix: '%', icon: FiAward, color: '#7c3aed' },
        { label: 'Support', value: 24, suffix: '/7', icon: FiActivity, color: '#ea580c' },
    ];

    const SERVICES = [
        { icon: FiShield, title: '100% Genuine', desc: 'All medicines sourced from certified, authorized distributors with verified supply chains.', color: '#0ea5e9', bg: '#e0f2fe' },
        { icon: FiClock, title: '24/7 Support', desc: 'Our pharmacists are always available — call, chat, or email anytime for expert medical advice.', color: '#7c3aed', bg: '#ede9fe' },
        { icon: FiHeart, title: 'Health Records', desc: 'Securely store your prescriptions, order history, and health records in one trusted place.', color: '#ea580c', bg: '#ffedd5' },
        { icon: FiActivity, title: 'Expert Consultation', desc: 'Get professional pharmacist advice on medication dosage, interactions, and general health care.', color: '#059669', bg: '#dcfce7' },
    ];

    const WHY_US = [
        'Licensed & Certified Pharmacists',
        'Automated Prescription Refills',
        'Affordable Healthcare Solutions',
        'Real-time Inventory Updates',
        'Secure Payment Processing',
        'Expert Pharmacist Consultations',
    ];

    return (
        <div style={{ fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  HERO ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <section style={{
                background: 'linear-gradient(135deg, #0c2340 0%, #0369a1 45%, #0891b2 72%, #059669 100%)',
                padding: '140px 0 80px', position: 'relative', overflow: 'hidden',
            }}>
                {/* Animated background blobs */}
                {[
                    { w: 400, h: 400, top: '-10%', right: '-5%', c: 'rgba(255,255,255,0.04)' },
                    { w: 300, h: 300, bottom: '-10%', left: '10%', c: 'rgba(14,165,233,0.1)' },
                    { w: 200, h: 200, top: '20%', left: '60%', c: 'rgba(5,150,105,0.08)' },
                ].map((blob, i) => (
                    <motion.div key={i}
                        style={{
                            position: 'absolute', width: blob.w, height: blob.h,
                            top: blob.top, bottom: blob.bottom, left: blob.left, right: blob.right,
                            borderRadius: '50%', background: blob.c, pointerEvents: 'none',
                        }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}

                {/* Floating medical cross decors */}
                {[
                    { top: '15%', left: '3%', size: 20 }, { top: '60%', left: '7%', size: 14 },
                    { top: '25%', right: '4%', size: 18 }, { top: '70%', right: '8%', size: 12 },
                    { top: '45%', left: '50%', size: 10 }, { top: '10%', left: '28%', size: 16 },
                ].map((d, i) => (
                    <motion.div key={i}
                        style={{ position: 'absolute', top: d.top, left: d.left, right: d.right, opacity: 0.2, pointerEvents: 'none' }}
                        animate={{ y: [0, -12, 0], rotate: [0, 20, 0] }}
                        transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    >
                        <svg width={d.size} height={d.size} viewBox="0 0 24 24" fill="white">
                            <rect x="9" y="2" width="6" height="20" rx="2" />
                            <rect x="2" y="9" width="20" height="6" rx="2" />
                        </svg>
                    </motion.div>
                ))}

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
                        <div style={{ maxWidth: 640 }}>
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                    color: 'white', padding: '6px 16px', borderRadius: 999,
                                    fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                                    border: '1px solid rgba(255,255,255,0.2)', marginBottom: 24, marginTop: 0,
                                }}>
                                    <motion.span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }}
                                        animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                    24/7 Digital Pharmacy
                                </span>

                                <h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 20, margin: '0 0 20px' }}>
                                    {cms.hero_title || 'Your Health Is Our'}{' '}
                                    <span style={{ background: 'linear-gradient(90deg,#7dd3fc,#86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        Top Priority
                                    </span>
                                </h1>

                                <p style={{ fontSize: 17, color: 'rgba(186,230,253,0.85)', lineHeight: 1.7, marginBottom: 32, margin: '0 0 32px' }}>
                                    {cms.hero_subtitle || 'Get genuine medicines delivered to your doorstep. Order online or scan our QR code at the physical store for contactless pickup.'}
                                </p>
                            </motion.div>

                            {/* Search bar */}
                            <motion.form onSubmit={handleSearch}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                                style={{ display: 'flex', background: 'white', borderRadius: 16, padding: 6, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: 600 }}
                            >
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
                                    <FiSearch style={{ color: '#94a3b8', flexShrink: 0 }} size={20} />
                                    <input
                                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search medicines, vitamins, supplements..."
                                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: '#1e293b', padding: '10px 0', background: 'transparent' }}
                                    />
                                </div>
                                <motion.button type="submit"
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    style={{
                                        background: 'linear-gradient(135deg,#0ea5e9,#059669)',
                                        color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px',
                                        fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                    <FiSearch size={15} /> Search
                                </motion.button>
                            </motion.form>

                            {/* Quick category pills */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}
                            >
                                {['Antibiotics', 'Vitamins', 'Pain Relief', 'Diabetes', 'Heart'].map(tag => (
                                    <button key={tag}
                                        onClick={() => navigate(`/medicines?search=${tag}`)}
                                        style={{
                                            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'rgba(255,255,255,0.85)', padding: '5px 14px', borderRadius: 999,
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.25)'; e.target.style.color = 'white'; }}
                                        onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.color = 'rgba(255,255,255,0.85)'; }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </motion.div>
                        </div>

                        {/* Hero image / illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.7, type: 'spring' }}
                            style={{ display: 'none' }}
                            className="hidden lg:block"
                        />
                    </div>
                </div>
            </section>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  FEATURE CARDS ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <section style={{ marginTop: -40, position: 'relative', zIndex: 20, padding: '0 24px 20px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
                        {SERVICES.map((s, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                                style={{
                                    background: 'white', borderRadius: 20, padding: '24px 20px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
                                    display: 'flex', alignItems: 'flex-start', gap: 16, cursor: 'default',
                                    transition: 'box-shadow 0.3s',
                                }}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14, background: s.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <s.icon size={22} color={s.color} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 800, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>{s.title}</h3>
                                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  STATS ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <section style={{ padding: '60px 24px', background: 'linear-gradient(135deg,#f0f9ff,#ecfdf5)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
                        {STATS.map((s, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                style={{ textAlign: 'center', background: 'white', borderRadius: 20, padding: '28px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                            >
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${s.color}18`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <s.icon size={24} color={s.color} />
                                </div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                                    <Counter to={s.value} suffix={s.suffix} />
                                </div>
                                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {s.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  CATEGORIES ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            {categories.length > 0 && (
                <section style={{ padding: '60px 24px 20px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
                            <div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Browse by</span>
                                <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, color: '#1e293b', marginTop: 4 }}>Medicine Categories</h2>
                            </div>
                            <Link to="/medicines" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0ea5e9', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                                View All <FiArrowRight />
                            </Link>
                        </div>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <motion.button
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => { setActiveCategory(null); navigate('/medicines'); }}
                                style={{
                                    padding: '10px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13,
                                    background: activeCategory === null ? 'linear-gradient(135deg,#0ea5e9,#059669)' : '#f1f5f9',
                                    color: activeCategory === null ? 'white' : '#475569',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >All</motion.button>
                            {categories.slice(0, 10).map(cat => (
                                <motion.button key={cat.id}
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    onClick={() => { setActiveCategory(cat.id); navigate(`/medicines?category_id=${cat.id}`); }}
                                    style={{
                                        padding: '10px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13,
                                        background: activeCategory === cat.id ? 'linear-gradient(135deg,#0ea5e9,#059669)' : '#f1f5f9',
                                        color: activeCategory === cat.id ? 'white' : '#475569',
                                        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}
                                >
                                    {cat.name}
                                    {cat.medicine_count > 0 && (
                                        <span style={{
                                            background: activeCategory === cat.id ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                                            color: activeCategory === cat.id ? 'white' : '#64748b',
                                            fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                                        }}>
                                            {cat.medicine_count}
                                        </span>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  FEATURED MEDICINES ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <section style={{ padding: '40px 24px 60px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
                        <div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Popular</span>
                            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, color: '#1e293b', marginTop: 4 }}>Featured Products</h2>
                            <p style={{ color: '#64748b', fontSize: 14 }}>Popular and highly recommended health products</p>
                        </div>
                        <Link to="/medicines" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0ea5e9', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                            View All <FiArrowRight />
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 20 }}>
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                            : featured.length > 0
                                ? featured.map((m, i) => <MedicineCard key={m.id} m={m} index={i} />)
                                : (
                                    // Fallback placeholder when no data from DB yet
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
                                        <MdLocalPharmacy size={64} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
                                        <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 16 }}>
                                            No featured products yet
                                        </p>
                                        <p style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>
                                            Add medicines via the{' '}
                                            <Link to="/admin/medicines" style={{ color: '#0ea5e9' }}>Admin Dashboard</Link>
                                            {' '}and mark them as featured.
                                        </p>
                                    </div>
                                )
                        }
                    </div>

                    {!loading && featured.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: 36 }}>
                            <motion.div>
                                <Link to="/medicines"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 10,
                                        background: 'linear-gradient(135deg,#0ea5e9,#059669)',
                                        color: 'white', padding: '14px 36px', borderRadius: 14,
                                        fontWeight: 700, fontSize: 14, textDecoration: 'none',
                                        boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
                                    }}
                                >
                                    Shop All Medicines <FiArrowRight />
                                </Link>
                            </motion.div>
                        </div>
                    )}
                </div>
            </section>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  ABOUT SECTION ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <section style={{ padding: '80px 24px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(14,165,233,0.04)', top: -80, right: -60, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(5,150,105,0.05)', bottom: -60, left: -40, pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
                    {/* Left: animated illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                        style={{ position: 'relative' }}
                    >
                        <div style={{
                            aspectRatio: '1', borderRadius: 32, overflow: 'hidden',
                            background: 'linear-gradient(145deg,#e0f2fe,#dcfce7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                        }}>
                            {/* Big logo */}
                            <img src="/logo.png" alt="AB Pharma" style={{ width: '65%', height: '65%', objectFit: 'contain', borderRadius: '50%' }}
                                onError={e => e.target.style.display = 'none'} />

                            {/* Floating stat cards */}
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    position: 'absolute', top: '12%', right: '-8%',
                                    background: 'white', borderRadius: 16, padding: '12px 16px',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiPackage size={18} color="#0ea5e9" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0ea5e9' }}>500+</div>
                                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>MEDICINES</div>
                                </div>
                            </motion.div>

                            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity }}
                                style={{
                                    position: 'absolute', bottom: '12%', left: '-8%',
                                    background: 'white', borderRadius: 16, padding: '12px 16px',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiStar size={18} color="#059669" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>4.9ETB </div>
                                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>RATING</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decorative circles behind card */}
                        <div style={{ position: 'absolute', inset: -20, borderRadius: 40, border: '1.5px dashed rgba(14,165,233,0.15)', zIndex: -1 }} />
                    </motion.div>

                    {/* Right: text */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                    >
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                            About Us
                        </span>
                        <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.5rem)', fontWeight: 900, color: '#1e293b', lineHeight: 1.25, margin: '12px 0 20px' }}>
                            Committed To Your <span style={{ color: '#059669' }}>Better Health</span>
                        </h2>
                        <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15, marginBottom: 28 }}>
                            {cms.about_text || 'AB Pharma is a modern pharmacy management solution designed to bridge the gap between healthcare and technology. We provide you with easy access to genuine medications, expert advice, and fast delivery.'}
                        </p>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                            {WHY_US.map((item, i) => (
                                <motion.li key={i}
                                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151', fontWeight: 600 }}
                                >
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#dcfce7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11 }}>
                                        <FiCheck />
                                    </div>
                                    {item}
                                </motion.li>
                            ))}
                        </ul>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <Link to="/contact" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'linear-gradient(135deg,#0ea5e9,#059669)',
                                color: 'white', padding: '13px 28px', borderRadius: 12,
                                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                                boxShadow: '0 6px 20px rgba(14,165,233,0.3)',
                            }}>
                                Contact Us Today <FiArrowRight />
                            </Link>
                            <Link to="/services" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'white', border: '2px solid #e2e8f0',
                                color: '#475569', padding: '13px 28px', borderRadius: 12,
                                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                            }}>
                                Our Services
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  HOW IT WORKS ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <section style={{ padding: '80px 24px', background: 'linear-gradient(160deg,#f8fafc,#f0f9ff)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Simple Process</span>
                        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, color: '#1e293b', marginTop: 8 }}>How It Works</h2>
                        <p style={{ color: '#64748b', marginTop: 8, maxWidth: 500, margin: '8px auto 0' }}>
                            Order your medicines in 3 easy steps and get them delivered to your door
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 32, position: 'relative' }}>
                        {[
                            { step: '01', icon: FiSearch, title: 'Search Medicine', desc: 'Browse our catalog or search by name, brand, or generic name.', color: '#0ea5e9', bg: '#e0f2fe' },
                            { step: '02', icon: FiShoppingCart, title: 'Add to Cart', desc: 'Select quantity, check stock availability, and add to your cart.', color: '#059669', bg: '#dcfce7' },
                            { step: '03', icon: FiHeart, title: 'Pickup & Stay Healthy', desc: 'Complete payment and pick up your order from our pharmacy. Track and reorder with ease.', color: '#7c3aed', bg: '#ede9fe' },
                            { step: '04', icon: FiHeart, title: 'Stay Healthy', desc: 'Track your order, reorder easily, and manage your health records.', color: '#ea580c', bg: '#ffedd5' },
                        ].map((s, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: '50%', background: s.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                                        border: `2px solid ${s.color}22`,
                                    }}>
                                        <s.icon size={28} color={s.color} />
                                    </div>
                                    <span style={{
                                        position: 'absolute', top: -6, right: -6, width: 24, height: 24,
                                        background: s.color, color: 'white', borderRadius: '50%',
                                        fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>{i + 1}</span>
                                </div>
                                <h3 style={{ fontWeight: 800, fontSize: 16, color: '#1e293b', marginBottom: 8 }}>{s.title}</h3>
                                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65 }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  NEWSLETTER ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <section style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'linear-gradient(135deg,#0c2340,#0369a1,#059669)',
                            borderRadius: 28, padding: '56px 40px', textAlign: 'center',
                            position: 'relative', overflow: 'hidden',
                        }}
                    >
                        {/* Background decors */}
                        {[{ top: -40, right: -40 }, { bottom: -40, left: -40 }].map((pos, i) => (
                            <div key={i} style={{
                                position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)', ...pos, pointerEvents: 'none',
                            }} />
                        ))}

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Stay Updated
                            </span>
                            <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: 'white', margin: '12px 0 12px' }}>
                                Subscribe for Health Tips & Offers
                            </h2>
                            <p style={{ color: 'rgba(186,230,253,0.8)', marginBottom: 32, fontSize: 14 }}>
                                Get the latest health tips, exclusive discounts, and new medicine arrivals straight to your inbox.
                            </p>

                            <form onSubmit={handleNewsletter}
                                style={{ display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto', background: 'rgba(255,255,255,0.12)', padding: 6, borderRadius: 14, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <input
                                    type="email" value={newsletter} onChange={e => setNewsletter(e.target.value)}
                                    placeholder="Enter your email address..."
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, padding: '10px 14px' }}
                                />
                                <motion.button type="submit"
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    style={{
                                        background: 'white', color: '#0369a1', border: 'none',
                                        borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                    }}>
                                    Subscribe
                                </motion.button>
                            </form>

                            {nlStatus === 'success' && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ color: '#86efac', fontSize: 13, marginTop: 12, fontWeight: 600 }}>
                                    ETB  Successfully subscribed! Thank you.
                                </motion.p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  CONTACT QUICK ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <section style={{ padding: '0 24px 80px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
                        {[
                            { icon: FiMapPin, label: 'Visit Us', value: '123 Health Avenue, Medical District', color: '#0ea5e9', bg: '#e0f2fe', link: '#' },
                            { icon: FiPhone, label: 'Call Us', value: '+234 800 000 0000', color: '#059669', bg: '#dcfce7', link: 'tel:+2348000000000' },
                            { icon: FiMail, label: 'Email Us', value: 'support@abpharma.com', color: '#7c3aed', bg: '#ede9fe', link: 'mailto:support@abpharma.com' },
                            { icon: FiClock, label: 'Open Hours', value: 'MonETB Sat: 8am ETB  10pm', color: '#ea580c', bg: '#ffedd5', link: '#' },
                        ].map((c, i) => (
                            <motion.a key={i} href={c.link}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    background: 'white', border: '1px solid #f1f5f9',
                                    borderRadius: 18, padding: '20px 24px',
                                    textDecoration: 'none', transition: 'all 0.2s',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                }}
                            >
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <c.icon size={22} color={c.color} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{c.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{c.value}</div>
                                </div>
                                <FiChevronRight size={16} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
