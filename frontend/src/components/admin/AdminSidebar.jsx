import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiGrid, FiPackage, FiTag, FiShoppingCart, FiUsers, FiArchive,
    FiTruck, FiFileText, FiDollarSign, FiBarChart2, FiSettings,
    FiBell, FiGlobe, FiLogOut, FiCrosshair, FiClock,
    FiUserCheck, FiShoppingBag, FiActivity
} from 'react-icons/fi';
import { MdLocalPharmacy, MdQrCodeScanner } from 'react-icons/md';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const allNavSections = [
    {
        title: 'Overview',
        items: [
            { icon: FiGrid, label: 'Dashboard', to: '/admin/dashboard', roles: ['admin', 'pharmacist'] },
            { icon: FiActivity, label: 'POS System', to: '/admin/pos', roles: ['admin', 'pharmacist', 'cashier'] },
        ]
    },
    {
        title: 'Pharmacy',
        items: [
            { icon: FiPackage, label: 'Medicines', to: '/admin/medicines', roles: ['admin', 'pharmacist', 'inventory_manager'] },
            { icon: FiTag, label: 'Categories', to: '/admin/categories', roles: ['admin', 'pharmacist', 'inventory_manager'] },
            { icon: FiArchive, label: 'Inventory', to: '/admin/inventory', roles: ['admin', 'pharmacist', 'inventory_manager'] },
            { icon: FiCrosshair, label: 'Prescriptions', to: '/admin/prescriptions', roles: ['admin', 'pharmacist'] },
        ]
    },
    {
        title: 'Finance',
        items: [
            { icon: FiDollarSign, label: 'Cash Flow', to: '/admin/cashflow', roles: ['admin'] },
            { icon: FiBarChart2, label: 'Reports', to: '/admin/reports', roles: ['admin'] },
        ]
    },
    {
        title: 'Admin',
        items: [
            { icon: FiGlobe, label: 'Website CMS', to: '/admin/cms', roles: ['admin'] },
            { icon: MdQrCodeScanner, label: 'QR Code', to: '/admin/qr', roles: ['admin', 'pharmacist'] },
            { icon: FiBell, label: 'Notifications', to: '/admin/notifications', roles: ['admin', 'pharmacist'] },
            { icon: FiUsers, label: 'Users', to: '/admin/users', roles: ['admin'] },
            { icon: FiSettings, label: 'Settings', to: '/admin/settings', roles: ['admin'] },
        ]
    }
];

export default function AdminSidebar({ isOpen, onClose }) {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    // Filter Navigation based on role
    const navSections = allNavSections.map(section => ({
        ...section,
        items: section.items.filter(item => !item.roles || item.roles.includes(user?.role || 'admin'))
    })).filter(section => section.items.length > 0);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    return (
        <aside
            className="sidebar fixed left-0 top-0 h-full z-50 overflow-y-auto"
            style={{
                width: '260px',
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease',
            }}
        >
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <MdLocalPharmacy className="text-white text-xl" />
                </div>
                <div>
                    <div className="text-white font-bold text-base leading-tight">AB Pharma</div>
                    <div className="text-sky-300 text-xs">Management System</div>
                </div>
            </div>

            {/* User info */}
            <div className="mx-3 my-3 px-3 py-2.5 bg-white/10 rounded-xl">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{user?.name || 'Admin'}</div>
                        <div className="text-sky-300 text-xs capitalize">{user?.role || 'Admin'}</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="mt-2">
                {navSections.map((section) => (
                    <div key={section.title}>
                        <div className="sidebar-section-title">{section.title}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                                }
                                onClick={onClose}
                            >
                                <item.icon size={16} className="flex-shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="mt-4 mx-3">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all text-sm font-medium"
                >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>

            {/* Bottom decoration */}
            <div className="mt-6 mx-3 p-3 bg-gradient-to-r from-sky-500/20 to-blue-600/20 rounded-xl border border-sky-500/20">
                <div className="text-white/60 text-xs">AB Pharma v1.0</div>
                <div className="text-white/40 text-xs">Smart Pharmacy System</div>
            </div>
        </aside>
    );
}
