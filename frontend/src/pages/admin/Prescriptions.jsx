import { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiCheck, FiX } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/prescriptions?${statusFilter ? 'status=' + statusFilter : ''}&limit=50`);
            setPrescriptions(res.data.data);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [statusFilter]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/prescriptions/${id}/status`, { status });
            toast.success(`Prescription ${status}`);
            fetch();
            if (selected?.id === id) setSelected(p => ({ ...p, status }));
        } catch { toast.error('Failed to update'); }
    };

    const statusColors = { pending: 'badge-warning', verified: 'badge-info', dispensed: 'badge-success', rejected: 'badge-danger' };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1><p className="text-slate-500 text-sm">{prescriptions.length} prescriptions</p></div>
                <div className="flex gap-2">
                    {['', 'pending', 'verified', 'dispensed', 'rejected'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-all ${statusFilter === s ? 'bg-sky-600 text-white border-sky-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Customer</th><th>Doctor</th><th>Hospital</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? Array(8).fill(0).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton h-6" /></td></tr>) :
                                prescriptions.map(p => (
                                    <tr key={p.id}>
                                        <td className="text-sm font-mono">#{p.id}</td>
                                        <td className="text-sm font-medium">{p.customer_name || 'Unknown'}</td>
                                        <td className="text-sm">{p.doctor_name || 'ETB '}</td>
                                        <td className="text-sm">{p.hospital || 'ETB '}</td>
                                        <td className="text-xs text-slate-500">{p.prescription_date ? new Date(p.prescription_date).toLocaleDateString() : 'ETB '}</td>
                                        <td><span className={`badge ${statusColors[p.status] || 'badge-secondary'} capitalize`}>{p.status}</span></td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setSelected(p)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><FiEye size={14} /></button>
                                                {p.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => updateStatus(p.id, 'verified')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><FiCheck size={14} /></button>
                                                        <button onClick={() => updateStatus(p.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FiX size={14} /></button>
                                                    </>
                                                )}
                                                {p.status === 'verified' && (
                                                    <button onClick={() => updateStatus(p.id, 'dispensed')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">Dispense</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            {!loading && !prescriptions.length && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No prescriptions found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-box max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold">Prescription #{selected.id}</h2>
                            <button onClick={() => setSelected(null)} className="text-slate-400 text-xl">ETB </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[['Customer', selected.customer_name || 'ETB '], ['Doctor', selected.doctor_name || 'ETB '], ['Phone', selected.doctor_phone || 'ETB '], ['Hospital', selected.hospital || 'ETB '], ['Date', selected.prescription_date ? new Date(selected.prescription_date).toLocaleDateString() : 'ETB '], ['Status', selected.status]].map(([k, v]) => (
                                    <div key={k}><span className="text-slate-500 block">{k}</span>
                                        {k === 'Status' ? <span className={`badge ${statusColors[v] || 'badge-secondary'}`}>{v}</span> : <span className="font-medium">{v}</span>}
                                    </div>
                                ))}
                            </div>
                            {selected.notes && <div><div className="form-label">Notes</div><div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{selected.notes}</div></div>}
                            {selected.image && (
                                <div>
                                    <div className="form-label">Prescription Image</div>
                                    <img src={selected.image} alt="Prescription" className="w-full rounded-xl border border-slate-200 max-h-60 object-contain" />
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                {selected.status === 'pending' && <><button onClick={() => updateStatus(selected.id, 'verified')} className="btn-secondary flex-1 justify-center">Verify</button><button onClick={() => updateStatus(selected.id, 'rejected')} className="btn-danger flex-1 justify-center">Reject</button></>}
                                {selected.status === 'verified' && <button onClick={() => updateStatus(selected.id, 'dispensed')} className="btn-primary flex-1 justify-center">Mark as Dispensed</button>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
