import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiBarChart, FiAlertTriangle, FiPackage, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const txTypes = [
    { value: 'stock_in', label: 'Stock In', color: 'text-green-600' },
    { value: 'stock_out', label: 'Stock Out', color: 'text-red-600' },
    { value: 'return', label: 'Return', color: 'text-blue-600' },
    { value: 'damage', label: 'Damage', color: 'text-orange-600' },
    { value: 'adjustment', label: 'Adjustment', color: 'text-purple-600' },
    { value: 'expired', label: 'Expired', color: 'text-red-800' },
];

export default function Inventory() {
    const [tab, setTab] = useState('transactions');
    const [transactions, setTransactions] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [expired, setExpired] = useState([]);
    const [expiringSoon, setExpiringSoon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdjust, setShowAdjust] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [adjustForm, setAdjustForm] = useState({ medicine_id: '', transaction_type: 'stock_in', quantity: '', reason: '', batch_number: '', expiry_date: '' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [txRes, lowRes, expRes, soonRes] = await Promise.all([
                api.get('/inventory?limit=50'),
                api.get('/inventory/low-stock'),
                api.get('/inventory/expired'),
                api.get('/inventory/expiring-soon'),
            ]);
            setTransactions(txRes.data.data);
            setLowStock(lowRes.data.data);
            setExpired(expRes.data.data);
            setExpiringSoon(soonRes.data.data);
        } catch { toast.error('Failed to load inventory'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => {
        api.get('/medicines?limit=500').then(r => setMedicines(r.data.data)).catch(() => { });
    }, []);

    const handleAdjust = async (e) => {
        e.preventDefault();
        if (!adjustForm.medicine_id || !adjustForm.quantity) return toast.error('Fill required fields');
        try {
            await api.post('/inventory/adjust', adjustForm);
            toast.success('Stock adjusted!');
            setShowAdjust(false);
            setAdjustForm({ medicine_id: '', transaction_type: 'stock_in', quantity: '', reason: '', batch_number: '', expiry_date: '' });
            fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const typeInfo = (type) => txTypes.find(t => t.value === type) || { label: type, color: 'text-slate-600' };

    const TabBtn = ({ t, label, count, color }) => (
        <button onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {label}
            {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t ? 'bg-white/20 text-white' : `bg-${color}-100 text-${color}-700`}`}>{count}</span>}
        </button>
    );

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
                    <p className="text-slate-500 text-sm">Track and manage stock levels</p>
                </div>
                <button onClick={() => setShowAdjust(true)} className="btn-primary">
                    <FiPlus size={16} /> Adjust Stock
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Low Stock', count: lowStock.length, color: 'amber', icon: FiAlertTriangle, tab: 'low-stock' },
                    { label: 'Expired', count: expired.length, color: 'red', icon: FiPackage, tab: 'expired' },
                    { label: 'Expiring Soon', count: expiringSoon.length, color: 'orange', icon: FiAlertTriangle, tab: 'expiring' },
                    { label: 'Transactions', count: transactions.length, color: 'blue', icon: FiBarChart, tab: 'transactions' },
                ].map(s => (
                    <div key={s.tab} onClick={() => setTab(s.tab)}
                        className={`stat-card cursor-pointer border-2 ${tab === s.tab ? `border-${s.color}-400 bg-${s.color}-50` : 'border-transparent'}`}>
                        <div className={`w-10 h-10 bg-${s.color}-100 rounded-xl flex items-center justify-center`}>
                            <s.icon className={`text-${s.color}-600`} size={18} />
                        </div>
                        <div>
                            <div className={`text-2xl font-bold text-${s.color}-700`}>{s.count}</div>
                            <div className="text-xs text-slate-500">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
                <TabBtn t="transactions" label="Transactions" count={0} />
                <TabBtn t="low-stock" label="Low Stock" count={lowStock.length} color="amber" />
                <TabBtn t="expired" label="Expired" count={expired.length} color="red" />
                <TabBtn t="expiring" label="Expiring Soon" count={expiringSoon.length} color="orange" />
            </div>

            {/* Content */}
            <div className="card overflow-hidden">
                {tab === 'transactions' && (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead><tr><th>Date</th><th>Medicine</th><th>Type</th><th>Quantity</th><th>Before</th><th>After</th><th>Reason</th></tr></thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id}>
                                        <td className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()}</td>
                                        <td className="font-medium text-sm">{t.medicine_name}</td>
                                        <td><span className={`text-xs font-semibold ${typeInfo(t.transaction_type).color}`}>{typeInfo(t.transaction_type).label}</span></td>
                                        <td className="font-semibold flex items-center gap-1">
                                            {['stock_in', 'return'].includes(t.transaction_type) ? <FiArrowUp className="text-green-500" size={12} /> : <FiArrowDown className="text-red-500" size={12} />}
                                            {t.quantity}
                                        </td>
                                        <td className="text-slate-500">{t.balance_before}</td>
                                        <td className="font-semibold">{t.balance_after}</td>
                                        <td className="text-sm text-slate-500 max-w-xs truncate">{t.reason || '-'}</td>
                                    </tr>
                                ))}
                                {!transactions.length && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No transactions yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {(tab === 'low-stock' || tab === 'expired' || tab === 'expiring') && (() => {
                    const data = tab === 'low-stock' ? lowStock : tab === 'expired' ? expired : expiringSoon;
                    const emptyMsg = tab === 'low-stock' ? 'All medicines are well-stocked!' : tab === 'expired' ? 'No expired medicines.' : 'No medicines expiring soon.';
                    return (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th>Min Required</th><th>Expiry Date</th><th>Status</th></tr></thead>
                                <tbody>
                                    {data.map(m => {
                                        const days = m.expiry_date ? Math.ceil((new Date(m.expiry_date) - new Date()) / (1000 * 86400)) : null;
                                        return (
                                            <tr key={m.id}>
                                                <td><div className="font-medium text-sm">{m.name}</div><div className="text-xs text-slate-400">{m.generic_name}</div></td>
                                                <td><span className="badge badge-info text-xs">{m.category_name || '-'}</span></td>
                                                <td className={`font-bold text-sm ${m.quantity <= 0 ? 'text-red-600' : 'text-amber-600'}`}>{m.quantity}</td>
                                                <td className="text-sm text-slate-600">{m.min_stock_level}</td>
                                                <td className={`text-sm font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-orange-600' : 'text-slate-600'}`}>
                                                    {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '-'}
                                                    {days !== null && <div className="text-xs">{days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d left`}</div>}
                                                </td>
                                                <td>
                                                    <span className={`badge ${m.quantity <= 0 ? 'badge-danger' : m.quantity <= m.min_stock_level ? 'badge-warning' : 'badge-success'}`}>
                                                        {m.quantity <= 0 ? 'Out of Stock' : 'Low Stock'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {!data.length && <tr><td colSpan={6} className="text-center py-10 text-green-600 font-medium">ETB  {emptyMsg}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    );
                })()}
            </div>

            {/* Adjust Modal */}
            {showAdjust && (
                <div className="modal-overlay" onClick={() => setShowAdjust(false)}>
                    <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800">Adjust Stock</h2>
                            <button onClick={() => setShowAdjust(false)} className="text-slate-400 hover:text-slate-600 text-xl">ETB </button>
                        </div>
                        <form onSubmit={handleAdjust} className="p-5 space-y-4">
                            <div>
                                <label className="form-label">Medicine <span className="text-red-500">*</span></label>
                                <select value={adjustForm.medicine_id} onChange={e => setAdjustForm(f => ({ ...f, medicine_id: e.target.value }))} className="form-input" required>
                                    <option value="">Select medicine</option>
                                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Transaction Type <span className="text-red-500">*</span></label>
                                <select value={adjustForm.transaction_type} onChange={e => setAdjustForm(f => ({ ...f, transaction_type: e.target.value }))} className="form-input">
                                    {txTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label">Quantity <span className="text-red-500">*</span></label>
                                    <input type="number" min="1" value={adjustForm.quantity} onChange={e => setAdjustForm(f => ({ ...f, quantity: e.target.value }))} className="form-input" required />
                                </div>
                                <div>
                                    <label className="form-label">Batch Number</label>
                                    <input type="text" value={adjustForm.batch_number} onChange={e => setAdjustForm(f => ({ ...f, batch_number: e.target.value }))} className="form-input" />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Expiry Date</label>
                                <input type="date" value={adjustForm.expiry_date} onChange={e => setAdjustForm(f => ({ ...f, expiry_date: e.target.value }))} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Reason</label>
                                <textarea rows={2} value={adjustForm.reason} onChange={e => setAdjustForm(f => ({ ...f, reason: e.target.value }))} className="form-input resize-none" placeholder="Reason for adjustment..." />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAdjust(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn-primary flex-1 justify-center">Apply Adjustment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
