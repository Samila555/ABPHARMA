import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [edit, setEdit] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });

    const fetch = async () => {
        setLoading(true);
        try { const res = await api.get('/categories'); setCategories(res.data.data); }
        catch { toast.error('Failed to load categories'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setEdit(null); setForm({ name: '', description: '' }); setShowForm(true); };
    const openEdit = (c) => { setEdit(c); setForm({ name: c.name, description: c.description || '' }); setShowForm(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (edit) { await api.put(`/categories/${edit.id}`, form); toast.success('Category updated'); }
            else { await api.post('/categories', form); toast.success('Category added'); }
            setShowForm(false); fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
                <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add Category</button>
            </div>

            <div className="card overflow-hidden">
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Description</th><th>Medicines</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={4}><div className="skeleton h-6" /></td></tr>) :
                            categories.map(c => (
                                <tr key={c.id}>
                                    <td className="font-semibold text-sky-700">{c.name}</td>
                                    <td className="text-slate-500 text-sm max-w-sm truncate">{c.description || '-'}</td>
                                    <td><span className="badge badge-info">{c.medicine_count || 0}</span></td>
                                    <td><button onClick={() => openEdit(c)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><FiEdit2 size={14} /></button></td>
                                </tr>
                            ))}
                        {!loading && !categories.length && <tr><td colSpan={4} className="text-center py-6 text-slate-400">No categories</td></tr>}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">{edit ? 'Edit Category' : 'Add Category'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div><label className="form-label">Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" required /></div>
                            <div><label className="form-label">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input resize-none" rows={3} /></div>
                            <div className="flex gap-2"><button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{edit ? 'Update' : 'Add'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
