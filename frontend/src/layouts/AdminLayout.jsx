import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopBar from '../components/admin/AdminTopBar';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/api';
import { FiCloud, FiAlertTriangle } from 'react-icons/fi';

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

                {/* Cloudinary Warning Banner */}
                {storageConfig && !storageConfig.cloudinary && (
                    <div className="mx-6 mt-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FiAlertTriangle size={20} className="text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-red-800 text-sm">Images are NOT being saved permanently</h4>
                            <p className="text-xs text-red-600 mt-1 leading-relaxed">
                                Cloudinary is not configured. All uploaded images save to local disk and <strong>will be lost</strong> every time the server restarts.
                                To fix this permanently:
                            </p>
                            <ol className="text-xs text-red-600 mt-2 space-y-1 list-decimal list-inside">
                                <li>Go to <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-red-800">cloudinary.com</a> and create a free account</li>
                                <li>Copy your <strong>Cloud Name</strong>, <strong>API Key</strong>, and <strong>API Secret</strong> from the Dashboard</li>
                                <li>Go to Render Dashboard → your service → Environment → abpharma-env group</li>
                                <li>Add these 3 environment variables:
                                    <code className="block bg-red-100 text-red-900 px-2 py-1 rounded mt-1 font-mono text-[11px]">
                                        CLOUDINARY_CLOUD_NAME=your_cloud_name<br/>
                                        CLOUDINARY_API_KEY=your_api_key<br/>
                                        CLOUDINARY_API_SECRET=your_api_secret
                                    </code>
                                </li>
                                <li>Click <strong>Save</strong> and wait for Render to redeploy</li>
                            </ol>
                            <p className="text-xs text-red-500 mt-2 italic">After setup, ALL new uploads will be stored permanently on Cloudinary.</p>
                        </div>
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">
                                <FiCloud size={12} /> Not Configured
                            </span>
                        </div>
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
