import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiSearch, FiLogOut, FiSettings, FiArrowLeft, FiAlertTriangle, FiClock, FiX, FiVolume2 } from 'react-icons/fi';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

function playAlertSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (freq, startTime, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.4, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        const now = ctx.currentTime;
        playBeep(880, now, 0.15);
        playBeep(880, now + 0.2, 0.15);
        playBeep(1100, now + 0.4, 0.25);
        playBeep(880, now + 0.7, 0.15);
        playBeep(1100, now + 0.9, 0.25);
    } catch (e) {
        console.warn('Audio not available:', e);
    }
}

export default function AdminTopBar({ onToggleSidebar, user }) {
    const [notifications, setNotifications] = useState(0);
    const [userDropdown, setUserDropdown] = useState(false);
    const [alertDropdown, setAlertDropdown] = useState(false);
    const [expiryAlerts, setExpiryAlerts] = useState({ expired: 0, expiring: 0, lowStock: 0, total: 0 });
    const [expiryList, setExpiryList] = useState({ expired: [], expiring: [] });
    const [urgentAlerts, setUrgentAlerts] = useState([]);
    const [showUrgentBanner, setShowUrgentBanner] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const alertRef = useRef(null);
    const lastUrgentCount = useRef(0);
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const checkUrgentAlerts = useCallback(async () => {
        try {
            const res = await api.get('/dashboard/urgent-expiry');
            const items = res.data.data || [];
            setUrgentAlerts(items);
            if (items.length > 0 && items.length > lastUrgentCount.current && soundEnabled) {
                playAlertSound();
                toast.error(`${items.length} medicine${items.length !== 1 ? 's' : ''} expiring within 3 days!`, { duration: 8000, icon: '🚨' });
            }
            lastUrgentCount.current = items.length;
            setShowUrgentBanner(items.length > 0);
        } catch {}
    }, [soundEnabled]);

    useEffect(() => {
        const fetchCounts = () => {
            api.get('/notifications/count').then(res => setNotifications(res.data.count || 0)).catch(() => {});
            api.get('/dashboard/expiry-count').then(res => setExpiryAlerts(res.data.data || {})).catch(() => {});
            checkUrgentAlerts();
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, [checkUrgentAlerts]);

    useEffect(() => {
        if (alertDropdown && expiryAlerts.total > 0) {
            api.get('/dashboard/expiry-alerts').then(res => setExpiryList(res.data.data || {})).catch(() => {});
        }
    }, [alertDropdown]);

    useEffect(() => {
        const handleClick = (e) => {
            if (alertRef.current && !alertRef.current.contains(e.target)) setAlertDropdown(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    const fmt = (n) => `ETB ${parseFloat(n || 0).toLocaleString()}`;
    const hasAlerts = expiryAlerts.total > 0;

    return (
        <>
            {/* Urgent Expiry Alert Banner — rings when medicine expires within 3 days */}
            {showUrgentBanner && urgentAlerts.length > 0 && (
                <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white px-4 py-3 shadow-lg relative z-40 animate-pulse">
                    <div className="flex items-center justify-between max-w-screen-xl mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <FiAlertTriangle size={24} className="animate-bounce" />
                                <FiVolume2 size={12} className="absolute -bottom-1 -right-1 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-sm">
                                    🚨 URGENT: {urgentAlerts.length} medicine{urgentAlerts.length !== 1 ? 's' : ''} expiring within 3 days!
                                </span>
                                <div className="text-xs text-red-100 mt-0.5">
                                    {urgentAlerts.map(m => m.name).slice(0, 4).join(', ')}
                                    {urgentAlerts.length > 4 && ` +${urgentAlerts.length - 4} more`}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSoundEnabled(s => !s)}
                                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-xs flex items-center gap-1"
                                title={soundEnabled ? 'Mute alert sound' : 'Enable alert sound'}>
                                <FiVolume2 size={14} />
                                <span className="hidden sm:block">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
                            </button>
                            <button onClick={() => { setShowUrgentBanner(false); lastUrgentCount.current = 0; }}
                                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Dismiss">
                                <FiX size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="topbar">
                <div className="flex items-center gap-3">
                    <button onClick={onToggleSidebar} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                        <FiMenu size={20} />
                    </button>
                    <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <FiSearch size={14} className="text-slate-400" />
                        <input type="text" placeholder="Search medicines, orders..."
                            className="bg-transparent border-none outline-none text-sm text-slate-600 w-52 placeholder:text-slate-400" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link to="/" title="Back to Customer Site"
                        className="flex items-center gap-2 px-3 py-1.5 mr-2 rounded-lg text-sky-600 hover:bg-sky-50 border border-sky-100 transition-colors text-sm font-semibold">
                        <FiArrowLeft size={16} />
                        <span className="hidden sm:block">Back to Store</span>
                    </Link>

                    {/* Expiry Alert Bell */}
                    <div className="relative" ref={alertRef}>
                        <button onClick={() => setAlertDropdown(!alertDropdown)}
                            className={`relative p-2 rounded-lg transition-colors ${hasAlerts ? 'text-orange-600 hover:bg-orange-50 animate-pulse' : 'text-slate-600 hover:bg-slate-100'}`}
                            title="Medicine expiry alerts">
                            <FiAlertTriangle size={20} />
                            {hasAlerts && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
                                    {expiryAlerts.total > 99 ? '99+' : expiryAlerts.total}
                                </span>
                            )}
                        </button>

                        {alertDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setAlertDropdown(false)} />
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-30 overflow-hidden">
                                    <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                        <div className="flex items-center gap-2 font-bold text-sm">
                                            <FiAlertTriangle size={16} />
                                            Medicine Alerts
                                        </div>
                                        <div className="text-xs text-orange-100 mt-0.5">{expiryAlerts.total} medicine{expiryAlerts.total !== 1 ? 's' : ''} need attention</div>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {expiryAlerts.expired > 0 && (
                                            <div>
                                                <div className="px-4 py-2 bg-red-50 text-red-700 text-xs font-bold flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                                    Expired ({expiryAlerts.expired})
                                                </div>
                                                {expiryList.expired.map(m => (
                                                    <Link key={m.id} to={`/admin/medicines/edit/${m.id}`} onClick={() => setAlertDropdown(false)}
                                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 text-sm">
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-slate-800 truncate">{m.name}</div>
                                                            <div className="text-xs text-red-500">Expired {Math.abs(m.days_overdue)} day{Math.abs(m.days_overdue) !== 1 ? 's' : ''} ago</div>
                                                        </div>
                                                        <div className="text-xs text-slate-500 text-right flex-shrink-0 ml-2">
                                                            <div>{m.quantity} units</div>
                                                            <div className="text-red-500 font-medium">{fmt(m.selling_price * m.quantity)}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {expiryAlerts.expiring > 0 && (
                                            <div>
                                                <div className="px-4 py-2 bg-orange-50 text-orange-700 text-xs font-bold flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                                                    Expiring Soon ({expiryAlerts.expiring})
                                                </div>
                                                {expiryList.expiring.map(m => (
                                                    <Link key={m.id} to={`/admin/medicines/edit/${m.id}`} onClick={() => setAlertDropdown(false)}
                                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 text-sm">
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-slate-800 truncate">{m.name}</div>
                                                            <div className="text-xs text-orange-500 flex items-center gap-1">
                                                                <FiClock size={10} />
                                                                {m.days_remaining} day{m.days_remaining !== 1 ? 's' : ''} left
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-slate-500 text-right flex-shrink-0 ml-2">
                                                            <div>{m.quantity} units</div>
                                                            <div className="text-orange-500 font-medium">{fmt(m.selling_price * m.quantity)}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {expiryAlerts.total === 0 && (
                                            <div className="px-4 py-8 text-center text-slate-400 text-sm">
                                                <FiClock size={24} className="mx-auto mb-2 opacity-30" />
                                                No expiry alerts
                                            </div>
                                        )}
                                    </div>

                                    {expiryAlerts.total > 0 && (
                                        <Link to="/admin/dashboard" onClick={() => setAlertDropdown(false)}
                                            className="block px-4 py-3 text-center text-sm font-medium text-sky-600 hover:bg-sky-50 border-t border-slate-200">
                                            View all on Dashboard
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* General Notifications */}
                    <Link to="/admin/notifications" className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                        <FiBell size={20} />
                        {notifications > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {notifications > 9 ? '9+' : notifications}
                            </span>
                        )}
                    </Link>

                    {/* User Menu */}
                    <div className="relative">
                        <button onClick={() => setUserDropdown(!userDropdown)}
                            className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-slate-700">{user?.name || 'Admin'}</span>
                        </button>

                        {userDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserDropdown(false)} />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1">
                                    <Link to="/admin/settings" onClick={() => setUserDropdown(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                        <FiSettings size={14} /> Settings
                                    </Link>
                                    <hr className="my-1 border-slate-200" />
                                    <button onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                        <FiLogOut size={14} /> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
