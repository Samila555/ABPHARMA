import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopBar from '../components/admin/AdminTopBar';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/api';
import { FiCloud, FiInfo } from 'react-icons/fi';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [storageConfig, setStorageConfig] = useState(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        api.get('/health/config').then(res => setStorageConfig(res.data)).catch(() => {});
    }, []);

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
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
            />

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col min-h-screen transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? '260px' : '0', transition: 'margin 0.3s ease' }}
            >
                <AdminTopBar onToggleSidebar={toggleSidebar} user={user} />

                {/* Optional Cloudinary upgrade notice */}
                {storageConfig && !storageConfig.cloudinary && (
                    <div className="mx-6 mt-4 bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
                        <FiInfo size={16} className="text-sky-600 flex-shrink-0" />
                        <p className="text-sky-700">
                            Images are stored in the database. For faster loading and lower database size, you can optionally set up{' '}
                            <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-sky-900">Cloudinary</a>{' '}
                            via Render environment variables.
                        </p>
                        <button onClick={() => setStorageConfig({ ...storageConfig, cloudinary: 'dismissed' })}
                            className="text-sky-400 hover:text-sky-600 flex-shrink-0 ml-auto text-xs">
                            Dismiss
                        </button>
                    </div>
                )}

                <main className="flex-1 p-6 animate-fade-in">
                    <Outlet />
                </main>
                <footer className="text-center py-3 text-xs text-slate-400 border-t border-slate-200 bg-white">
                    2024 AB Pharma ETB  Smart Pharmacy Management System
                </footer>
            </div>
        </div>
    );
}
