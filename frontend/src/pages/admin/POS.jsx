import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiPrinter, FiUser, FiBarChart, FiUserCheck, FiX } from 'react-icons/fi';
import { MdPointOfSale } from 'react-icons/md';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function POS() {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('fixed');
    const [taxRate, setTaxRate] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [loading, setLoading] = useState(false);

    // Modes: 'walkin' or 'online'
    const [activeTab, setActiveTab] = useState('walkin');

    const [pendingOrders, setPendingOrders] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [verifyingOrder, setVerifyingOrder] = useState(null);
    const searchRef = useRef();

    useEffect(() => {
        if (activeTab === 'online') {
            fetchPendingOrders();
        }
    }, [activeTab]);

    const fetchPendingOrders = async () => {
        setLoadingPending(true);
        try {
            const res = await api.get('/orders?payment_status=pending&order_type=online');
            setPendingOrders(res.data.data);
        } catch { toast.error('Failed to load pending transfers'); }
        setLoadingPending(false);
    };

    const verifyOnlineOrder = async (orderId) => {
        setVerifyingOrder(orderId);
        try {
            await api.patch(`/orders/${orderId}/approve`);
            toast.success('Payment verified and stock deducted!');
            fetchPendingOrders();
            fetchMedicines();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Verification failed');
        }
        setVerifyingOrder(null);
    };

    // Search medicines
    useEffect(() => {
        if (!search.trim()) { setResults([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await api.get(`/medicines?search=${encodeURIComponent(search)}&limit=8&status=available`);
                setResults(res.data.data);
            } catch { }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Search customers
    useEffect(() => {
        if (!customerSearch.trim()) { setCustomers([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await api.get(`/customers?search=${encodeURIComponent(customerSearch)}&limit=5`);
                setCustomers(res.data.data);
            } catch { }
        }, 300);
        return () => clearTimeout(timer);
    }, [customerSearch]);

    const addToCart = (medicine) => {
        if (medicine.quantity <= 0) return toast.error('Out of stock');
        setCart(prev => {
            const exist = prev.find(i => i.medicine_id === medicine.id);
            if (exist) {
                if (exist.quantity >= medicine.quantity) return toast.error('Cannot exceed available stock') || prev;
                return prev.map(i => i.medicine_id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { medicine_id: medicine.id, medicine_name: medicine.name, barcode: medicine.barcode, unit_price: parseFloat(medicine.selling_price), quantity: 1, max_qty: medicine.quantity, item_discount: 0 }];
        });
        setSearch('');
        setResults([]);
    };

    const removeItem = (id) => setCart(prev => prev.filter(i => i.medicine_id !== id));
    const updateQty = (id, qty) => {
        if (qty < 1) return removeItem(id);
        setCart(prev => prev.map(i => i.medicine_id === id ? { ...i, quantity: Math.min(qty, i.max_qty) } : i));
    };

    const subtotal = cart.reduce((s, i) => s + (i.unit_price * i.quantity) - (i.item_discount || 0), 0);
    const discountAmt = discountType === 'percentage' ? subtotal * discount / 100 : parseFloat(discount) || 0;
    const taxAmt = (subtotal - discountAmt) * taxRate / 100;
    const total = Math.max(0, subtotal - discountAmt + taxAmt);
    const change = parseFloat(amountPaid || 0) - total;
    const fmt = (n) => `ETB ${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const handleCheckout = async () => {
        if (!cart.length) return toast.error('Cart is empty');
        if (parseFloat(amountPaid || 0) < total) return toast.error('Insufficient payment amount');
        setLoading(true);
        try {
            const payload = {
                customer_id: customer?.id || null,
                customer_name: customer?.name || 'Walk-in Customer',
                customer_phone: customer?.phone || '',
                order_type: 'pos',
                items: cart,
                payment_method: paymentMethod,
                discount,
                discount_type: discountType,
                tax_rate: taxRate,
                delivery_type: 'pickup',
                amount_paid: parseFloat(amountPaid || total),
            };
            const res = await api.post('/orders', payload);
            toast.success(`Sale completed! Order: ${res.data.order_number}`);
            printReceipt(res.data.order_number);
            setCart([]);
            setCustomer(null);
            setCustomerSearch('');
            setAmountPaid('');
            setDiscount(0);
            setTaxRate(0);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Checkout failed');
        } finally { setLoading(false); }
    };

    const printReceipt = (orderNumber) => {
        const win = window.open('', '_blank', 'width=400,height=600');
        win.document.write(`
      <html><head><title>Receipt</title>
      <style>body{font-family:monospace;padding:20px;font-size:12px}h2{text-align:center}.line{border-top:1px dashed #000;margin:8px 0}.total{font-size:14px;font-weight:bold}.row{display:flex;justify-content:space-between}</style>
      </head><body>
      <h2>AB PHARMA</h2><p style="text-align:center">Smart Pharmacy<br>Tel: +234-000-0000<br>${new Date().toLocaleString()}</p>
      <div class="line"></div><p>Order: ${orderNumber}</p><p>Customer: ${customer?.name || 'Walk-in'}</p>
      <div class="line"></div>
      ${cart.map(i => `<div class="row"><span>${i.medicine_name} x${i.quantity}</span><span>ETB ${(i.unit_price * i.quantity).toLocaleString()}</span></div>`).join('')}
      <div class="line"></div>
      <div class="row"><span>Subtotal:</span><span>${fmt(subtotal)}</span></div>
      ${discountAmt > 0 ? `<div class="row"><span>Discount:</span><span>-${fmt(discountAmt)}</span></div>` : ''}
      ${taxAmt > 0 ? `<div class="row"><span>Tax:</span><span>+${fmt(taxAmt)}</span></div>` : ''}
      <div class="line"></div>
      <div class="row total"><span>TOTAL:</span><span>${fmt(total)}</span></div>
      <div class="row"><span>Paid:</span><span>${fmt(parseFloat(amountPaid || total))}</span></div>
      <div class="row"><span>Change:</span><span>${fmt(Math.max(0, change))}</span></div>
      <div class="line"></div><p style="text-align:center">Thank you for your purchase!</p>
      </body></html>
    `);
        win.print();
        win.close();
    };

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-100px)]">

            {/* Header with Mode Toggles */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <MdPointOfSale className="text-sky-600" size={32} />
                    AB Pharma POS Center
                </h1>
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('walkin')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'walkin' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <MdPointOfSale size={20} />
                        Walk-In Register
                    </button>
                    <button
                        onClick={() => setActiveTab('online')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all relative ${activeTab === 'online' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FiUserCheck size={20} />
                        Online Orders Verification
                        {activeTab === 'walkin' && pendingOrders.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-bounce border-2 border-white">{pendingOrders.length}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {activeTab === 'walkin' ? (
                <div className="flex gap-4 flex-1 overflow-hidden">
                    {/* Left - Product Search */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">

                        <div className="card p-3">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input ref={searchRef} type="text" placeholder="Search medicine..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    className="form-input pl-10" autoFocus />
                            </div>
                            {results.length > 0 && (
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                    {results.map(m => (
                                        <button key={m.id} onClick={() => addToCart(m)}
                                            className={`flex items-center gap-3 p-3 border rounded-xl text-left transition-all ${m.quantity <= 0 ? 'opacity-50 cursor-not-allowed border-slate-200' : 'border-slate-200 hover:border-sky-400 hover:bg-sky-50'}`}
                                            disabled={m.quantity <= 0}>
                                            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-bold text-sm flex-shrink-0">
                                                {m.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-slate-800 truncate">{m.name}</div>
                                                <div className="text-xs text-slate-500">{m.strength} ETB Stock: {m.quantity}</div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-sm font-bold text-green-600">ETB {parseFloat(m.selling_price).toLocaleString()}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="card flex-1 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">Cart ({cart.length} items)</h3>
                                {cart.length > 0 && <button onClick={() => setCart([])} className="text-sm text-red-500 hover:text-red-700">Clear All</button>}
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                <AnimatePresence>
                                    {cart.map(item => (
                                        <motion.div key={item.medicine_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-slate-800 truncate">{item.medicine_name}</div>
                                                <div className="text-xs text-slate-500">ETB {item.unit_price.toLocaleString()} each</div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button onClick={() => updateQty(item.medicine_id, item.quantity - 1)} className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center"><FiMinus size={12} /></button>
                                                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                                <button onClick={() => updateQty(item.medicine_id, item.quantity + 1)} className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center"><FiPlus size={12} /></button>
                                            </div>
                                            <div className="text-right font-bold text-sm">ETB {(item.unit_price * item.quantity).toLocaleString()}</div>
                                            <button onClick={() => removeItem(item.medicine_id)} className="text-red-400"><FiTrash2 size={14} /></button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="w-80 flex flex-col gap-4">
                        <div className="card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FiUser size={15} className="text-slate-500" />
                                <h3 className="font-semibold text-slate-700 text-sm">Customer (Optional)</h3>
                            </div>
                            {customer ? (
                                <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg p-2.5">
                                    <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-bold text-sm">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-slate-800">{customer.name}</div>
                                        <div className="text-xs text-slate-500">{customer.phone}</div>
                                    </div>
                                    <button onClick={() => setCustomer(null)} className="text-slate-400 hover:text-red-500"><FiX /> </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input type="text" placeholder="Search customer name or phone..."
                                        value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                                        className="form-input text-sm" />
                                    {customers.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20">
                                            {customers.map(c => (
                                                <button key={c.id} onClick={() => { setCustomer(c); setCustomerSearch(''); setCustomers([]); }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 text-left">
                                                    <div className="w-7 h-7 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-bold text-xs">{c.name.charAt(0)}</div>
                                                    <div><div className="text-sm font-medium">{c.name}</div><div className="text-xs text-slate-400">{c.phone}</div></div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Discount & Tax */}
                        <div className="card p-4 space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="form-label text-xs">Discount</label>
                                    <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} className="form-input text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="form-label text-xs">Type</label>
                                    <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="form-input text-sm w-28">
                                        <option value="fixed">ETB  Fixed</option>
                                        <option value="percentage">% Percent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="form-label text-xs">Tax Rate (%)</label>
                                <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="form-input text-sm" placeholder="0" />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="card p-4 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
                            {discountAmt > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{fmt(discountAmt)}</span></div>}
                            {taxAmt > 0 && <div className="flex justify-between text-sm text-slate-600"><span>Tax ({taxRate}%)</span><span>+{fmt(taxAmt)}</span></div>}
                            <div className="border-t border-slate-200 pt-2 flex justify-between text-lg font-bold text-slate-800">
                                <span>Total</span><span className="text-sky-700">{fmt(total)}</span>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="card p-4 space-y-3">
                            <div>
                                <label className="form-label text-xs">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    {['cash', 'card', 'transfer', 'mobile_money'].map(m => (
                                        <button key={m} onClick={() => setPaymentMethod(m)}
                                            className={`py-1.5 text-xs font-semibold rounded-lg border-2 transition-all capitalize ${paymentMethod === m ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                            {m.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="form-label text-xs">Amount Paid (ETB )</label>
                                <input type="number" min="0" value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                                    className="form-input font-semibold text-lg" placeholder={total.toFixed(2)} />
                            </div>
                            {parseFloat(amountPaid) >= total && parseFloat(amountPaid) > 0 && (
                                <div className="flex justify-between text-sm font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                    <span>Change</span><span>{fmt(Math.max(0, change))}</span>
                                </div>
                            )}
                            <button onClick={handleCheckout} disabled={loading || cart.length === 0}
                                className="w-full btn-secondary bg-sky-600 hover:bg-sky-500 text-white justify-center py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    : <><FiPrinter size={18} /> Complete Sale</>}
                            </button>
                        </div>
                    </div>
                </div> // End Walkin Div
            ) : (
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="mx-auto max-w-5xl">
                        {loadingPending ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                                <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4" />
                                <p className="font-semibold">Searching for pending orders...</p>
                            </div>
                        ) : pendingOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <FiUserCheck size={64} className="mb-4 text-sky-200" />
                                <h2 className="text-xl font-bold text-slate-700">All Caught Up!</h2>
                                <p className="mt-2 text-center text-slate-500">There are no pending online bank transfers waiting to be verified.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {pendingOrders.map(o => (
                                    <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-lg text-slate-800">{o.order_number}</div>
                                                <div className="text-sm font-medium text-slate-600 mt-1">{o.customer_name}</div>
                                                <div className="text-xs text-slate-500">{o.customer_phone}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-2xl text-sky-600">ETB {parseFloat(o.total).toLocaleString()}</div>
                                                <div className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded inline-block mt-2 border border-amber-200">
                                                    AWAITING VERIFICATION
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col sm:flex-row gap-6">
                                            <div className="w-full sm:w-1/2 flex flex-col gap-3 justify-center items-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <h3 className="font-semibold text-slate-700 text-sm">Payment Screenshot</h3>
                                                {o.payment_screenshot ? (
                                                    <a href={o.payment_screenshot} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded shadow-sm">
                                                        <img src={o.payment_screenshot} alt="Payment Proof" className="max-h-40 w-full object-cover transition-transform group-hover:scale-105" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm backdrop-blur-[2px]">
                                                            View Full Screen
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div className="py-8 text-center text-slate-400">
                                                        <span className="text-sm">No Image Uploaded</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-full sm:w-1/2 flex flex-col justify-center">
                                                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                                    Please verify that the payment screenshot matches the total order amount of <strong className="text-slate-800">ETB {parseFloat(o.total).toLocaleString()}</strong>. Upon clicking complete, stock will be automatically deducted.
                                                </p>
                                                <button
                                                    disabled={verifyingOrder === o.id}
                                                    onClick={() => verifyOnlineOrder(o.id)}
                                                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] flex flex-col items-center justify-center gap-1 hover:-translate-y-0.5 active:translate-y-0"
                                                >
                                                    {verifyingOrder === o.id ? (
                                                        <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying...</span>
                                                    ) : (
                                                        <>
                                                            <span className="flex items-center gap-2 text-[15px]"><FiUserCheck size={18} /> Complete Payment</span>
                                                            <span className="text-[11px] text-emerald-100 font-medium opacity-90">Verify & Deduct Stock</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
