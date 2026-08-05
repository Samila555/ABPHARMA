import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { FiDownload, FiBarChart2, FiPackage, FiClock, FiTrendingUp, FiUsers } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const tabs = [
    { id: 'sales', label: 'Sales Report', icon: FiTrendingUp },
    { id: 'inventory', label: 'Inventory Report', icon: FiPackage },
    { id: 'expiry', label: 'Expiry Report', icon: FiClock },
    { id: 'profit', label: 'Profit & Loss', icon: FiBarChart2 },
    { id: 'customers', label: 'Customer Report', icon: FiUsers },
];

export default function Reports() {
    const [activeTab, setActiveTab] = useState('sales');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = `from_date=${dateRange.from}&to_date=${dateRange.to}`;
            const res = await api.get(`/reports/${activeTab}?${params}`);
            setData(res.data);
        } catch { toast.error('Failed to load report'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReport(); }, [activeTab]);

    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    const exportCSV = () => {
        if (!data) return;
        let rows = [];
        if (activeTab === 'sales') rows = data.data?.map(r => [r.period, r.orders, r.revenue]) || [];
        else if (activeTab === 'inventory') rows = data.data?.map(r => [r.name, r.quantity, r.min_stock_level, r.stock_status, r.total_value]) || [];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${activeTab}_report.csv`; a.click();
        toast.success('Report exported!');
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800">Reports</h1><p className="text-slate-500 text-sm">Analytics and business insights</p></div>
                <button onClick={exportCSV} className="btn-outline text-sm"><FiDownload size={14} /> Export CSV</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === t.id ? 'bg-sky-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'}`}>
                        <t.icon size={14} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Date range picker */}
            <div className="card p-4 flex gap-4 flex-wrap items-end">
                <div><label className="form-label text-xs">From Date</label><input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))} className="form-input text-sm" /></div>
                <div><label className="form-label text-xs">To Date</label><input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))} className="form-input text-sm" /></div>
                <button onClick={fetchReport} className="btn-primary py-2.5 text-sm">Generate Report</button>
            </div>

            {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>}

            {!loading && data && (
                <>
                    {activeTab === 'sales' && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Orders', value: data.summary?.total_orders || 0 },
                                    { label: 'Total Revenue', value: fmt(data.summary?.total_revenue) },
                                    { label: 'Avg Order Value', value: fmt(data.summary?.avg_order_value) },
                                ].map(s => (
                                    <div key={s.label} className="card p-4 text-center">
                                        <div className="text-xl font-bold text-slate-800">{s.value}</div>
                                        <div className="text-sm text-slate-500">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Chart */}
                            {data.data?.length > 0 && (
                                <div className="card p-5">
                                    <h3 className="font-semibold text-slate-800 mb-4">Revenue Over Time</h3>
                                    <Bar data={{
                                        labels: data.data.map(d => d.period),
                                        datasets: [{ label: 'Revenue', data: data.data.map(d => d.revenue), backgroundColor: 'rgba(3,105,161,0.7)', borderRadius: 4 }]
                                    }} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => `ETB ${v / 1000}K` } } } }} />
                                </div>
                            )}
                            {/* Table */}
                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="data-table">
                                        <thead><tr><th>Period</th><th>Orders</th><th>Revenue</th></tr></thead>
                                        <tbody>
                                            {data.data?.map((r, i) => (
                                                <tr key={i}>
                                                    <td className="font-medium text-sm">{r.period}</td>
                                                    <td className="text-sm">{r.orders}</td>
                                                    <td className="font-semibold text-sm text-green-600">{fmt(r.revenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[
                                    { l: 'Total Medicines', v: data.summary?.total, col: 'text-slate-800' },
                                    { l: 'Low Stock', v: data.summary?.low_stock, col: 'text-amber-600' },
                                    { l: 'Out of Stock', v: data.summary?.out_of_stock, col: 'text-red-600' },
                                    { l: 'Expired', v: data.summary?.expired, col: 'text-red-800' },
                                    { l: 'Stock Value', v: fmt(data.summary?.total_value), col: 'text-green-600' },
                                ].map(s => (
                                    <div key={s.l} className="card p-3 text-center">
                                        <div className={`text-xl font-bold ${s.col}`}>{s.v}</div>
                                        <div className="text-xs text-slate-500">{s.l}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="data-table">
                                        <thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th>Min Level</th><th>Selling Price</th><th>Stock Value</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {data.data?.slice(0, 50).map((m, i) => (
                                                <tr key={i}>
                                                    <td className="font-medium text-sm">{m.name}</td>
                                                    <td className="text-xs"><span className="badge badge-info">{m.category_name || 'ETB '}</span></td>
                                                    <td className={`font-bold text-sm ${m.quantity <= 0 ? 'text-red-600' : m.quantity <= m.min_stock_level ? 'text-amber-600' : 'text-green-600'}`}>{m.quantity}</td>
                                                    <td className="text-sm">{m.min_stock_level}</td>
                                                    <td className="text-sm">{fmt(m.selling_price)}</td>
                                                    <td className="font-semibold text-sm text-green-600">{fmt(m.stock_value)}</td>
                                                    <td>
                                                        <span className={`badge text-xs ${m.stock_status === 'ok' ? 'badge-success' : m.stock_status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>
                                                            {m.stock_status?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'expiry' && (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead><tr><th>Medicine</th><th>Category</th><th>Batch</th><th>Expiry Date</th><th>Days Left</th><th>Stock</th><th>Supplier</th></tr></thead>
                                    <tbody>
                                        {data.data?.map((m, i) => (
                                            <tr key={i}>
                                                <td className="font-medium text-sm">{m.name}</td>
                                                <td className="text-xs"><span className="badge badge-info">{m.category_name || 'ETB '}</span></td>
                                                <td className="text-xs font-mono">{m.batch_number || 'ETB '}</td>
                                                <td className={`font-medium text-sm ${m.days_left < 0 ? 'text-red-600' : m.days_left <= 30 ? 'text-orange-600' : 'text-slate-700'}`}>
                                                    {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : 'ETB '}
                                                </td>
                                                <td>
                                                    <span className={`badge ${m.days_left < 0 ? 'badge-danger' : m.days_left <= 7 ? 'badge-danger' : m.days_left <= 30 ? 'badge-warning' : 'badge-info'}`}>
                                                        {m.days_left < 0 ? `${Math.abs(m.days_left)}d expired` : `${m.days_left}d left`}
                                                    </span>
                                                </td>
                                                <td className="font-semibold text-sm">{m.quantity}</td>
                                                <td className="text-sm">{m.supplier_name || 'ETB '}</td>
                                            </tr>
                                        ))}
                                        {!data.data?.length && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No expiring medicines in this range</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profit' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {[
                                    { l: 'Revenue', v: fmt(data.data?.revenue), c: 'text-green-600', bg: 'bg-green-50' },
                                    { l: 'Cost of Goods', v: fmt(data.data?.cost), c: 'text-red-600', bg: 'bg-red-50' },
                                    { l: 'Gross Profit', v: fmt(data.data?.gross_profit), c: data.data?.gross_profit >= 0 ? 'text-sky-600' : 'text-red-600', bg: 'bg-sky-50' },
                                    { l: 'Other Expenses', v: fmt(data.data?.expenses), c: 'text-orange-600', bg: 'bg-orange-50' },
                                    { l: 'Net Profit', v: fmt(data.data?.net_profit), c: data.data?.net_profit >= 0 ? 'text-green-700' : 'text-red-700', bg: data.data?.net_profit >= 0 ? 'bg-green-50' : 'bg-red-50' },
                                ].map(s => (
                                    <div key={s.l} className={`card p-4 ${s.bg} border-0`}>
                                        <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
                                        <div className="text-xs text-slate-500 mt-1">{s.l}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="card p-5">
                                <h3 className="font-semibold text-slate-800 mb-2">Period: {data.data?.period?.from} ETB  {data.data?.period?.to}</h3>
                                <div className="text-sm text-slate-600">Revenue ETB  Cost of Goods = Gross Profit ({fmt(data.data?.gross_profit)})<br />Gross Profit ETB  Other Expenses = Net Profit ({fmt(data.data?.net_profit)})</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'customers' && (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead><tr><th>Customer</th><th>Phone</th><th>City</th><th>Orders</th><th>Total Spent</th><th>Membership</th></tr></thead>
                                    <tbody>
                                        {data.data?.map((c, i) => (
                                            <tr key={i}>
                                                <td className="font-medium text-sm">{c.name}</td>
                                                <td className="text-sm">{c.phone || 'ETB '}</td>
                                                <td className="text-sm">{c.city || 'ETB '}</td>
                                                <td className="font-semibold text-sm">{c.order_count}</td>
                                                <td className="font-bold text-sm text-green-600">{fmt(c.total_spent)}</td>
                                                <td><span className="badge badge-info capitalize text-xs">{c.membership_type}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
