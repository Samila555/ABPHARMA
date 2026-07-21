import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiSearch, FiLogOut, FiSettings, FiArrowLeft } from 'react-icons/fi';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function AdminTopBar({ onToggleSidebar, user }) {
    const [notifications, setNotifications] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/notifications/count').then(res => {
            setNotifications(res.data.count || 0);
        }).catch(() => { });
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    return (
        <header className="topbar">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <FiMenu size={20} />
                </button>
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <FiSearch size={14} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search medicines, orders..."
                        className="bg-transparent border-none outline-none text-sm text-slate-600 w-52 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Back to Website */}
                <Link to="/" title="Back to Customer Site" className="flex items-center gap-2 px-3 py-1.5 mr-2 rounded-lg text-sky-600 hover:bg-sky-50 border border-sky-100 transition-colors text-sm font-semibold">
                    <FiArrowLeft size={16} />
                    <span className="hidden sm:block">Back to Store</span>
                </Link>

                {/* Notifications */}
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
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-slate-700">{user?.name || 'Admin'}</span>
                    </button>

                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1">
                                <Link
                                    to="/admin/settings"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <FiSettings size={14} /> Settings
                                </Link>
                                <hr className="my-1 border-slate-200" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <FiLogOut size={14} /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
