import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiShield } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [edit, setEdit] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'pharmacist', password: '' });

    const fetch = async () => {
        setLoading(true);
        try { const res = await api.get('/users'); setUsers(res.data.data); }
        catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setEdit(null); setForm({ name: '', email: '', role: 'pharmacist', password: '' }); setShowForm(true); };
    const openEdit = (u) => { setEdit(u); setForm({ name: u.name, email: u.email, role: u.role, password: '' }); setShowForm(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (edit) {
                const payload = { ...form }; if (!payload.password) delete payload.password;
                await api.put(`/users/${edit.id}`, payload); toast.success('User updated');
            } else {
                if (!form.password) return toast.error('Password required');
                await api.post('/users', form); toast.success('User added');
            }
            setShowForm(false); fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    };

    const statusToggle = async (id, isActive) => {
        try { await api.patch(`/users/${id}/status`, { is_active: !isActive }); fetch(); }
        catch { toast.error('Failed to update status'); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">System Users</h1>
                <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add User</button>
            </div>

            <div className="card overflow-hidden">
                <table className="data-table">
                    <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5}><div className="skeleton h-6" /></td></tr>) :
                            users.map(u => (
                                <tr key={u.id}>
                                    <td><div className="font-semibold text-sm">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></td>
                                    <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-info'} capitalize`}><FiShield size={12} className="mr-1 inline" />{u.role}</span></td>
                                    <td>
                                        <button onClick={() => statusToggle(u.id, u.is_active)} className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="text-xs text-slate-500">{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                                    <td><button onClick={() => openEdit(u)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"><FiEdit2 size={14} /></button></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">{edit ? 'Edit User' : 'Add User'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div><label className="form-label">Full Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" required /></div>
                            <div><label className="form-label">Email *</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" required /></div>
                            <div><label className="form-label">Role *</label>
                                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="form-input">
                                    <option value="admin">Admin</option><option value="pharmacist">Pharmacist</option><option value="cashier">Cashier</option><option value="inventory_manager">Inventory Manager</option>
                                </select>
                            </div>
                            <div><label className="form-label">Password {edit && '(Leave blank to keep current)'}</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="form-input" required={!edit} /></div>
                            <div className="flex gap-2"><button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{edit ? 'Update' : 'Add'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
