import { useState, useEffect } from 'react';
import { FiPlus, FiEye } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const res = await api.get('/purchases');
            setPurchases(Array.isArray(res.data.data) ? res.data.data : []);
        } catch {
            toast.error('Failed to load purchases');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fmt = (num) => `ETB ${parseFloat(num || 0).toLocaleString()}`;

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Purchases</h1>
                    <p className="text-slate-500 text-sm">Manage stock orders from suppliers</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Supplier</th>
                                <th>Total Cost</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5}><div className="skeleton h-6" /></td></tr>
                                ))
                            ) : purchases.length > 0 ? (
                                purchases.map((p) => (
                                    <tr key={p.id}>
                                        <td className="text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="font-medium text-sm">{p.supplier_name || 'ETB '}</td>
                                        <td className="font-semibold text-slate-700">{fmt(p.total_cost)}</td>
                                        <td><span className={`badge ${p.status === 'received' ? 'badge-success' : 'badge-warning'} capitalize`}>{p.status}</span></td>
                                        <td>
                                            <button className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><FiEye size={14} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No purchases found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
