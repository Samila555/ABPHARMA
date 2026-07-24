import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiTruck, FiHome, FiSearch, FiArrowRight } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function OrderTracking() {
    const { orderNumber: paramOrder } = useParams();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState(paramOrder || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchOrder = async (orderNum) => {
        if (!orderNum) return;
        setLoading(true);
        try {
            const res = await api.get(`/orders/track/${orderNum}`);
            setOrder({ ...res.data.data.order, items: res.data.data.items });
        } catch {
            toast.error('Order not found. Please check your tracking number.');
            setOrder(null);
        } finally { setLoading(false); }
    };

    useEffect(() => { if (paramOrder) fetchOrder(paramOrder); }, [paramOrder]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) fetchOrder(searchQuery.trim());
    };

    const steps = [
        { id: 'pending', label: 'Order Placed', icon: FiCheckCircle },
        { id: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
        { id: 'processing', label: 'Processing', icon: FiPackage },
        { id: 'ready', label: 'Ready for Pickup', icon: FiHome },
        { id: 'completed', label: 'Picked Up', icon: FiCheckCircle }
    ];

    const getStepIndex = (status) => steps.findIndex(s => s.id === status);
    const currentIndex = getStepIndex(order?.status);
    const isCancelled = order?.status === 'cancelled';
    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">

                {location.state?.justOrdered && (
                    <div className="text-center mb-10 bg-green-50 border border-green-200 rounded-2xl p-8 shadow-sm">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <FiCheckCircle size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-green-800 mb-2">Order Successfully Placed!</h1>
                        <p className="text-green-600">Thank you for choosing AB Pharma. Your order number is <strong>{order?.order_number}</strong>.</p>
                    </div>
                )}

                <div className="text-center mb-12">
                    {!location.state?.justOrdered && <h1 className="text-3xl font-bold text-slate-800 mb-4">Track Your Order</h1>}
                    <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Enter Order Number (e.g. ORD-...)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm" />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? '...' : 'Track'}</button>
                    </form>
                </div>

                {loading && <div className="flex justify-center"><div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>}

                {order && !loading && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Tracking Timeline */}
                        <div className="card p-8">
                            <div className="flex justify-between items-end mb-8">
                                <div><h2 className="text-xl font-bold text-slate-800">Order #{order.order_number}</h2><p className="text-slate-500 text-sm">Placed on {new Date(order.created_at).toLocaleString()}</p></div>
                                <div className={`badge ${isCancelled ? 'badge-danger' : order.status === 'completed' ? 'badge-success' : 'badge-info'} text-sm px-3 py-1 uppercase`}>{order.status}</div>
                            </div>

                            {isCancelled ? (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center border border-red-200 font-medium">This order has been cancelled.</div>
                            ) : (
                                <div className="relative pt-10 pb-4">
                                    <div className="absolute top-14 left-0 w-full h-1 bg-slate-100 rounded-full" />
                                    <div className="absolute top-14 left-0 h-1 bg-sky-500 rounded-full transition-all duration-1000" style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }} />

                                    <div className="relative flex justify-between">
                                        {steps.map((step, i) => {
                                            const active = i <= currentIndex;
                                            return (
                                                <div key={step.id} className="flex flex-col items-center w-24 -ml-12">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${active ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                                        <step.icon size={18} />
                                                    </div>
                                                    <div className={`text-xs font-semibold mt-3 text-center transition-colors ${active ? 'text-sky-700' : 'text-slate-400'}`}>{step.label}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card p-6">
                                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Pickup Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-slate-500 block">Name</span><span className="font-semibold text-slate-800">{order.customer_name}</span></div>
                                    <div><span className="text-slate-500 block">Phone</span><span className="font-semibold text-slate-800">{order.customer_phone}</span></div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Order Summary</h3>
                                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                                    {order.items?.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-slate-600">{item.quantity}x {item.medicine_name}</span>
                                            <span className="font-semibold">{fmt(item.total)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-slate-100 pt-3 space-y-1 text-sm">
                                    <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                                    {parseFloat(order.tax) > 0 && <div className="flex justify-between text-slate-500"><span>Tax</span><span>+{fmt(order.tax)}</span></div>}
                                    <div className="flex justify-between font-bold text-lg text-slate-800 pt-2"><span>Total</span><span className="text-sky-600">{fmt(order.total)}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Screenshot Upload */}
                        {order.payment_status === 'pending' && (
                            <div className="card p-6 mt-6 border-2 border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Upload Payment Proof</h3>
                                <p className="text-sm text-slate-600 mb-4">Please upload a screenshot of your bank transfer or mobile money receipt.</p>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-sky-500 transition-colors relative bg-slate-50 relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('screenshot', file);
                                            try {
                                                const res = await api.post(`/orders/${order.id}/payment-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                toast.success('Payment proof uploaded successfully!');
                                                fetchOrder(order.order_number); // Refresh
                                            } catch (err) {
                                                toast.error('Failed to upload proof.');
                                            }
                                        }}
                                    />
                                    <div className="py-2">
                                        <div className="font-semibold text-slate-700">Click or tap to upload receipt image</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {order.payment_screenshot && (
                            <div className="card p-6 mt-6 bg-green-50 border border-green-200">
                                <h3 className="font-bold text-green-800 mb-2 border-b border-green-200 pb-2">Payment Proof Uploaded</h3>
                                <p className="text-sm text-green-700 mb-3">Your receipt has been submitted and is waiting for cashier verification.</p>
                                <img src={order.payment_screenshot} alt="Payment Receipt" className="max-h-48 rounded shadow-sm" />
                            </div>
                        )}

                        <div className="text-center mt-8">
                            <Link to="/medicines" className="btn-outline inline-flex items-center gap-2">Continue Shopping <FiArrowRight /></Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
