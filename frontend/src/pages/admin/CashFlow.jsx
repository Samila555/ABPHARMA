import { useState, useEffect } from 'react';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function CashFlow() {
    const [entries, setEntries] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expenses: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 'income', category: '', description: '', amount: '', payment_method: 'cash', date: new Date().toISOString().split('T')[0] });
    const [filters, setFilters] = useState({ type: '', page: 1 });

    const today = new Date();
    const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'));
    const [year, setYear] = useState(String(today.getFullYear()));

    const fetch = async () => {
        setLoading(true);
        try {
            const [entrRes, sumRes] = await Promise.all([
                api.get(`/cashflow?${filters.type ? 'type=' + filters.type : ''}&page=${filters.page}&limit=30`),
                api.get(`/cashflow/summary?month=${month}&year=${year}`),
            ]);
            setEntries(entrRes.data.data);
            setSummary(sumRes.data.data);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [filters, month, year]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cashflow', form);
            toast.success('Entry added');
            setShowForm(false);
            setForm({ type: 'income', category: '', description: '', amount: '', payment_method: 'cash', date: new Date().toISOString().split('T')[0] });
            fetch();
        } catch { toast.error('Failed'); }
    };

    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800">Cash Flow</h1><p className="text-slate-500 text-sm">Track income and expenses</p></div>
                <button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus size={16} /> Add Entry</button>
            </div>

            {/* Period selector */}
            <div className="flex gap-3 items-center">
                <select value={month} onChange={e => setMonth(e.target.value)} className="form-input w-36 text-sm">
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m, i) => (
                        <option key={m} value={m}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                </select>
                <select value={year} onChange={e => setYear(e.target.value)} className="form-input w-28 text-sm">
                    {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Income', value: summary.income, icon: FiTrendingUp, bg: 'card-green', text: 'text-green-700', bg2: 'bg-green-50' },
                    { label: 'Total Expenses', value: summary.expenses, icon: FiTrendingDown, bg: 'card-red', text: 'text-red-700', bg2: 'bg-red-50' },
                    { label: 'Net Profit', value: summary.profit, icon: FiDollarSign, bg: summary.profit >= 0 ? 'card-blue' : 'card-red', text: summary.profit >= 0 ? 'text-sky-700' : 'text-red-700', bg2: summary.profit >= 0 ? 'bg-sky-50' : 'bg-red-50' },
                ].map(s => (
                    <div key={s.label} className={`card p-5 ${s.bg2} border-0`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                                <s.icon className="text-white text-xl" />
                            </div>
                            <div>
                                <div className={`text-2xl font-bold ${s.text}`}>{fmt(s.value)}</div>
                                <div className="text-sm text-slate-500">{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {[['', 'All'], ['income', 'Income'], ['expense', 'Expenses']].map(([val, label]) => (
                    <button key={val} onClick={() => setFilters(f => ({ ...f, type: val, page: 1 }))}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filters.type === val ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
                ))}
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th>Method</th></tr></thead>
                        <tbody>
                            {loading ? Array(10).fill(0).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton h-6" /></td></tr>) :
                                entries.map(e => (
                                    <tr key={e.id}>
                                        <td className="text-sm">{new Date(e.date).toLocaleDateString()}</td>
                                        <td><span className={`badge ${e.type === 'income' ? 'badge-success' : 'badge-danger'} capitalize`}>{e.type}</span></td>
                                        <td className="text-sm">{e.category || 'ETB '}</td>
                                        <td className="text-sm text-slate-600 max-w-xs truncate">{e.description || 'ETB '}</td>
                                        <td className={`font-bold text-sm ${e.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{e.type === 'income' ? '+' : '-'}{fmt(e.amount)}</td>
                                        <td className="text-sm capitalize">{e.payment_method?.replace('_', ' ')}</td>
                                    </tr>
                                ))}
                            {!loading && !entries.length && <tr><td colSpan={6} className="text-center py-10 text-slate-400">No entries</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold">Add Cash Flow Entry</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 text-xl">ETB </button>
                        </div>
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {['income', 'expense'].map(t => (
                                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                                        className={`py-2 rounded-xl border-2 font-semibold text-sm capitalize transition-all ${form.type === t ? (t === 'income' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-slate-200 text-slate-500'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div><label className="form-label">Amount (ETB ) *</label><input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="form-input" required min="0" step="0.01" /></div>
                            <div><label className="form-label">Category</label><input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input" placeholder="e.g. Sales, Rent, Salary" /></div>
                            <div><label className="form-label">Description</label><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input resize-none" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="form-label">Payment Method</label>
                                    <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} className="form-input text-sm">
                                        <option value="cash">Cash</option><option value="card">Card</option><option value="transfer">Transfer</option><option value="mobile_money">Mobile Money</option>
                                    </select>
                                </div>
                                <div><label className="form-label">Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="form-input" /></div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn-primary flex-1 justify-center">Add Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
