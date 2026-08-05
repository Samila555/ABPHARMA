import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
    ShoppingBag, X, User, Phone, Smartphone, Banknote,
    UploadCloud, CheckCircle2, AlertCircle, Package,
    Clock, Loader2, ChevronRight, ImageIcon, Trash2, Shield, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import MedicineImage from '../MedicineImage';

const fmt = (n) => `ETB ${parseFloat(n || 0).toLocaleString('en')}`;

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
    const total = parseFloat(medicine?.selling_price || 0) * qty;

    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPG / PNG).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Maximum size is 5 MB.');
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

    const paymentOptions = [
        { id: 'transfer', Icon: Smartphone, label: 'Phone / Bank Transfer', sub: 'CBE · Telebirr · Amole' },
        { id: 'cash', Icon: Banknote, label: 'Cash on Pickup', sub: 'Pay at the pharmacy' },
    ];

    return (
        /* ── Overlay ── */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            {/* ── Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 48, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 28, stiffness: 320 } }}
                exit={{ opacity: 0, y: 40, scale: 0.96 }}
                className="relative bg-white rounded-3xl overflow-hidden flex flex-col"
                style={{ width: '100%', maxWidth: 660, maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Scrollable body ── */}
                <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>

                    {/* ═══ HEADER ═══ */}
                    <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-7 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg,#2563EB,#06B6D4)' }}
                            >
                                <ShoppingBag size={18} color="white" strokeWidth={2.2} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 leading-tight">Direct Checkout</h2>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Shield size={10} className="text-emerald-500" strokeWidth={2.5} />
                                    Complete your order securely
                                </p>
                            </div>
                        </div>
                        <motion.button
                            onClick={onClose}
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.18 }}
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                        >
                            <X size={16} strokeWidth={2.5} />
                        </motion.button>
                    </div>

                    {/* ═══ SUCCESS STATE ═══ */}
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-7 py-10 flex flex-col items-center text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1, stiffness: 260 }}
                                    className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mb-6"
                                >
                                    <CheckCircle2 size={46} className="text-emerald-500" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Submitted!</h3>
                                <p className="text-slate-500 text-sm max-w-xs">
                                    Your payment proof has been received. Our cashier will verify it shortly.
                                </p>
                                {orderNumber && (
                                    <div className="mt-4 px-5 py-2 rounded-full bg-blue-50 text-blue-700 font-mono text-sm font-semibold border border-blue-100">
                                        Order # {orderNumber}
                                    </div>
                                )}
                                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                                    <Clock size={14} className="text-blue-400" />
                                    Estimated confirmation:&nbsp;<span className="font-semibold text-slate-700">5 – 15 minutes</span>
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

                            /* ═══ FORM ═══ */
                            <motion.div key="form" className="px-7 py-6 space-y-6">

                                {/* ── Product Preview ── */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                                        <MedicineImage
                                            src={medicine?.image}
                                            name={medicine?.name}
                                            className="w-full h-full object-contain"
                                            fallbackSize={26}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm leading-snug truncate">{medicine?.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Qty: <span className="font-semibold text-slate-700">{qty}</span>
                                            &nbsp;×&nbsp;
                                            <span className="font-semibold text-slate-700">{fmt(medicine?.selling_price)}</span>
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xl font-black text-blue-600">{fmt(total)}</p>
                                        <p className="text-xs font-semibold text-emerald-500 mt-0.5">Free Delivery</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                    {/* ── Customer Information ── */}
                                    <section>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3">
                                            Customer Information
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                            {/* Full Name */}
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-slate-600 ml-1">Full Name *</label>
                                                <div className={`flex items-center gap-2 rounded-xl border bg-white px-4 py-3 transition-all
                                                    ${errors.name
                                                        ? 'border-red-400 ring-2 ring-red-100'
                                                        : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                                                    }`}
                                                >
                                                    <User size={15} className="text-slate-400 flex-shrink-0" strokeWidth={2} />
                                                    <input
                                                        {...register('name', { required: 'Full name is required' })}
                                                        placeholder="e.g. Abebe Kebede"
                                                        className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none min-w-0"
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                                                        <AlertCircle size={10} /> {errors.name.message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-slate-600 ml-1">Phone Number *</label>
                                                <div className={`flex items-center gap-2 rounded-xl border bg-white px-4 py-3 transition-all
                                                    ${errors.phone
                                                        ? 'border-red-400 ring-2 ring-red-100'
                                                        : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                                                    }`}
                                                >
                                                    <Phone size={15} className="text-slate-400 flex-shrink-0" strokeWidth={2} />
                                                    <input
                                                        {...register('phone', { required: 'Phone number is required' })}
                                                        placeholder="e.g. +251 9XX XXX XXX"
                                                        type="tel"
                                                        className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none min-w-0"
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                                                        <AlertCircle size={10} /> {errors.phone.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* ── Payment Method ── */}
                                    <section>
                                        <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3">
                                            Payment Method
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {paymentOptions.map(({ id, Icon, label, sub }) => {
                                                const active = paymentMethod === id;
                                                return (
                                                    <motion.button
                                                        key={id}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(id)}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
                                                            ${active
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                                                            ${active
                                                                ? 'bg-blue-500'
                                                                : 'bg-slate-100'
                                                            }`}
                                                        >
                                                            <Icon size={16} color={active ? 'white' : '#64748b'} strokeWidth={2} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-sm font-bold leading-tight ${active ? 'text-blue-700' : 'text-slate-800'}`}>
                                                                {label}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                                                        </div>
                                                        {active && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
                                                            >
                                                                <CheckCircle2 size={13} color="white" strokeWidth={2.5} />
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* ── Upload Section ── */}
                                    <AnimatePresence>
                                        {paymentMethod === 'transfer' && (
                                            <motion.section
                                                key="upload"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.22, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                {/* Notice */}
                                                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500 mb-4">
                                                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                                                    <p className="text-sm text-blue-800 leading-relaxed">
                                                        Please transfer&nbsp;
                                                        <strong className="font-black">{fmt(total)}</strong>
                                                        &nbsp;using CBE, Telebirr, or Bank Transfer, then upload the payment receipt below.
                                                    </p>
                                                </div>

                                                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-3">
                                                    Upload Payment Receipt
                                                </p>

                                                {!ssPreview ? (
                                                    <motion.div
                                                        whileHover={{ scale: 1.01 }}
                                                        onDrop={onDrop}
                                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                        onDragLeave={() => setIsDragging(false)}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                                                            ${isDragging
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                                                            }`}
                                                    >
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => processFile(e.target.files[0])}
                                                        />
                                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                                            <UploadCloud size={26} className="text-slate-400" strokeWidth={1.8} />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-bold text-slate-800 text-sm">Upload Transfer Receipt</p>
                                                            <p className="text-slate-500 text-xs mt-1">Drag & drop your screenshot here, or</p>
                                                            <span className="inline-block mt-2 px-4 py-1.5 rounded-full border border-blue-300 bg-white text-blue-600 text-xs font-semibold shadow-sm">
                                                                Browse Files
                                                            </span>
                                                            <p className="mt-2 text-slate-400 text-[11px]">
                                                                Accepted: JPG &bull; PNG &nbsp;&nbsp;|&nbsp;&nbsp; Max: 5 MB
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="relative rounded-2xl overflow-hidden border-2 border-emerald-400"
                                                        style={{ boxShadow: '0 0 0 4px rgba(16,185,129,0.12)' }}
                                                    >
                                                        <img
                                                            src={ssPreview}
                                                            alt="Payment Receipt"
                                                            className="w-full max-h-52 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-4 justify-between">
                                                            <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
                                                                <CheckCircle2 size={15} className="text-emerald-300" />
                                                                Upload Successful
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold transition-colors"
                                                                >
                                                                    <ImageIcon size={12} /> Replace
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setScreenshotFile(null); setSsPreview(null); }}
                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
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
                                            </motion.section>
                                        )}
                                    </AnimatePresence>

                                    {/* ── Order Summary ── */}
                                    <section className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                                            <Package size={13} className="text-slate-400" strokeWidth={2} />
                                            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Order Summary</span>
                                        </div>
                                        <div className="px-5 py-4 space-y-2.5 text-sm">
                                            <div className="flex justify-between text-slate-600">
                                                <span>Product Price</span>
                                                <span className="font-semibold text-slate-900">{fmt(total)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>Delivery</span>
                                                <span className="font-bold text-emerald-600">Free</span>
                                            </div>
                                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                                <span className="font-bold text-slate-900 text-base">Total</span>
                                                <span className="text-2xl font-black text-blue-600">{fmt(total)}</span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* ── Submit Button ── */}
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={!isSubmitting ? { scale: 1.015, y: -2 } : {}}
                                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        style={{
                                            background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg,#2563EB,#06B6D4)',
                                            boxShadow: isSubmitting ? 'none' : '0 8px 24px rgba(37,99,235,0.30)',
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Processing your order...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} strokeWidth={2.5} />
                                                Confirm Order &amp; Upload Proof
                                                <ChevronRight size={16} strokeWidth={2.5} />
                                            </>
                                        )}
                                    </motion.button>

                                    <p className="text-center text-xs text-slate-400 pb-2 flex items-center justify-center gap-1">
                                        <Shield size={10} className="text-emerald-500" />
                                        Your information is encrypted and secure
                                    </p>

                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
