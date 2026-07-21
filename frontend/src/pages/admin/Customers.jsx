import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiEye } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', address: '', city: '', membership_type: 'regular', notes: '' });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/customers?search=${search}&page=${page}&limit=20`);
            setCustomers(res.data.data);
            setTotal(res.data.total);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCustomers(); }, [page]);

    const openAdd = () => { setEditCustomer(null); setForm({ name: '', email: '', phone: '', gender: '', address: '', city: '', membership_type: 'regular', notes: '' }); setShowForm(true); };
    const openEdit = (c) => { setEditCustomer(c); setForm({ ...c }); setShowForm(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editCustomer) { await api.put(`/customers/${editCustomer.id}`, form); toast.success('Customer updated'); }
            else { await api.post('/customers', form); toast.success('Customer added'); }
            setShowForm(false);
            fetchCustomers();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const membership = { regular: 'badge-secondary', silver: 'badge-info', gold: 'badge-warning', platinum: 'badge-purple' };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800">Customers</h1><p className="text-slate-500 text-sm">{total} customers</p></div>
                <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add Customer</button>
            </div>

            <div className="card p-4 flex gap-3">
                <div className="flex gap-2 flex-1">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchCustomers()} className="form-input pl-9 text-sm" />
                    </div>
                    <button onClick={fetchCustomers} className="btn-primary py-2 text-sm">Search</button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead><tr><th>Customer</th><th>Phone</th><th>City</th><th>Membership</th><th>Total Purchases</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? Array(10).fill(0).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton h-6" /></td></tr>) :
                                customers.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">{c.name.charAt(0)}</div>
                                                <div><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-slate-400">{c.email}</div></div>
                                            </div>
                                        </td>
                                        <td className="text-sm">{c.phone || 'ETB '}</td>
                                        <td className="text-sm">{c.city || 'ETB '}</td>
                                        <td><span className={`badge ${membership[c.membership_type] || 'badge-secondary'} capitalize`}>{c.membership_type}</span></td>
                                        <td className="font-semibold text-sm text-green-600">ETB {parseFloat(c.total_purchases || 0).toLocaleString()}</td>
                                        <td><span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                                        <td>
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><FiEdit2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            {!loading && !customers.length && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No customers found</td></tr>}
                        </tbody>
                    </table>
                </div>
                {total > 20 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                        <div className="text-sm text-slate-500">Showing {(page - 1) * 20 + 1}ETB {Math.min(page * 20, total)} of {total}</div>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-40">Previous</button>
                            <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold">{editCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 text-xl">ETB </button>
                        </div>
                        <form onSubmit={handleSave} className="p-5 grid grid-cols-2 gap-4">
                            <div className="col-span-2"><label className="form-label">Full Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" required /></div>
                            <div><label className="form-label">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" /></div>
                            <div><label className="form-label">Phone</label><input type="tel" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="form-input" /></div>
                            <div><label className="form-label">Gender</label>
                                <select value={form.gender || ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="form-input">
                                    <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                                </select>
                            </div>
                            <div><label className="form-label">City</label><input type="text" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="form-input" /></div>
                            <div><label className="form-label">Membership</label>
                                <select value={form.membership_type || 'regular'} onChange={e => setForm(f => ({ ...f, membership_type: e.target.value }))} className="form-input">
                                    {['regular', 'silver', 'gold', 'platinum'].map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
                                </select>
                            </div>
                            <div><label className="form-label">Address</label><input type="text" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="form-input" /></div>
                            <div className="col-span-2 flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn-primary flex-1 justify-center">{editCustomer ? 'Update' : 'Add Customer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
