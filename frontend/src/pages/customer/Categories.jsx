import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiPackage } from 'react-icons/fi';
import { MdLocalPharmacy } from 'react-icons/md';
import axios from 'axios';

const pub = axios.create({ baseURL: '/api/public', timeout: 15000 });

const CAT_GRADIENTS = [
    ['#0ea5e9', '#6366f1'], ['#059669', '#0ea5e9'], ['#8b5cf6', '#ec4899'],
    ['#f59e0b', '#ef4444'], ['#06b6d4', '#059669'], ['#ec4899', '#8b5cf6'],
    ['#f97316', '#f59e0b'], ['#14b8a6', '#06b6d4'], ['#6366f1', '#8b5cf6'],
    ['#ef4444', '#f97316'], ['#0ea5e9', '#14b8a6'], ['#059669', '#6366f1'],
    ['#8b5cf6', '#0ea5e9'], ['#f59e0b', '#ec4899'], ['#06b6d4', '#f97316'],
    ['#ec4899', '#ef4444'], ['#14b8a6', '#8b5cf6'], ['#6366f1', '#059669'],
];

const CAT_ICONS = ['ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB �', 'ETB ETB '];

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [medicines, setMedicines] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const catRes = await pub.get('/categories');
                const cats = catRes.data.data || [];
                setCategories(cats);

                // Load a few preview medicines per category
                const previews = {};
                await Promise.all(cats.slice(0, 8).map(async (c) => {
                    try {
                        const r = await pub.get(`/medicines?category_id=${c.id}&limit=3`);
                        previews[c.id] = r.data.data || [];
                    } catch { previews[c.id] = []; }
                }));
                setMedicines(previews);
            } catch { }
            finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f9ff 0%,#f8fafc 60%,#f0fdf4 100%)', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>

            {/* Hero Header */}
            <div style={{ background: 'linear-gradient(135deg,#0c2340 0%,#0369a1 55%,#059669 100%)', padding: '80px 0 56px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 600, height: 600, top: '-20%', right: '-8%', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 400, height: 400, bottom: '-30%', left: '5%', borderRadius: '50%', background: 'rgba(14,165,233,0.07)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(186,230,253,0.85)', textDecoration: 'none', fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', padding: '7px 16px', borderRadius: 999, marginBottom: 28 }}>
                        <FiArrowLeft size={14} /> Back to Home
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 12 }}>Browse by Category</span>
                            <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
                                Medicine Categories
                            </h1>
                            <p style={{ color: 'rgba(186,230,253,0.75)', fontSize: 15, fontWeight: 500, margin: 0 }}>
                                {loading ? 'Loading categories...' : `${categories.length} categories �� Browse and shop by type`}
                            </p>
                        </div>
                        <Link to="/medicines" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: 14, fontWeight: 700, fontSize: 14 }}>
                            View All Medicines <FiArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 80px' }}>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
                        {Array(12).fill(0).map((_, i) => (
                            <div key={i} style={{ height: 200, borderRadius: 24, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
                        {categories.map((cat, i) => (
                            <CategoryCard
                                key={cat.id}
                                cat={cat}
                                gradient={CAT_GRADIENTS[i % CAT_GRADIENTS.length]}
                                icon={CAT_ICONS[i % CAT_ICONS.length]}
                                preview={medicines[cat.id] || []}
                                index={i}
                            />
                        ))}
                    </div>
                )}

                {!loading && categories.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <MdLocalPharmacy size={64} style={{ color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
                        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#475569', marginBottom: 8 }}>No categories yet</h3>
                        <p style={{ color: '#94a3b8' }}>Categories will appear here once added by the admin.</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
            `}</style>
        </div>
    );
}

function CategoryCard({ cat, gradient, icon, preview, index }) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            to={`/medicines?category=${cat.id}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'white',
                borderRadius: 24,
                overflow: 'hidden',
                textDecoration: 'none',
                display: 'block',
                boxShadow: hovered ? `0 24px 56px rgba(0,0,0,0.12), 0 0 0 2px ${gradient[0]}40` : '0 4px 20px rgba(0,0,0,0.06)',
                transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                animation: 'fadeUp 0.4s ease both',
                animationDelay: `${index * 0.04}s`,
            }}
        >
            {/* Gradient Banner */}
            <div style={{ background: `linear-gradient(135deg,${gradient[0]},${gradient[1]})`, padding: '28px 24px 20px', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -30, right: -20 }} />
                <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -15, left: 20 }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 40, marginBottom: 12, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>{icon}</div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{cat.name}</h3>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '6px 12px', textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: 'white', lineHeight: 1 }}>{cat.medicine_count || 0}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Items</div>
                    </div>
                </div>
            </div>

            {/* Bottom content */}
            <div style={{ padding: '16px 20px 20px' }}>
                {cat.description && (
                    <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 14, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cat.description}
                    </p>
                )}

                {/* Medicine preview pills */}
                {preview.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                        {preview.map(m => (
                            <span key={m.id} style={{ fontSize: 11, fontWeight: 700, color: gradient[0], background: `${gradient[0]}12`, border: `1px solid ${gradient[0]}25`, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {m.name}
                            </span>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: gradient[0] }}>Browse all ETB </span>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${gradient[0]}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hovered ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.2s' }}>
                        <FiArrowRight size={15} style={{ color: gradient[0] }} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
