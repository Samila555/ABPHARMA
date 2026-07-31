import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiShield, FiAlertCircle, FiCheck, FiMinus, FiPlus, FiArrowLeft, FiInfo, FiTag, FiShoppingBag, FiUploadCloud, FiX } from 'react-icons/fi';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/api';
import MedicineImage from '../../components/MedicineImage';
import useCartStore from '../../store/useCartStore';
import toast from 'react-hot-toast';

export default function MedicineDetail() {
    const { id } = useParams();
    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);

    // Quick Checkout State
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', payment_method: 'transfer', screenshotFile: null });
    const [ssPreview, setSsPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addItem } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/public/medicines/${id}`);
                setMedicine(res.data.data);
            } catch (err) {
                toast.error('Medicine not found');
                navigate('/medicines');
            } finally { setLoading(false); }
        };
        fetch();
        window.scrollTo(0, 0);
    }, [id, navigate]);

    if (loading) return <div className="min-h-screen pt-32 flex justify-center"><div className="w-10 h-10 border-4 border-sky-500 border-t-transparent flex rounded-full animate-spin"></div></div>;
    if (!medicine) return null;

    const handleAddToCart = () => {
        addItem(medicine, qty);
        toast.success(`Added ${qty} ${medicine.name} to cart`);
    };

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCheckoutForm(f => ({ ...f, screenshotFile: file }));
            const r = new FileReader(); r.onload = ev => setSsPreview(ev.target.result); r.readAsDataURL(file);
        }
    };

    const handleQuickCheckout = async (e) => {
        e.preventDefault();
        if (checkoutForm.payment_method === 'transfer' && !checkoutForm.screenshotFile) return toast.error('Please upload your payment screenshot.');

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('customer_name', checkoutForm.name);
            formData.append('customer_phone', checkoutForm.phone);
            formData.append('payment_method', checkoutForm.payment_method);
            formData.append('items_json', JSON.stringify([{ ...medicine, quantity: qty }]));
            if (checkoutForm.screenshotFile) formData.append('screenshot', checkoutForm.screenshotFile);

            const res = await api.post('/public/orders', formData);
            toast.success('Order placed successfully!');
            navigate(`/track-order/${res.data.order_number}`, { state: { justOrdered: true } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally { setIsSubmitting(false); }
    };

    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;
    const outOfStock = medicine.quantity <= 0;

    return (
        <div className="bg-slate-50 min-h-screen pt-28 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-6 transition-colors font-medium text-sm">
                    <FiArrowLeft /> Back to medicines
                </button>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                        {/* Image Section */}
                        <div className="lg:col-span-2 bg-slate-50/50 p-10 flex items-center justify-center relative border-r border-slate-100">
                            <div className="w-full aspect-square relative flex items-center justify-center">
                                <MedicineImage
                                    src={medicine.image}
                                    name={medicine.name}
                                    className="w-full h-full object-contain drop-shadow-xl rounded-2xl"
                                    fallbackSize={120}
                                />
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="badge badge-info px-3 py-1 text-sm bg-sky-100 text-sky-700">{medicine.category_name}</span>
                                {medicine.requires_prescription && (
                                    <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-amber-200">
                                        <FiShield /> Prescription Required
                                    </span>
                                )}
                                {medicine.is_featured && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-200">Featured</span>}
                            </div>

                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">{medicine.name}</h1>
                            <div className="text-lg text-slate-500 mb-6 flex items-center gap-2">
                                <span>{medicine.generic_name || medicine.brand_name}</span>
                                {medicine.strength && <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                                <span className="font-medium text-slate-700">{medicine.strength}</span>
                            </div>

                            <div className="text-4xl font-bold text-slate-900 mb-8">{fmt(medicine.selling_price)}</div>

                            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${outOfStock ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                                    <span className={`font-semibold ${outOfStock ? 'text-red-700' : 'text-green-700'}`}>
                                        {outOfStock ? 'Currently Out of Stock' : 'In Stock & Ready to Ship'}
                                    </span>
                                </div>

                                {!outOfStock && (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-full sm:w-36 flex-shrink-0">
                                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"><FiMinus /></button>
                                            <input type="number" value={qty} onChange={(e) => setQty(Math.min(medicine.quantity, Math.max(1, parseInt(e.target.value) || 1)))} className="flex-1 text-center font-bold text-slate-800 bg-transparent border-none outline-none" min="1" max={medicine.quantity} />
                                            <button onClick={() => setQty(Math.min(medicine.quantity, qty + 1))} className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"><FiPlus /></button>
                                        </div>
                                        <div className="flex gap-2 flex-1">
                                            <button onClick={handleAddToCart} className="flex-1 btn-outline border-slate-300 text-slate-700 hover:bg-slate-50 py-3 justify-center text-base shadow-sm">
                                                <FiShoppingCart size={18} /> Add Cart
                                            </button>
                                            <button onClick={() => setShowCheckout(true)} className="flex-1 btn-primary bg-sky-500 hover:bg-sky-400 py-3 justify-center text-base shadow-lg transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                                                <FiShoppingBag size={18} /> Buy Now
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
                                {medicine.manufacturer && <div className="flex items-start gap-2"><FiTag className="text-sky-500 mt-1" /><div className="text-slate-500">Manufacturer:<br /><span className="font-semibold text-slate-800">{medicine.manufacturer}</span></div></div>}
                                {medicine.dosage_form && <div className="flex items-start gap-2"><FiInfo className="text-sky-500 mt-1" /><div className="text-slate-500">Form:<br /><span className="font-semibold text-slate-800">{medicine.dosage_form}</span></div></div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FiInfo className="text-sky-600" /> Description & Information</h3>
                            <div className="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                                {medicine.description || 'No description available for this medicine.'}
                            </div>
                        </div>

                        {medicine.uses && (
                            <div className="card p-8 bg-sky-50/50 border-sky-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FiCheck className="text-sky-600" /> Indications & Uses</h3>
                                <div className="text-slate-600 whitespace-pre-wrap">{medicine.uses}</div>
                            </div>
                        )}

                        {medicine.side_effects && (
                            <div className="card p-8 bg-amber-50/50 border-amber-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FiAlertCircle className="text-amber-600" /> Side Effects</h3>
                                <div className="text-slate-600 whitespace-pre-wrap">{medicine.side_effects}</div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {medicine.requires_prescription && (
                            <div className="card p-6 border-2 border-amber-200 bg-amber-50">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4"><FiShield size={24} /></div>
                                <h3 className="font-bold text-slate-800 mb-2">Prescription Required</h3>
                                <p className="text-sm text-slate-600 mb-4">This medicine requires a valid prescription from a certified healthcare professional. You will be prompted to upload it during checkout.</p>
                            </div>
                        )}

                        <div className="card p-6 shadow-md">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">Product Details</h3>
                            <div className="space-y-3 text-sm divide-y divide-slate-100">
                                {[['Brand', medicine.brand_name], ['Generic', medicine.generic_name], ['Barcode', medicine.barcode], ['Pregnancy Cat.', medicine.pregnancy_category ? `Category ${medicine.pregnancy_category}` : null], ['Storage', medicine.storage_conditions]].map(([k, v]) => v ? (
                                    <div key={k} className="flex justify-between py-2">
                                        <span className="text-slate-500">{k}</span>
                                        <span className="font-semibold text-slate-800 text-right">{v}</span>
                                    </div>
                                ) : null)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK CHECKOUT MODAL */}
            {showCheckout && (
                <div className="modal-overlay z-50 flex items-start sm:items-center justify-center py-10" onClick={() => setShowCheckout(false)}>
                    <div className="modal-box w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><FiX size={20} /></button>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FiShoppingBag className="text-sky-500" /> Direct Checkout</h2>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6 flex gap-4 items-center border border-slate-200">
                            <MedicineImage src={medicine.image} name={medicine.name} className="w-16 h-16 object-contain rounded" fallbackSize={30} />
                            <div className="flex-1">
                                <div className="font-bold text-slate-800">{medicine.name}</div>
                                <div className="text-sm text-slate-500">Qty: {qty} &times; {fmt(medicine.selling_price)}</div>
                            </div>
                            <div className="font-bold text-lg text-sky-600">{fmt(medicine.selling_price * qty)}</div>
                        </div>

                        <form onSubmit={handleQuickCheckout} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="form-label text-sm">Full Name *</label><input type="text" required value={checkoutForm.name} onChange={e => setCheckoutForm(f => ({ ...f, name: e.target.value }))} className="form-input bg-white" /></div>
                                <div><label className="form-label text-sm">Phone Number *</label><input type="tel" required value={checkoutForm.phone} onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))} className="form-input bg-white" /></div>
                            </div>

                            <div>
                                <label className="form-label text-sm mb-3">Payment Method</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[{ id: 'transfer', l: 'Phone/Bank Transfer' }, { id: 'cash', l: 'Cash on Pickup' }].map(m => (
                                        <label key={m.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${checkoutForm.payment_method === m.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                                            <input type="radio" checked={checkoutForm.payment_method === m.id} onChange={() => setCheckoutForm(f => ({ ...f, payment_method: m.id }))} className="w-5 h-5 text-sky-600" />
                                            <span className="font-bold text-slate-700">{m.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {checkoutForm.payment_method === 'transfer' && (
                                <div className="border-2 border-dashed border-sky-300 bg-sky-50/30 rounded-xl p-6 text-center hover:border-sky-500 transition-colors cursor-pointer relative">
                                    <input type="file" accept="image/*" onChange={handleScreenshotChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    {ssPreview ? (
                                        <div className="relative z-0"><img src={ssPreview} alt="Screenshot" className="mx-auto max-h-48 rounded shadow-md" /><p className="text-sm text-sky-600 mt-3 font-bold bg-white inline-block px-3 py-1 rounded-full border border-sky-200">Change payment screenshot</p></div>
                                    ) : (
                                        <div className="relative z-0 py-4"><FiUploadCloud className="mx-auto text-sky-400 mb-2" size={40} /><div className="font-bold text-slate-800 text-lg">Upload Transfer Screenshot *</div><div className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Please transfer <b>{fmt(medicine.selling_price * qty)}</b> using CBE/Telebirr and upload the receipt image here.</div></div>
                                    )}
                                </div>
                            )}

                            <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-4 font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSubmitting ? <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Confirm Order & Send Proof'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
