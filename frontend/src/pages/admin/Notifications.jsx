import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        setLoading(true);
        try { const res = await api.get('/notifications'); setNotifications(res.data.data); }
        catch { toast.error('Failed to load notifications'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            toast.success('All marked as read');
        } catch { }
    };

    const types = { low_stock: 'bg-amber-100 text-amber-600', expired: 'bg-red-100 text-red-600', new_order: 'bg-sky-100 text-sky-600', system: 'bg-slate-100 text-slate-600' };

    return (
        <div className="max-w-4xl max-auto space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800">Notifications</h1><p className="text-slate-500 text-sm">System alerts and updates</p></div>
                {notifications.some(n => !n.is_read) && <button onClick={markAllRead} className="btn-outline text-sm"><FiCheck size={14} /> Mark all read</button>}
            </div>

            <div className="card divide-y divide-slate-100">
                {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="p-4"><div className="skeleton h-12 w-full" /></div>) :
                    notifications.map(n => (
                        <div key={n.id} className={`p-4 flex gap-4 transition-colors ${n.is_read ? 'bg-white' : 'bg-sky-50'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${types[n.type] || types.system}`}><FiBell size={18} /></div>
                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`text-sm ${n.is_read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>{n.title}</h3>
                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">{new Date(n.created_at).toLocaleString()}</span>
                                </div>
                                <p className={`text-sm mt-1 ${n.is_read ? 'text-slate-500' : 'text-slate-700'}`}>{n.message}</p>
                            </div>
                            {!n.is_read && (
                                <button onClick={() => markRead(n.id)} className="text-xs font-semibold text-sky-600 hover:text-sky-700 mt-1" title="Mark as read">
                                    <FiCheck size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                {!loading && !notifications.length && (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <FiBell size={32} className="mb-2 opacity-30" />
                        <p>You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
