import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome as Home,
    FiPackage as Pill,
    FiGrid as LayoutGrid,
    FiActivity as Stethoscope,
    FiMapPin as MapPin,
    FiSearch as Search,
    FiBell as Bell,
    FiLogIn as LogIn,
    FiMenu as Menu,
    FiX as X,
    FiShield,
    FiShoppingCart,
    FiSun,
    FiMoon,
} from 'react-icons/fi';
import { MdLocalPharmacy, MdOutlinePointOfSale } from 'react-icons/md';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import useThemeStore from '../../store/useThemeStore';

const NAV_LINKS = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'Categories', path: '/categories', icon: LayoutGrid },
    { name: 'Contact', path: '/contact', icon: MapPin },
];

/* ETB ETB ETB  tiny animated pill badge ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
function Badge({ count }) {
    return (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
            {count > 9 ? '9+' : count}
        </span>
    );
}

/* ETB ETB ETB  floating gradient orb (purely decorative) ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */
function Orb({ cls }) {
    return <div className={`absolute rounded-full pointer-events-none blur-2xl opacity-30 ${cls}`} aria-hidden="true" />;
}

export default function CustomerNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, user } = useAuthStore();
    const cartCount = useCartStore((s) => s.getCartCount());
    const location = useLocation();
    const { isDark, toggleTheme } = useThemeStore();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => setMobileOpen(false), [location.pathname]);

    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <>
            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB 
                ANNOUNCEMENT TICKER
            ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <div
                className="fixed top-0 inset-x-0 z-[51] h-8 flex items-center justify-center gap-8 text-[11.5px] font-semibold tracking-wider overflow-hidden"
                style={{ background: 'linear-gradient(90deg,#0f172a 0%,#0c4a6e 50%,#0f172a 100%)' }}
            >
                {/* Decorative dots pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                    aria-hidden="true"
                />
                <span className="relative flex items-center gap-1.5 text-teal-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    Genuine medicines, guaranteed quality
                </span>
                <span className="hidden sm:block text-slate-500">|</span>
                <span className="hidden sm:flex items-center gap-1.5 text-sky-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    HEALTH20 — 20% off today
                </span>
                <span className="hidden md:block text-slate-500">|</span>
                <span className="hidden md:flex items-center gap-1.5 text-indigo-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Expert pharmacist consultation available
                </span>
            </div>

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB 
                MAIN STICKY HEADER
            ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            <header
                className={`fixed top-8 inset-x-0 z-50 bg-white transition-all duration-300 ${scrolled
                    ? 'shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
                    : 'shadow-[0_2px_12px_rgba(0,0,0,0.05)]'
                    }`}
            >
                {/* Decorative floating orbs (visible only before scroll) */}
                {!scrolled && (
                    <>
                        <Orb cls="w-28 h-28 bg-teal-300 -top-8 -left-6" />
                        <Orb cls="w-20 h-20 bg-cyan-300 -top-4 right-40" />
                        <Orb cls="w-16 h-16 bg-indigo-300 -top-6 right-1/3" />
                    </>
                )}

                {/* ETB ETB  Inner container ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 h-[70px] flex items-center justify-between gap-6">

                    {/* ETB ETB  LEFT: LOGO ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl"
                        aria-label="ABPharma ETB  Home"
                    >
                        {/* Icon box with glow */}
                        <div className="relative">
                            <div
                                className="absolute -inset-1 rounded-2xl blur-md opacity-0 group-hover:opacity-60 transition duration-300"
                                style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}
                                aria-hidden="true"
                            />
                            <div
                                className="relative w-[50px] h-[50px] rounded-2xl flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}
                            >
                                <MdLocalPharmacy className="text-white" size={26} aria-hidden="true" />
                            </div>
                        </div>

                        {/* Name + tagline */}
                        <div className="flex flex-col leading-snug">
                            <span className="text-[24px] font-black tracking-tight leading-none">
                                <span className="text-gray-800">AB</span>
                                <span style={{ color: '#06b6d4' }}>Pharma</span>
                            </span>
                            <span
                                className="text-[10.5px] font-bold tracking-[0.22em] uppercase mt-0.5"
                                style={{ color: '#94a3b8' }}
                            >
                                Smart Pharmacy
                            </span>
                        </div>
                    </Link>

                    {/* ETB ETB  CENTER: DESKTOP NAV ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    <nav
                        className="hidden lg:flex items-center gap-1 bg-gray-50/70 rounded-2xl px-2 py-1.5 border border-gray-100"
                        aria-label="Primary navigation"
                    >
                        {NAV_LINKS.map(({ name, path, icon: Icon }) => {
                            const active = isActive(path);
                            return (
                                <Link
                                    key={name}
                                    to={path}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[14.5px] font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${active
                                        ? 'text-teal-600 bg-white shadow-sm border border-teal-100'
                                        : 'text-gray-500 hover:text-teal-600 hover:bg-white/80'
                                        }`}
                                >
                                    <Icon
                                        size={15}
                                        className={active ? 'text-teal-500' : 'text-gray-400'}
                                        aria-hidden="true"
                                    />
                                    {name}
                                    {/* Active dot indicator */}
                                    {active && (
                                        <span
                                            className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-teal-500"
                                            aria-hidden="true"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ETB ETB  RIGHT: ACTIONS ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">

                        {/* Search */}
                        <button
                            aria-label="Search"
                            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-teal-600 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                        >
                            <Search size={18} aria-hidden="true" />
                        </button>

                        {/* Cart */}
                        <div className="relative">
                            <Link
                                to="/cart"
                                aria-label={`View Cart with ${cartCount} items`}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-teal-600 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                                <FiShoppingCart size={18} aria-hidden="true" />
                            </Link>
                            {cartCount > 0 && <Badge count={cartCount} />}
                        </div>

                        {/* Day / Night Toggle */}
                        <button
                            onClick={toggleTheme}
                            aria-label={isDark ? 'Switch to Day mode' : 'Switch to Night mode'}
                            title={isDark ? 'Day Mode' : 'Night Mode'}
                            className="relative w-16 h-8 rounded-full flex items-center transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 overflow-hidden flex-shrink-0"
                            style={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #1a1d3a, #0f0c29)'
                                    : 'linear-gradient(135deg, #74c0fc, #228be6)',
                                boxShadow: isDark
                                    ? '0 0 12px rgba(99,102,241,0.4)'
                                    : '0 0 12px rgba(34,139,230,0.35)',
                            }}
                        >
                            {/* Stars (dark mode) */}
                            {isDark && (
                                <>
                                    <span style={{ position: 'absolute', top: 4, left: 6, width: 2, height: 2, borderRadius: '50%', background: 'white', opacity: 0.8 }} />
                                    <span style={{ position: 'absolute', top: 10, left: 14, width: 1.5, height: 1.5, borderRadius: '50%', background: 'white', opacity: 0.6 }} />
                                    <span style={{ position: 'absolute', bottom: 5, left: 8, width: 1, height: 1, borderRadius: '50%', background: 'white', opacity: 0.7 }} />
                                </>
                            )}
                            {/* Sun rays (light mode) */}
                            {!isDark && (
                                <span style={{ position: 'absolute', left: 6, width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', filter: 'blur(4px)' }} />
                            )}
                            {/* Thumb */}
                            <span
                                style={{
                                    position: 'absolute',
                                    left: isDark ? 'calc(100% - 26px)' : '4px',
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    background: isDark
                                        ? 'linear-gradient(135deg, #c7d2fe, #818cf8)'
                                        : 'linear-gradient(135deg, #fff176, #ffca28)',
                                    boxShadow: isDark
                                        ? '0 0 8px rgba(129,140,248,0.8)'
                                        : '0 0 10px rgba(255,202,40,0.7)',
                                    transition: 'left 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {isDark
                                    ? <FiMoon size={11} style={{ color: '#312e81' }} />
                                    : <FiSun size={12} style={{ color: '#b45309' }} />}
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-7 bg-gray-200 mx-0.5" aria-hidden="true" />

                        {/* Admin pill */}
                        <div className="hidden sm:flex items-center gap-2">
                            <Link
                                to="/cashier/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                title="Cashier POS"
                            >
                                <MdOutlinePointOfSale size={14} aria-hidden="true" />
                                <span className="hidden md:inline">POS</span>
                            </Link>
                            <Link
                                to="/admin/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                                title="Admin Portal"
                            >
                                <FiShield size={12} aria-hidden="true" />
                                <span className="hidden md:inline">Admin</span>
                            </Link>
                        </div>



                        {/* Hamburger */}
                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-menu"
                            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                        >
                            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
                        </button>
                    </div>
                </div>

                {/* ETB ETB  Animated gradient accent line ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
                <div
                    className="h-[2.5px] w-full"
                    style={{
                        background: 'linear-gradient(90deg,#14b8a6,#06b6d4,#6366f1,#06b6d4,#14b8a6)',
                        backgroundSize: '300% 100%',
                        animation: 'navAccent 5s ease infinite',
                    }}
                    aria-hidden="true"
                />
                <style>{`@keyframes navAccent{0%{background-position:0%}50%{background-position:100%}100%{background-position:0%}}`}</style>
            </header>

            {/* Spacer for fixed header + ticker */}
            <div className="h-[106px]" aria-hidden="true" />

            {/* ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB 
                MOBILE DRAWER
            ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB ETB  */}
            {/* Backdrop */}
            <div
                onClick={() => setMobileOpen(false)}
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
                className={`fixed top-0 left-0 bottom-0 w-[300px] bg-white z-50 lg:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Decorative header gradient */}
                <div
                    className="h-1.5 w-full flex-shrink-0"
                    style={{ background: 'linear-gradient(90deg,#14b8a6,#06b6d4,#6366f1)' }}
                    aria-hidden="true"
                />

                {/* Drawer top */}
                <div className="flex items-center justify-between px-6 h-[68px] border-b border-gray-100 flex-shrink-0">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5"
                        onClick={() => setMobileOpen(false)}
                        aria-label="ABPharma Home"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#14b8a6,#06b6d4)' }}
                        >
                            <MdLocalPharmacy className="text-white" size={22} aria-hidden="true" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-[20px] font-black tracking-tight">
                                <span className="text-gray-800">AB</span>
                                <span style={{ color: '#06b6d4' }}>Pharma</span>
                            </span>
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Smart Pharmacy</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Drawer links */}
                <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Mobile navigation">
                    {NAV_LINKS.map(({ name, path, icon: Icon }, i) => {
                        const active = isActive(path);
                        return (
                            <Link
                                key={name}
                                to={path}
                                onClick={() => setMobileOpen(false)}
                                style={{ transitionDelay: mobileOpen ? `${i * 45}ms` : '0ms' }}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-semibold mb-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${active
                                    ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600'
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[17px] ${active ? 'bg-teal-100 text-teal-500' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <Icon size={18} aria-hidden="true" />
                                </div>
                                {name}
                                {active && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-teal-500" aria-hidden="true" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Drawer footer */}
                <div className="p-5 border-t border-gray-100 flex-shrink-0">
                    {isAuthenticated ? (
                        <Link
                            to="/admin/dashboard"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-center gap-2.5 w-full h-12 rounded-2xl text-[15px] font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            style={{ background: 'linear-gradient(135deg,#1e293b,#334155)' }}
                        >
                            <FiShield size={16} aria-hidden="true" />
                            Go to Dashboard
                        </Link>
                    ) : null}
                    <p className="text-center text-[10.5px] text-gray-400 mt-4 tracking-widest uppercase font-semibold">
                        ABPharma �� Smart Pharmacy
                    </p>
                </div>
            </div>
        </>
    );
}
