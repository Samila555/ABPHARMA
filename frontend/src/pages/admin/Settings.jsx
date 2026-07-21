import { useState } from 'react';
import { FiSave, FiLock, FiUser } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Settings() {
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, profileForm);
            updateUser(profileForm);
            toast.success('Profile updated');
        } catch { toast.error('Update failed'); }
        finally { setLoading(false); }
    };

    const handlePassSave = async (e) => {
        e.preventDefault();
        if (passForm.new_password !== passForm.confirm_password) return toast.error('Passwords mismatch');
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, { password: passForm.new_password });
            toast.success('Password updated');
            setPassForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch { toast.error('Password update failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div><h1 className="text-2xl font-bold text-slate-800">Settings</h1><p className="text-slate-500 text-sm">Manage your account preferences</p></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4"><FiUser className="text-sky-600" /><h2 className="font-bold text-slate-800">Profile Settings</h2></div>
                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <div><label className="form-label">Name</label><input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="form-input" required /></div>
                        <div><label className="form-label">Email</label><input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="form-input" required /></div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">Save Profile</button>
                    </form>
                </div>

                {/* Password */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4"><FiLock className="text-orange-500" /><h2 className="font-bold text-slate-800">Change Password</h2></div>
                    <form onSubmit={handlePassSave} className="space-y-4">
                        <div><label className="form-label">Current Password</label><input type="password" value={passForm.current_password} onChange={e => setPassForm({ ...passForm, current_password: e.target.value })} className="form-input" /></div>
                        <div><label className="form-label">New Password</label><input type="password" value={passForm.new_password} onChange={e => setPassForm({ ...passForm, new_password: e.target.value })} className="form-input" required /></div>
                        <div><label className="form-label">Confirm New</label><input type="password" value={passForm.confirm_password} onChange={e => setPassForm({ ...passForm, confirm_password: e.target.value })} className="form-input" required /></div>
                        <button type="submit" disabled={loading} className="btn-secondary w-full justify-center">Update Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
