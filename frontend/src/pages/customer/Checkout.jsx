import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiUploadCloud, FiLock } from 'react-icons/fi';
import api from '../../lib/api';
import useCartStore from '../../store/useCartStore';
import toast from 'react-hot-toast';

export default function Checkout() {
    const { items, getCartTotal, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', delivery_type: 'delivery', payment_method: 'transfer', rxFile: null });
    const [rxPreview, setRxPreview] = useState(null);

    const total = getCartTotal();
    const finalTotal = total;
    const requiresRx = items.some(i => i.requires_prescription);

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleRxChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(f => ({ ...f, rxFile: file }));
            const r = new FileReader(); r.onload = ev => setRxPreview(ev.target.result); r.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (requiresRx && !form.rxFile) return toast.error('A prescription is required for your items.');

        setLoading(true);
        try {
            // 1. Create order
            const orderPayload = {
                customer_name: form.name, customer_phone: form.phone, customer_email: form.email,
                shipping_address: '',
                order_type: 'online', delivery_type: 'pickup', payment_method: form.payment_method,
                status: 'pending', payment_status: 'pending', items
            };

            const res = await api.post('/orders', orderPayload);
            const orderNumber = res.data.order_number;

            // 2. Upload Prescription if needed
            if (requiresRx && form.rxFile) {
                const formData = new FormData();
                formData.append('customer_name', form.name);
                formData.append('doctor_name', 'Online Upload');
                formData.append('image', form.rxFile);
                formData.append('notes', `Attached to order ${orderNumber}`);
                await api.post('/prescriptions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            toast.success('Order placed successfully!');
            clearCart();
            navigate(`/track-order/${orderNumber}`, { state: { justOrdered: true } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally { setLoading(false); }
    };

    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">Secure Checkout</h1>

                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 relative">

                    <div className="flex-1 space-y-6">
                        {/* Contact Info */}
                        <div className="card p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">1. Contact Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2"><label className="form-label">Full Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" required /></div>
                                <div><label className="form-label">Phone Number *</label><input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="form-input" required /></div>
                                <div><label className="form-label">Email Address (Optional)</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" /></div>
                            </div>
                        </div>

                        {/* No Delivery Method Card Needed Now */}

                        {/* Prescription Upload */}
                        {requiresRx && (
                            <div className="card p-6 lg:p-8 border-2 border-amber-200 bg-amber-50/30">
                                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FiShield className="text-amber-500" /> 3. Prescription Upload</h2>
                                <p className="text-sm text-slate-600 mb-6">Your order contains prescription-only items. Please upload a clear photo of your valid medical prescription.</p>
                                <div className="border-2 border-dashed border-sky-300 bg-white rounded-xl p-6 text-center hover:border-sky-500 transition-colors cursor-pointer relative">
                                    <input type="file" accept="image/*" onChange={handleRxChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {rxPreview ? (
                                        <div className="relative z-0"><img src={rxPreview} alt="Prescription" className="mx-auto max-h-48 rounded" /><p className="text-sm text-sky-600 mt-2 font-medium">Click to change image</p></div>
                                    ) : (
                                        <div className="relative z-0 py-4"><FiUploadCloud className="mx-auto text-sky-400 mb-2" size={32} /><div className="font-semibold text-slate-700">Click or tap to upload</div><div className="text-sm text-slate-500 mt-1">JPG, PNG (Max 5MB)</div></div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="card p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">4. Payment Method</h2>
                            <div className="space-y-3">
                                {[{ id: 'transfer', l: 'Bank Transfer' }, { id: 'card', l: 'Credit / Debit Card' }, { id: 'cash', l: 'Cash / POS In Store' }].map(m => (
                                    <label key={m.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.payment_method === m.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>
                                        <input type="radio" checked={form.payment_method === m.id} onChange={() => setForm(f => ({ ...f, payment_method: m.id }))} className="w-5 h-5 text-sky-600 focus:ring-sky-500" />
                                        <span className="font-medium text-slate-700">{m.l}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[400px]">
                        <div className="card p-6 lg:p-8 sticky top-28 bg-slate-800 text-white border-0 shadow-2xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-700 pb-4"><FiLock /> Order Summary</h3>

                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {items.map(i => (
                                    <div key={i.id} className="flex justify-between text-sm">
                                        <span className="text-slate-300">{i.quantity}x <span className="text-white font-medium">{i.name}</span></span>
                                        <span className="font-semibold">{fmt(i.selling_price * i.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-700 pt-6 space-y-3 mb-6">
                                <div className="flex justify-between text-slate-300"><span>Subtotal</span><span>{fmt(total)}</span></div>
                            </div>

                            <div className="flex justify-between text-2xl font-bold mb-8">
                                <span>Total</span><span className="text-sky-400">{fmt(finalTotal)}</span>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl py-4 font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Confirm Order'}
                            </button>
                            <p className="text-xs text-center text-slate-400 mt-4">Your personal data is encrypted and secure.</p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
