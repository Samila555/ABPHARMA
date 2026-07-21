import { useState, useEffect } from 'react';
import { FiEye, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const statusColors = {
    pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
    ready: 'badge-info', delivered: 'badge-success', completed: 'badge-success',
    cancelled: 'badge-danger', refunded: 'badge-secondary'
};
const payColors = { pending: 'badge-warning', paid: 'badge-success', partial: 'badge-warning', refunded: 'badge-secondary' };

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [filters, setFilters] = useState({ search: '', status: '', payment_status: '', order_type: '', page: 1, limit: 20 });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')));
            const res = await api.get(`/orders?${params}`);
            setOrders(res.data.data);
            setTotal(res.data.total);
        } catch { toast.error('Failed to load orders'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [filters.page, filters.status, filters.payment_status, filters.order_type]);

    const viewOrder = async (order) => {
        setSelectedOrder(order);
        try {
            const res = await api.get(`/orders/${order.id}`);
            setOrderItems(res.data.data.items || []);
        } catch { }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            toast.success('Order updated');
            fetchOrders();
            if (selectedOrder?.id === id) setSelectedOrder(o => ({ ...o, status }));
        } catch { toast.error('Failed to update'); }
    };

    const fmt = (n) => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
                    <p className="text-slate-500 text-sm">{total} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-wrap gap-3">
                <div className="flex gap-2 flex-1 min-w-56">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input type="text" placeholder="Order number, customer..." value={filters.search}
                            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="form-input pl-9 text-sm" />
                    </div>
                    <button onClick={fetchOrders} className="btn-primary py-2 text-sm">Search</button>
                </div>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))} className="form-input w-36 text-sm">
                    <option value="">All Status</option>
                    {['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
                <select value={filters.payment_status} onChange={e => setFilters(f => ({ ...f, payment_status: e.target.value, page: 1 }))} className="form-input w-36 text-sm">
                    <option value="">Payment</option>
                    {['pending', 'paid', 'partial', 'refunded'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
                <select value={filters.order_type} onChange={e => setFilters(f => ({ ...f, order_type: e.target.value, page: 1 }))} className="form-input w-32 text-sm">
                    <option value="">All Types</option>
                    <option value="pos">POS</option>
                    <option value="online">Online</option>
                </select>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr><th>Order #</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? Array(10).fill(0).map((_, i) => <tr key={i}><td colSpan={9}><div className="skeleton h-6" /></td></tr>) :
                                orders.map(o => (
                                    <tr key={o.id}>
                                        <td className="font-mono text-xs font-semibold text-sky-700">{o.order_number}</td>
                                        <td className="text-sm">{o.customer_name || 'Walk-in'}<div className="text-xs text-slate-400">{o.customer_phone}</div></td>
                                        <td><span className={`badge ${o.order_type === 'pos' ? 'badge-info' : 'badge-purple'} text-xs`}>{o.order_type?.toUpperCase()}</span></td>
                                        <td className="text-sm font-medium">{o.total_items || 'ETB '}</td>
                                        <td className="font-semibold text-sm">{fmt(o.total)}</td>
                                        <td><span className={`badge ${payColors[o.payment_status] || 'badge-secondary'} text-xs`}>{o.payment_status}</span></td>
                                        <td>
                                            <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                                                className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${statusColors[o.status]?.replace('badge-', 'bg-').replace('success', 'green-100').replace('warning', 'amber-100').replace('danger', 'red-100').replace('info', 'sky-100').replace('secondary', 'slate-100')}`}>
                                                {['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => viewOrder(o)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg">
                                                <FiEye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            {!loading && !orders.length && <tr><td colSpan={9} className="text-center py-10 text-slate-400">No orders found</td></tr>}
                        </tbody>
                    </table>
                </div>
                {total > filters.limit && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                        <div className="text-sm text-slate-500">Showing {(filters.page - 1) * filters.limit + 1}ETB {Math.min(filters.page * filters.limit, total)} of {total}</div>
                        <div className="flex gap-2">
                            <button onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))} disabled={filters.page === 1} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-40">Previous</button>
                            <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page * filters.limit >= total} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-slate-200">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Order Details</h2>
                                <div className="text-sm text-sky-600 font-mono">{selectedOrder.order_number}</div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 text-xl">ETB </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-500 block">Customer</span><span className="font-medium">{selectedOrder.customer_name || 'Walk-in'}</span></div>
                                <div><span className="text-slate-500 block">Phone</span><span className="font-medium">{selectedOrder.customer_phone || 'ETB '}</span></div>
                                <div><span className="text-slate-500 block">Status</span><span className={`badge ${statusColors[selectedOrder.status]}`}>{selectedOrder.status}</span></div>
                                <div><span className="text-slate-500 block">Payment</span><span className={`badge ${payColors[selectedOrder.payment_status]}`}>{selectedOrder.payment_status}</span></div>
                                <div><span className="text-slate-500 block">Date</span><span className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</span></div>
                                <div><span className="text-slate-500 block">Method</span><span className="font-medium capitalize">{selectedOrder.payment_method}</span></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2 text-sm">Order Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="data-table">
                                        <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                                        <tbody>
                                            {orderItems.map(item => (
                                                <tr key={item.id}>
                                                    <td className="text-sm">{item.medicine_name}</td>
                                                    <td className="text-sm">{item.quantity}</td>
                                                    <td className="text-sm">{fmt(item.unit_price)}</td>
                                                    <td className="font-semibold text-sm">{fmt(item.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 pt-3 space-y-1">
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{fmt(selectedOrder.subtotal)}</span></div>
                                {parseFloat(selectedOrder.discount) > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{fmt(selectedOrder.discount)}</span></div>}
                                {parseFloat(selectedOrder.tax) > 0 && <div className="flex justify-between text-sm"><span>Tax</span><span>+{fmt(selectedOrder.tax)}</span></div>}
                                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-sky-700">{fmt(selectedOrder.total)}</span></div>
                                {selectedOrder.change_amount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Change</span><span>{fmt(selectedOrder.change_amount)}</span></div>}
                            </div>

                            {selectedOrder.payment_screenshot && (
                                <div className="border-t border-slate-200 pt-4 mt-2">
                                    <h3 className="font-semibold text-slate-700 mb-2 text-sm flex items-center justify-between">
                                        Customer Payment Proof
                                    </h3>
                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                                        <a href={selectedOrder.payment_screenshot} target="_blank" rel="noreferrer">
                                            <img src={selectedOrder.payment_screenshot} alt="Receipt" className="max-h-48 rounded mx-auto cursor-pointer shadow-sm hover:opacity-90 transition-opacity" />
                                        </a>
                                    </div>
                                    {selectedOrder.payment_status === 'pending' && (
                                        <div className="mt-4 flex justify-end gap-3">
                                            <button
                                                className="btn-outline text-red-600 border-red-200 hover:bg-red-50 text-sm"
                                                onClick={() => { updateStatus(selectedOrder.id, 'cancelled'); setSelectedOrder(null); }}
                                            >
                                                Reject Payment
                                            </button>
                                            <button
                                                className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-500 text-sm"
                                                onClick={async () => {
                                                    try {
                                                        await api.patch(`/orders/${selectedOrder.id}/status`, { payment_status: 'paid', status: 'processing' });
                                                        toast.success('Payment Verified!');
                                                        fetchOrders();
                                                        setSelectedOrder({ ...selectedOrder, payment_status: 'paid', status: 'processing' });
                                                    } catch (err) {
                                                        toast.error('Failed to verify payment');
                                                    }
                                                }}
                                            >
                                                Verify & Accept Amount
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
