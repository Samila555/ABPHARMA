import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { MdLocalPharmacy } from 'react-icons/md';
import axios from 'axios';

const pub = axios.create({ baseURL: '/api/public', timeout: 15000 });

const CAT_GRADIENTS = [
    ['#3b82f6', '#6366f1'],
    ['#14b8a6', '#06b6d4'],
    ['#8b5cf6', '#ec4899'],
    ['#f97316', '#ef4444'],
    ['#0ea5e9', '#14b8a6'],
    ['#059669', '#10b981'],
    ['#ec4899', '#f43f5e'],
    ['#6366f1', '#8b5cf6'],
    ['#f59e0b', '#f97316'],
    ['#06b6d4', '#3b82f6'],
    ['#ef4444', '#dc2626'],
    ['#8b5cf6', '#6366f1'],
    ['#14b8a6', '#059669'],
    ['#f97316', '#f59e0b'],
    ['#0ea5e9', '#6366f1'],
    ['#ec4899', '#8b5cf6'],
    ['#059669', '#0ea5e9'],
    ['#6366f1', '#ec4899'],
];

const fadeUp = { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } };

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pub.get('/categories')
            .then(r => setCategories(r.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#f0f9ff 0%,#f8fafc 50%,#f0fdf4 100%)' }}>

            {/* Page Header Banner */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0d9488 0%,#2563eb 50%,#16a34a 100%)' }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute w-72 h-72 rounded-full bg-white/5 -top-20 -right-16" />
                <div className="absolute w-48 h-48 rounded-full bg-white/5 -bottom-16 left-10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                                Categories
                            </h1>
                            <p className="text-white/80 text-sm sm:text-base font-medium mt-2">
                                {loading ? 'Loading categories...' : (
                                    <span className="flex items-center gap-2">
                                        <span className="font-bold text-white">{categories.length} categories</span>
                                        <span className="w-1 h-1 rounded-full bg-white/60" />
                                        Browse and shop by type
                                    </span>
                                )}
                            </p>
                        </div>
                        <Link
                            to="/medicines"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-bold hover:bg-white/25 transition-all self-start sm:self-auto"
                        >
                            <FiShoppingBag size={15} />
                            View All Medicines
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                <div className="h-40 bg-gradient-to-r from-slate-100 to-slate-200 animate-pulse" />
                                <div className="p-5 space-y-3 bg-white">
                                    <div className="h-3 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                                    <div className="h-3 bg-slate-100 rounded-full w-1/2 animate-pulse" />
                                    <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20">
                        <MdLocalPharmacy size={56} className="mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-bold text-slate-600 mb-2">No categories yet</h3>
                        <p className="text-slate-400 text-sm">Categories will appear here once added by the admin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                        {categories.map((cat, i) => (
                            <CategoryCard key={cat.id} cat={cat} gradient={CAT_GRADIENTS[i % CAT_GRADIENTS.length]} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryCard({ cat, gradient, index }) {
    const [hovered, setHovered] = useState(false);
    const count = cat.medicine_count || 0;

    return (
        <Link
            to={`/medicines?category=${cat.id}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="block rounded-2xl overflow-hidden transition-all duration-300"
            style={{
                boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px ${gradient[0]}30` : '0 1px 6px rgba(0,0,0,0.06)',
                transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
                animation: `fadeUp 0.4s ease both ${index * 0.05}s`,
            }}
        >
            {/* Colored Gradient Header */}
            <div
                className="relative px-5 pt-5 pb-6 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
            >
                {/* Decorative circles */}
                <div className="absolute w-24 h-24 rounded-full bg-white/10 -top-8 -right-6" />
                <div className="absolute w-16 h-16 rounded-full bg-white/8 -bottom-6 left-4" />

                <div className="relative z-10">
                    {/* Top row: count badge */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-white/90 text-xs font-bold tracking-wide">
                            ETB
                        </div>
                        <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-white/90"
                            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            {count} ITEMS
                        </span>
                    </div>

                    {/* Category name */}
                    <h3 className="text-lg font-black text-white leading-snug tracking-tight">
                        {cat.name}
                    </h3>
                </div>
            </div>

            {/* White Body */}
            <div className="bg-white px-5 py-4">
                {cat.description ? (
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                        {cat.description}
                    </p>
                ) : (
                    <p className="text-sm text-slate-400 italic mb-4">
                        Browse medicines in this category
                    </p>
                )}

                {/* Browse Link */}
                <div className="flex items-center justify-between">
                    <span
                        className="text-sm font-bold transition-colors"
                        style={{ color: gradient[0] }}
                    >
                        Browse all
                    </span>
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                            background: `${gradient[0]}12`,
                            transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                        }}
                    >
                        <FiArrowRight size={14} style={{ color: gradient[0] }} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
