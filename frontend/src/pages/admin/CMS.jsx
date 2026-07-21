import { useState, useEffect } from 'react';
import { FiImage, FiSave, FiMonitor } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function CMS() {
    const [content, setContent] = useState({
        hero_title: '', hero_subtitle: '', about_text: '',
        contact_phone: '', contact_email: '', contact_address: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/cms').then(r => {
            const data = r.data.data.reduce((acc, curr) => ({ ...acc, [curr.section_key]: curr.content }), {});
            setContent(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/cms', { items: Object.entries(content).map(([k, v]) => ({ section_key: k, content: v })) });
            toast.success('Website content updated!');
        } catch { toast.error('Failed to update'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="skeleton h-96 w-full rounded-2xl" />;

    return (
        <div className="max-w-4xl space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800">Website CMS</h1><p className="text-slate-500 text-sm">Manage customer-facing website content</p></div>
                <a href="/" target="_blank" rel="noreferrer" className="btn-outline"><FiMonitor size={14} /> View Website</a>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="card p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2"><FiImage className="text-sky-600" /> <h2 className="font-semibold text-slate-800">Hero Section</h2></div>
                    <div><label className="form-label">Hero Title</label><input type="text" value={content.hero_title || ''} onChange={e => setContent({ ...content, hero_title: e.target.value })} className="form-input text-lg font-bold" /></div>
                    <div><label className="form-label">Hero Subtitle</label><textarea value={content.hero_subtitle || ''} onChange={e => setContent({ ...content, hero_subtitle: e.target.value })} className="form-input resize-none" rows={2} /></div>
                </div>

                <div className="card p-5 space-y-4">
                    <h2 className="font-semibold text-slate-800">About Us Section</h2>
                    <div><label className="form-label">About Text</label><textarea value={content.about_text || ''} onChange={e => setContent({ ...content, about_text: e.target.value })} className="form-input resize-none" rows={4} /></div>
                </div>

                <div className="card p-5 space-y-4">
                    <h2 className="font-semibold text-slate-800">Contact Information (Footer)</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="form-label">Phone</label><input type="text" value={content.contact_phone || ''} onChange={e => setContent({ ...content, contact_phone: e.target.value })} className="form-input" /></div>
                        <div><label className="form-label">Email</label><input type="text" value={content.contact_email || ''} onChange={e => setContent({ ...content, contact_email: e.target.value })} className="form-input" /></div>
                        <div className="col-span-2"><label className="form-label">Address</label><input type="text" value={content.contact_address || ''} onChange={e => setContent({ ...content, contact_address: e.target.value })} className="form-input" /></div>
                    </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full py-3 justify-center text-base">
                    {saving ? 'Saving...' : <><FiSave /> Publish Changes</>}
                </button>
            </form>
        </div>
    );
}
