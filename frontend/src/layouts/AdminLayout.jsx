import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopBar from '../components/admin/AdminTopBar';
import useAuthStore from '../store/useAuthStore';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col min-h-screen transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? '260px' : '0', transition: 'margin 0.3s ease' }}
            >
                <AdminTopBar onToggleSidebar={toggleSidebar} user={user} />
                <main className="flex-1 p-6 animate-fade-in">
                    <Outlet />
                </main>
                <footer className="text-center py-3 text-xs text-slate-400 border-t border-slate-200 bg-white">
                    �� 2024 AB Pharma ETB  Smart Pharmacy Management System
                </footer>
            </div>
        </div>
    );
}
