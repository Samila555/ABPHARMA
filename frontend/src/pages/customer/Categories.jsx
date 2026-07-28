import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Search, Package, ArrowRight } from 'lucide-react';
import {
    Baby, Smile, Heart, Eye, Leaf, Droplets,
    ShieldPlus, Pill, Sparkles, User, Users,
    Stethoscope, Wind, Dna, Milk, Building2,
    TestTube, HandMetal
} from 'lucide-react';
import axios from 'axios';

const pub = axios.create({ baseURL: '/api/public', timeout: 15000 });

const CATEGORY_ICONS = {
    'baby': Baby,
    'dental': Smile,
    'heart': Heart,
    'eye': Eye,
    'herbal': Leaf,
    'diabetes': Droplets,
    'first aid': ShieldPlus,
    'otc': Pill,
    'skin': Sparkles,
    'men': User,
    'women': Users,
    'medical': Stethoscope,
    'allergy': Wind,
    'vitamin': Dna,
    'children': Milk,
    'surgical': Building2,
    'laboratory': TestTube,
    'personal': HandMetal,
};

const ICON_BG_COLORS = [
    { bg: '#eff6ff', fg: '#2563eb' },
    { bg: '#f0fdfa', fg: '#0d9488' },
    { bg: '#f5f3ff', fg: '#7c3aed' },
    { bg: '#fef2f2', fg: '#dc2626' },
    { bg: '#ecfdf5', fg: '#059669' },
    { bg: '#fefce8', fg: '#ca8a04' },
    { bg: '#f0f9ff', fg: '#0284c7' },
    { bg: '#fdf4ff', fg: '#a855f7' },
    { bg: '#fff7ed', fg: '#ea580c' },
    { bg: '#f8fafc', fg: '#475569' },
    { bg: '#fef2f2', fg: '#e11d48' },
    { bg: '#eff6ff', fg: '#1d4ed8' },
    { bg: '#f0fdfa', fg: '#0f766e' },
    { bg: '#faf5ff', fg: '#9333ea' },
    { bg: '#fff1f2', fg: '#e11d48' },
    { bg: '#f0fdf4', fg: '#15803d' },
    { bg: '#f0f9ff', fg: '#0369a1' },
    { bg: '#fefce8', fg: '#a16207' },
];

const PAGE_SIZE = 12;

function getIconForCategory(name) {
    const lower = name.toLowerCase();
    for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
        if (lower.includes(key)) return Icon;
    }
    return Package;
}

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const stagger = {
    visible: { transition: { staggerChildren: 0.04 } },
};

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [page, setPage] = useState(1);

    useEffect(() => {
        pub.get('/categories')
            .then(r => setCategories(r.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let list = [...categories];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
        }
        if (sortBy === 'popular') list.sort((a, b) => (b.medicine_count || 0) - (a.medicine_count || 0));
        else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === 'count') list.sort((a, b) => (b.medicine_count || 0) - (a.medicine_count || 0));
        return list;
    }, [categories, search, sortBy]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => { setPage(1); }, [search, sortBy]);

    return (
        <div className="min-h-screen bg-white">

            {/* Top Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
                <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-8" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <ChevronRight size={14} className="text-slate-300" />
                    <span className="text-slate-700 font-medium">Categories</span>
                </nav>

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight mb-3">
                            Shop by{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                                Category
                            </span>
                        </h1>
                        <p className="text-slate-500 text-base sm:text-lg font-medium">
                            Find medicines and healthcare products quickly.
                        </p>
                        {!loading && (
                            <p className="text-sm text-slate-400 mt-2">
                                <span className="font-semibold text-slate-600">{filtered.length}</span> {filtered.length === 1 ? 'category' : 'categories'} available
                            </p>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative w-full lg:w-80 shrink-0">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            aria-label="Search categories"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-10">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort:</label>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
                            aria-label="Sort categories"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="name">Name A–Z</option>
                            <option value="count">Medicine Count</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse" />
                                <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                                <div className="h-3 bg-slate-50 rounded-full w-full animate-pulse" />
                                <div className="h-3 bg-slate-50 rounded-full w-1/2 animate-pulse" />
                                <div className="h-9 bg-slate-50 rounded-xl animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : paginated.length === 0 ? (
                    <EmptyState search={search} />
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        key={`${sortBy}-${search}-${page}`}
                    >
                        {paginated.map((cat, i) => (
                            <CategoryCard
                                key={cat.id}
                                cat={cat}
                                colorIdx={(page - 1) * PAGE_SIZE + i}
                                index={i}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                                    p === page
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                                aria-label={`Page ${p}`}
                                aria-current={p === page ? 'page' : undefined}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            aria-label="Next page"
                        >
                            Next <ChevronLeft size={16} className="rotate-180" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryCard({ cat, colorIdx, index }) {
    const Icon = getIconForCategory(cat.name);
    const color = ICON_BG_COLORS[colorIdx % ICON_BG_COLORS.length];
    const count = cat.medicine_count || 0;

    return (
        <motion.div custom={index} variants={fadeIn}>
            <Link
                to={`/medicines?category=${cat.id}`}
                className="group block rounded-2xl border border-slate-100 bg-white p-6 h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-slate-200/60 hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                aria-label={`Explore ${cat.name} category, ${count} medicines`}
            >
                {/* Icon */}
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: color.bg }}
                >
                    <Icon size={26} style={{ color: color.fg }} strokeWidth={1.8} />
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-slate-800 mb-1.5 leading-snug group-hover:text-blue-600 transition-colors">
                    {cat.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-1 min-h-[20px]">
                    {cat.description || 'Browse medicines in this category'}
                </p>

                {/* Count + Button row */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                    <span className="text-xs font-semibold text-slate-400">
                        <span className="text-slate-600">{count}</span> {count === 1 ? 'medicine' : 'medicines'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Explore <ArrowRight size={12} />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}

function EmptyState({ search }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                <Package size={40} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No categories found</h3>
            <p className="text-slate-400 text-sm max-w-xs">
                {search ? (
                    <>No results for "<span className="font-semibold text-slate-600">{search}</span>". Try another keyword.</>
                ) : (
                    'Categories will appear here once added by the admin.'
                )}
            </p>
            {search && (
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                    Clear search
                </button>
            )}
        </div>
    );
}
