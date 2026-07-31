import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
    ShoppingBag, X, User, Phone, Smartphone, Banknote, UploadCloud,
    CheckCircle2, AlertCircle, Package, Clock, Loader2, ChevronRight,
    ImageIcon, Trash2, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import MedicineImage from '../MedicineImage';

/* ─────────────────────────── helpers ───────────────────────────── */
const fmt = (n) => `ETB ${parseFloat(n || 0).toLocaleString('en', { minimumFractionDigits: 0 })}`;

/* ─────────────────── backdrop / overlay ────────────────────────── */
const Backdrop = ({ onClick }) => (
    <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClick}
    />
);

/* ────────────────────────── main modal ─────────────────────────── */
export default function DirectCheckoutModal({ medicine, qty, onClose }) {
    const [paymentMethod, setPaymentMethod] = useState('transfer');
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [ssPreview, setSsPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const fileInputRef = useRef();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const total = parseFloat(medicine.selling_price || 0) * qty;

    /* ─── file handling ─── */
    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPG/PNG).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Max 5 MB.');
            return;
        }
        setScreenshotFile(file);
        const r = new FileReader();
        r.onload = (ev) => setSsPreview(ev.target.result);
        r.readAsDataURL(file);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    }, []);

    const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const removeImage = () => { setScreenshotFile(null); setSsPreview(null); };

    /* ─── submit ─── */
    const onSubmit = async (data) => {
        if (paymentMethod === 'transfer' && !screenshotFile) {
            toast.error('Please upload your payment screenshot.');
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('customer_name', data.name);
            formData.append('customer_phone', data.phone);
            formData.append('payment_method', paymentMethod);
            formData.append('items_json', JSON.stringify([{ ...medicine, quantity: qty }]));
            if (screenshotFile) formData.append('screenshot', screenshotFile);

            const res = await api.post('/public/orders', formData);
            setOrderNumber(res.data.order_number || '');
            setSuccess(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ─── animations ─── */
    const modalVariants = {
        hidden: { opacity: 0, y: 60, scale: 0.94 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 26, stiffness: 300 } },
        exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
    };

    const paymentMethods = [
        { id: 'transfer', icon: Smartphone, label: 'Phone / Bank Transfer', sub: 'CBE, Telebirr, Amole' },
        { id: 'cash', icon: Banknote, label: 'Cash on Pickup', sub: 'Pay at the pharmacy' },
    ];

    return (
        <>
            <AnimatePresence>
                <Backdrop onClick={onClose} />
            </AnimatePresence>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                    className="pointer-events-auto w-full bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.22)] overflow-hidden"
                    style={{ maxWidth: 660, maxHeight: '94vh' }}
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Scrollable body */}
                    <div className="overflow-y-auto" style={{ maxHeight: '94vh' }}>

                        {/* ── Header ── */}
                        <div className="relative px-8 pt-8 pb-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg,#2563EB,#06B6D4)' }}>
                                        <ShoppingBag size={20} color="white" />
                                    </div>
                                    <div>
                                        <h2 className="text-[22px] font-bold text-slate-900 leading-tight">Direct Checkout</h2>
                                        <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                                            <Shield size={12} className="text-emerald-500" /> Complete your order securely
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X size={17} />
                                </motion.button>
                            </div>
                            {/* gradient divider */}
                            <div className="mt-6 h-px w-full rounded-full" style={{ background: 'linear-gradient(90deg,#2563EB22,#06B6D444,#2563EB22)' }} />
                        </div>

                        {/* ── Success State ── */}
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="px-8 pb-10 flex flex-col items-center text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', delay: 0.1 }}
                                        className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6 border-4 border-emerald-100"
                                    >
                                        <CheckCircle2 size={48} className="text-emerald-500" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Proof Submitted!</h3>
                                    <p className="text-slate-500 text-base mb-2">Thank you! Your order is now under verification.</p>
                                    {orderNumber && (
                                        <div className="mt-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-mono text-sm font-semibold border border-blue-100">
                                            Order # {orderNumber}
                                        </div>
                                    )}
                                    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                                        <Clock size={15} className="text-blue-500" />
                                        Estimated confirmation: <span className="font-semibold text-slate-700">5–15 minutes</span>
                                    </div>
                                    <motion.button
                                        onClick={onClose}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="mt-8 w-full py-4 rounded-2xl text-white font-bold text-base"
                                        style={{ background: 'linear-gradient(135deg,#2563EB,#06B6D4)' }}
                                    >
                                        Close
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div key="form">
                                    {/* ── Product Card ── */}
                                    <div className="px-8 pb-6">
                                        <motion.div
                                            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(37,99,235,0.10)' }}
                                            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 transition-shadow"
                                        >
                                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                                                <MedicineImage src={medicine.image} name={medicine.name} className="w-full h-full object-contain" fallbackSize={28} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-slate-900 text-sm truncate">{medicine.name}</div>
                                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Qty: {qty}</span>
                                                    <span className="text-xs text-slate-500">× {fmt(medicine.selling_price)} each</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-xl font-black text-blue-600">{fmt(total)}</div>
                                                <div className="text-xs text-emerald-500 font-semibold mt-0.5">Free Delivery</div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* ── Form ── */}
                                    <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-6">

                                        {/* Customer Info */}
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Information</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Full Name */}
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                        <User size={16} />
                                                    </div>
                                                    <input
                                                        {...register('name', { required: 'Full name is required' })}
                                                        placeholder="Full Name"
                                                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-medium bg-white text-slate-800 placeholder-slate-400 outline-none transition-all
                                                        ${errors.name ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
                                                    />
                                                    {errors.name && (
                                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name.message}</p>
                                                    )}
                                                </div>
                                                {/* Phone */}
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                        <Phone size={16} />
                                                    </div>
                                                    <input
                                                        {...register('phone', { required: 'Phone is required' })}
                                                        placeholder="Phone Number"
                                                        type="tel"
                                                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-medium bg-white text-slate-800 placeholder-slate-400 outline-none transition-all
                                                        ${errors.phone ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.phone.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Method</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {paymentMethods.map(({ id, icon: Icon, label, sub }) => {
                                                    const active = paymentMethod === id;
                                                    return (
                                                        <motion.button
                                                            key={id}
                                                            type="button"
                                                            onClick={() => setPaymentMethod(id)}
                                                            whileHover={{ scale: 1.025, y: -2 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer overflow-hidden
                                                            ${active
                                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-[0_0_0_4px_rgba(37,99,235,0.10)]'
                                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                                                                ${active ? 'bg-gradient-to-br from-blue-500 to-cyan-400' : 'bg-slate-100'}`}>
                                                                <Icon size={18} color={active ? 'white' : '#64748b'} />
                                                            </div>
                                                            <div>
                                                                <div className={`font-bold text-sm ${active ? 'text-blue-700' : 'text-slate-700'}`}>{label}</div>
                                                                <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                                                            </div>
                                                            {active && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                                                                >
                                                                    <CheckCircle2 size={13} color="white" />
                                                                </motion.div>
                                                            )}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Screenshot Upload */}
                                        <AnimatePresence>
                                            {paymentMethod === 'transfer' && (
                                                <motion.div
                                                    key="upload"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="overflow-hidden"
                                                >
                                                    {/* Payment Notice */}
                                                    <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border-l-4 border-blue-500">
                                                        <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                                        <div className="text-sm text-blue-800 leading-relaxed">
                                                            Please transfer <span className="font-black">{fmt(total)}</span> using CBE, Telebirr, or Bank Transfer.<br />
                                                            <span className="text-blue-600">Upload the payment receipt to complete your order.</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Upload Payment Receipt</div>

                                                    {!ssPreview ? (
                                                        <motion.div
                                                            whileHover={{ scale: 1.01 }}
                                                            onDrop={onDrop}
                                                            onDragOver={onDragOver}
                                                            onDragLeave={onDragLeave}
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                                                            ${isDragging
                                                                    ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                                                                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 bg-slate-50'}`}
                                                            style={isDragging ? { boxShadow: '0 0 0 4px rgba(37,99,235,0.12)' } : {}}
                                                        >
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => processFile(e.target.files[0])}
                                                            />
                                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragging ? 'bg-blue-100' : 'bg-white border border-slate-200'}`}>
                                                                <UploadCloud size={28} className={isDragging ? 'text-blue-500' : 'text-slate-400'} />
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="font-bold text-slate-700 text-sm">Upload Transfer Receipt</div>
                                                                <div className="text-slate-400 text-xs mt-1">Drag & drop your screenshot here, or</div>
                                                                <div className="mt-2 inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-blue-600 text-xs font-bold shadow-sm hover:shadow transition-shadow">
                                                                    Browse Files
                                                                </div>
                                                                <div className="mt-3 text-slate-400 text-[11px]">Accepted: JPG • PNG &nbsp;|&nbsp; Max: 5 MB</div>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                                                        >
                                                            <img src={ssPreview} alt="Receipt" className="w-full max-h-56 object-cover" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4 justify-between">
                                                                <div className="flex items-center gap-2 text-white text-sm font-bold">
                                                                    <CheckCircle2 size={16} className="text-emerald-400" /> Upload Successful
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="px-3 py-1.5 rounded-lg bg-white/90 text-xs font-bold text-slate-700 hover:bg-white transition-colors flex items-center gap-1"
                                                                    >
                                                                        <ImageIcon size={12} /> Replace
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={removeImage}
                                                                        className="px-3 py-1.5 rounded-lg bg-red-500/90 text-xs font-bold text-white hover:bg-red-500 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Trash2 size={12} /> Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => processFile(e.target.files[0])}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Order Summary */}
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden">
                                            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                                                <Package size={14} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Summary</span>
                                            </div>
                                            <div className="px-5 py-4 space-y-2.5 text-sm">
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Product Price</span><span className="font-semibold text-slate-900">{fmt(total)}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Delivery</span><span className="font-bold text-emerald-600">Free</span>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                                    <span className="font-bold text-slate-900">Total</span>
                                                    <span className="text-2xl font-black text-blue-600">{fmt(total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            whileHover={!isSubmitting ? { scale: 1.02, y: -2, boxShadow: '0 12px 32px rgba(37,99,235,0.35)' } : {}}
                                            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                            style={{ background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg,#2563EB,#06B6D4)', boxShadow: '0 8px 24px rgba(37,99,235,0.28)' }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Processing your order...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} />
                                                    Confirm Order &amp; Upload Proof
                                                    <ChevronRight size={18} />
                                                </>
                                            )}
                                        </motion.button>

                                        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                                            <Shield size={11} className="text-emerald-500" />
                                            Your information is encrypted and secure
                                        </p>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
