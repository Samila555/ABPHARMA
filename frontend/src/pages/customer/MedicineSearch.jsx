import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiShield, FiX, FiArrowLeft, FiSliders, FiChevronRight, FiPackage } from 'react-icons/fi';
import { MdLocalPharmacy } from 'react-icons/md';
import axios from 'axios';
import useCartStore from '../../store/useCartStore';
import toast from 'react-hot-toast';

const pub = axios.create({ baseURL: '/api/public', timeout: 15000 });

export default function MedicineSearch() {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addItem } = useCartStore();

    const querySearch = searchParams.get('search') || '';
    const queryCat = searchParams.get('category') || '';
    const queryRx = searchParams.get('rx') || '';

    const [filters, setFilters] = useState({ search: querySearch, category_id: queryCat, rx: queryRx, page: 1, limit: 12 });
    const [liveSearch, setLiveSearch] = useState(querySearch);

    useEffect(() => {
        pub.get('/categories').then(r => setCategories(r.data.data || [])).catch(() => { });
    }, []);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.search) params.append('search', filters.search);
                if (filters.category_id) params.append('category_id', filters.category_id);
                if (filters.rx === 'yes') params.append('requires_prescription', 'true');
                if (filters.rx === 'no') params.append('requires_prescription', 'false');
                params.append('status', 'available');
                params.append('page', filters.page);
                params.append('limit', filters.limit);
                const res = await pub.get(`/medicines?${params}`);
                setMedicines(res.data.data);
                setTotal(res.data.total);
            } catch { toast.error('Failed to load medicines'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [filters]);

    const applySearch = () => {
        setSearchParams({ search: liveSearch, category: filters.category_id, rx: filters.rx });
        setFilters(f => ({ ...f, search: liveSearch, page: 1 }));
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter') applySearch(); };

    const handleClear = () => {
        setLiveSearch('');
        setSearchParams({});
        setFilters({ search: '', category_id: '', rx: '', page: 1, limit: 12 });
    };

    const selectCategory = (id) => {
        setFilters(f => ({ ...f, category_id: id, page: 1 }));
        setSearchParams({ search: liveSearch, category: id, rx: filters.rx });
    };

    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    const catColors = [
        '#0ea5e9', '#8b5cf6', '#059669', '#f59e0b', '#ef4444',
        '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f9ff 0%,#f8fafc 60%,#f0fdf4 100%)', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>

            {/* ETB ETB  TOP HEADER BAR ETB ETB  */}
            <div style={{ background: 'linear-gradient(135deg,#0c2340 0%,#0369a1 60%,#059669 100%)', padding: '72px 0 48px', position: 'relative', overflow: 'hidden' }}>
                {/* Blobs */}
                <div style={{ position: 'absolute', width: 500, height: 500, top: '-20%', right: '-5%', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 300, height: 300, bottom: '-30%', left: '5%', borderRadius: '50%', background: 'rgba(14,165,233,0.08)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(186,230,253,0.85)', textDecoration: 'none', fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', padding: '7px 16px', borderRadius: 999, marginBottom: 24, transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <FiArrowLeft size={14} /> Back to Home
                    </Link>
                    <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: 'white', margin: '0 0 10px', letterSpacing: '-0.03em' }}>
                        Medicine Directory
                    </h1>
                    <p style={{ color: 'rgba(186,230,253,0.75)', fontSize: 15, margin: '0 0 28px', fontWeight: 500 }}>
                        Browse {total > 0 ? total : 'our complete collection of'} medications across all categories
                    </p>

                    {/* Search bar */}
                    <div style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxWidth: 680 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12 }}>
                            <FiSearch style={{ color: '#94a3b8', flexShrink: 0 }} size={20} />
                            <input
                                value={liveSearch}
                                onChange={e => setLiveSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search by name, brand, generic..."
                                style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, color: '#1e293b', padding: '16px 0', background: 'transparent', fontWeight: 500 }}
                            />
                            {liveSearch && (
                                <button onClick={() => { setLiveSearch(''); setFilters(f => ({ ...f, search: '', page: 1 })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 4 }}>
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>
                        <button onClick={applySearch} style={{ background: 'linear-gradient(135deg,#0ea5e9,#059669)', color: 'white', border: 'none', padding: '0 32px', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'opacity 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <FiSearch size={16} /> Search
                        </button>
                    </div>
                </div>
            </div>

            {/* ETB ETB  MAIN CONTENT ETB ETB  */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 28px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

                {/* ETB ETB  SIDEBAR ETB ETB  */}
                <aside style={{ width: sidebarOpen ? 280 : 56, flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
                    <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden', position: 'sticky', top: 24 }}>
                        {/* Sidebar Header */}
                        <div style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {sidebarOpen && <span style={{ color: 'white', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><FiSliders size={16} /> Filters</span>}
                            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', marginLeft: sidebarOpen ? 0 : 'auto', transition: 'transform 0.3s', transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                                <FiChevronRight size={16} />
                            </button>
                        </div>

                        {sidebarOpen && (
                            <div style={{ padding: 20 }}>
                                {/* Active indicator */}
                                {(filters.search || filters.category_id || filters.rx) && (
                                    <button onClick={handleClear} style={{ width: '100%', padding: '8px 14px', borderRadius: 10, border: '1.5px dashed #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
                                        <FiX size={13} /> Clear All Filters
                                    </button>
                                )}

                                {/* Category Section */}
                                <div style={{ marginBottom: 24 }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>Category</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                                        {/* All */}
                                        <button onClick={() => selectCategory('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: filters.category_id === '' ? 'linear-gradient(135deg,#eff6ff,#eef2ff)' : 'transparent', color: filters.category_id === '' ? '#1d4ed8' : '#475569', fontWeight: 700, fontSize: 13, transition: 'all 0.15s' }}
                                            onMouseEnter={e => { if (filters.category_id !== '') e.currentTarget.style.background = '#f8fafc'; }}
                                            onMouseLeave={e => { if (filters.category_id !== '') e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: filters.category_id === '' ? '#3b82f6' : '#cbd5e1', flexShrink: 0 }} />
                                                All Categories
                                            </span>
                                            <span style={{ fontSize: 11, fontWeight: 800, background: filters.category_id === '' ? '#3b82f6' : '#e2e8f0', color: filters.category_id === '' ? 'white' : '#94a3b8', padding: '2px 7px', borderRadius: 999 }}>{total}</span>
                                        </button>

                                        {categories.map((c, i) => (
                                            <button key={c.id} onClick={() => selectCategory(c.id.toString())} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: filters.category_id === c.id.toString() ? `${catColors[i % catColors.length]}14` : 'transparent', color: filters.category_id === c.id.toString() ? catColors[i % catColors.length] : '#475569', fontWeight: 700, fontSize: 13, transition: 'all 0.15s', textAlign: 'left' }}
                                                onMouseEnter={e => { if (filters.category_id !== c.id.toString()) e.currentTarget.style.background = '#f8fafc'; }}
                                                onMouseLeave={e => { if (filters.category_id !== c.id.toString()) e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColors[i % catColors.length], flexShrink: 0, opacity: filters.category_id === c.id.toString() ? 1 : 0.4 }} />
                                                    {c.name}
                                                </span>
                                                {c.medicine_count > 0 && <span style={{ fontSize: 11, fontWeight: 800, background: filters.category_id === c.id.toString() ? catColors[i % catColors.length] : '#e2e8f0', color: filters.category_id === c.id.toString() ? 'white' : '#94a3b8', padding: '2px 7px', borderRadius: 999 }}>{c.medicine_count}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Prescription Section */}
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 12 }}>Prescription</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {[
                                            { id: '', label: 'All Items', color: '#6366f1' },
                                            { id: 'no', label: 'Over-the-counter (OTC)', color: '#059669' },
                                            { id: 'yes', label: 'Prescription Only (Rx)', color: '#f59e0b' },
                                        ].map(opt => (
                                            <button key={opt.id} onClick={() => setFilters(f => ({ ...f, rx: opt.id, page: 1 }))} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: filters.rx === opt.id ? `${opt.color}12` : 'transparent', color: filters.rx === opt.id ? opt.color : '#475569', fontWeight: 700, fontSize: 13, transition: 'all 0.15s', textAlign: 'left' }}
                                                onMouseEnter={e => { if (filters.rx !== opt.id) e.currentTarget.style.background = '#f8fafc'; }}
                                                onMouseLeave={e => { if (filters.rx !== opt.id) e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2.5px solid ${filters.rx === opt.id ? opt.color : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                                    {filters.rx === opt.id && <div style={{ width: 7, height: 7, borderRadius: '50%', background: opt.color }} />}
                                                </div>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ETB ETB  PRODUCT GRID ETB ETB  */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    {/* Grid header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                                {filters.category_id ? categories.find(c => c.id.toString() === filters.category_id)?.name || 'Medicines' : 'All Medicines'}
                            </h2>
                            <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                                {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.7)' }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Live Stock</span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} style={{ borderRadius: 20, overflow: 'hidden', background: 'white' }}>
                                    <div style={{ height: 200, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                                    <div style={{ padding: 16 }}>
                                        <div style={{ height: 14, borderRadius: 7, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 8 }} />
                                        <div style={{ height: 12, borderRadius: 6, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', width: '60%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : medicines.length > 0 ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                                {medicines.map((m, idx) => (
                                    <MedicineCard key={m.id} m={m} catColors={catColors} idx={idx} addItem={addItem} fmt={fmt} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {total > filters.limit && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 48 }}>
                                    <button onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))} disabled={filters.page === 1}
                                        style={{ padding: '10px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, fontSize: 13, cursor: filters.page === 1 ? 'not-allowed' : 'pointer', opacity: filters.page === 1 ? 0.5 : 1, transition: 'all 0.2s' }}
                                        onMouseEnter={e => { if (filters.page !== 1) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >ETB  Previous</button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {Array.from({ length: Math.min(5, Math.ceil(total / filters.limit)) }, (_, i) => {
                                            const pg = i + 1;
                                            return (
                                                <button key={pg} onClick={() => setFilters(f => ({ ...f, page: pg }))} style={{ width: 38, height: 38, borderRadius: 10, border: 'none', background: filters.page === pg ? 'linear-gradient(135deg,#0ea5e9,#059669)' : 'white', color: filters.page === pg ? 'white' : '#64748b', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: filters.page === pg ? '0 4px 12px rgba(14,165,233,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}>
                                                    {pg}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page * filters.limit >= total}
                                        style={{ padding: '10px 22px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, fontSize: 13, cursor: filters.page * filters.limit >= total ? 'not-allowed' : 'pointer', opacity: filters.page * filters.limit >= total ? 0.5 : 1, transition: 'all 0.2s' }}
                                        onMouseEnter={e => { if (filters.page * filters.limit < total) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >Next ETB </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ background: 'white', borderRadius: 24, padding: '80px 40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg,#f0f9ff,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <MdLocalPharmacy size={40} style={{ color: '#a5b4fc' }} />
                            </div>
                            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>No medicines found</h3>
                            <p style={{ color: '#64748b', fontSize: 15, maxWidth: 400, margin: '0 auto 28px' }}>
                                No products match your search or filters. Try adjusting them.
                            </p>
                            <button onClick={handleClear} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#0ea5e9,#059669)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                                <FiX size={16} /> Clear Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
            `}</style>
        </div>
    );
}

function MedicineCard({ m, catColors, idx, addItem, fmt }) {
    const [hovered, setHovered] = useState(false);
    const [addedAnim, setAddedAnim] = useState(false);
    const color = catColors[idx % catColors.length];

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(m);
        toast.success(`${m.name} added to cart! ETB �`);
        setAddedAnim(true);
        setTimeout(() => setAddedAnim(false), 700);
    };

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'white',
                borderRadius: 20,
                boxShadow: hovered ? `0 20px 48px rgba(0,0,0,0.12), 0 0 0 2px ${color}30` : '0 4px 16px rgba(0,0,0,0.06)',
                transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                animation: 'fadeUp 0.4s ease both',
                animationDelay: `${idx * 0.05}s`,
                position: 'relative',
            }}
        >
            {/* Top color bar */}
            <div style={{ height: 4, background: `linear-gradient(90deg,${color},${color}aa)`, opacity: hovered ? 1 : 0.5, transition: 'opacity 0.3s' }} />

            {/* Image area */}
            <Link to={`/medicines/${m.id}`} style={{ display: 'block', position: 'relative', background: `linear-gradient(135deg,${color}08,${color}14)`, padding: '28px 20px 20px', textDecoration: 'none', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {/* Category badge */}
                <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 800, color: color, background: `${color}18`, border: `1px solid ${color}30`, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.category_name || 'General'}
                </span>

                {/* Rx badge */}
                {m.requires_prescription && (
                    <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 800, color: '#d97706', background: '#fef3c7', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiShield size={9} /> Rx
                    </span>
                )}

                {m.image ? (
                    <img src={m.image} alt={m.name} style={{ width: '100%', maxHeight: 120, objectFit: 'contain', transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
                ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg,${color}22,${color}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hovered ? 'scale(1.08) rotate(5deg)' : 'scale(1)', transition: 'transform 0.4s ease', boxShadow: `0 8px 24px ${color}30` }}>
                        <span style={{ fontSize: 32, fontWeight: 900, color: color }}>{m.name?.charAt(0)}</span>
                    </div>
                )}

                {/* Stock indicator */}
                <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.quantity > 0 ? '#10b981' : '#ef4444', boxShadow: m.quantity > 0 ? '0 0 6px rgba(16,185,129,0.7)' : 'none' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: m.quantity > 0 ? '#059669' : '#dc2626' }}>{m.quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
            </Link>

            {/* Info area */}
            <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link to={`/medicines/${m.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.2s', ...(hovered ? { color } : {}) }}>
                        {m.name}
                    </h3>
                    <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[m.strength, m.generic_name || m.brand_name].filter(Boolean).join(' �� ') || 'General Medicine'}
                    </p>
                </Link>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Price</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>{fmt(m.selling_price)}</div>
                    </div>
                    <button
                        onClick={handleAdd}
                        style={{
                            width: 42, height: 42, borderRadius: 14, border: 'none', cursor: 'pointer',
                            background: addedAnim ? '#059669' : (hovered ? color : `${color}18`),
                            color: addedAnim ? 'white' : (hovered ? 'white' : color),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                            transform: addedAnim ? 'scale(1.2)' : (hovered ? 'scale(1.05)' : 'scale(1)'),
                            boxShadow: hovered ? `0 6px 16px ${color}40` : 'none',
                        }}
                    >
                        <FiShoppingCart size={17} />
                    </button>
                </div>
            </div>
        </div>
    );
}
