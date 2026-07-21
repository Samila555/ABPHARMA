import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiSearch } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [edit, setEdit] = useState(null);
    const [form, setForm] = useState({ name: '', contact_person: '', email: '', phone: '', address: '', city: '', country: 'Nigeria', payment_terms: '', notes: '' });

    const fetch = async () => {
        setLoading(true);
        try { const res = await api.get('/suppliers'); setSuppliers(res.data.data); }
        catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setEdit(null); setForm({ name: '', contact_person: '', email: '', phone: '', address: '', city: '', country: 'Nigeria', payment_terms: '', notes: '' }); setShowForm(true); };
    const openEdit = (s) => { setEdit(s); setForm({ ...s }); setShowForm(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (edit) { await api.put(`/suppliers/${edit.id}`, form); toast.success('Supplier updated'); }
            else { await api.post('/suppliers', form); toast.success('Supplier added'); }
            setShowForm(false); fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800">Suppliers</h1><p className="text-slate-500 text-sm">{suppliers.length} suppliers</p></div>
                <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add Supplier</button>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead><tr><th>Supplier</th><th>Contact</th><th>Phone</th><th>City</th><th>Payment Terms</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton h-6" /></td></tr>) :
                                suppliers.map(s => (
                                    <tr key={s.id}>
                                        <td><div className="font-medium text-sm">{s.name}</div><div className="text-xs text-slate-400">{s.email}</div></td>
                                        <td className="text-sm">{s.contact_person || 'ETB '}</td>
                                        <td className="text-sm">{s.phone || 'ETB '}</td>
                                        <td className="text-sm">{s.city || 'ETB '}, {s.country}</td>
                                        <td className="text-sm">{s.payment_terms || 'ETB '}</td>
                                        <td><span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                                        <td><button onClick={() => openEdit(s)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><FiEdit2 size={14} /></button></td>
                                    </tr>
                                ))}
                            {!loading && !suppliers.length && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No suppliers yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold">{edit ? 'Edit Supplier' : 'Add Supplier'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 text-xl">ETB </button>
                        </div>
                        <form onSubmit={handleSave} className="p-5 grid grid-cols-2 gap-4">
                            <div className="col-span-2"><label className="form-label">Company Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" required /></div>
                            <div><label className="form-label">Contact Person</label><input type="text" value={form.contact_person || ''} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} className="form-input" /></div>
                            <div><label className="form-label">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" /></div>
                            <div><label className="form-label">Phone</label><input type="tel" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="form-input" /></div>
                            <div><label className="form-label">City</label><input type="text" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="form-input" /></div>
                            <div><label className="form-label">Country</label><input type="text" value={form.country || 'Nigeria'} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="form-input" /></div>
                            <div><label className="form-label">Payment Terms</label><input type="text" value={form.payment_terms || ''} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))} className="form-input" placeholder="e.g. Net 30" /></div>
                            <div className="col-span-2"><label className="form-label">Address</label><input type="text" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="form-input" /></div>
                            <div className="col-span-2 flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                                <button type="submit" className="btn-primary flex-1 justify-center">{edit ? 'Update' : 'Add Supplier'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
