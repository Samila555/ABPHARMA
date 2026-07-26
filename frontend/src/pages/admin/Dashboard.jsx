import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiTrendingUp, FiPackage, FiUsers, FiAlertTriangle,
    FiShoppingBag, FiDollarSign, FiClock, FiActivity,
    FiChevronDown, FiCalendar, FiX
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../../lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const StatCard = ({ label, value, icon: Icon, bg, sub, link }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card"
    >
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="text-white text-xl" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
            {sub && <div className={`text-xs mt-0.5 ${sub.startsWith('+') ? 'text-green-600' : 'text-slate-400'}`}>{sub}</div>}
        </div>
        {link && <Link to={link} className="text-sky-600 text-xs font-medium hover:underline flex-shrink-0">View</Link>}
    </motion.div>
);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [salesChart, setSalesChart] = useState([]);
    const [topMeds, setTopMeds] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [activities, setActivities] = useState([]);
    const [expiryAlerts, setExpiryAlerts] = useState({ expired: [], expiring: [] });
    const [showExpiryPanel, setShowExpiryPanel] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, chartRes, topRes, ordersRes, actRes, expiryRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/sales-chart?period=monthly'),
                    api.get('/dashboard/top-medicines'),
                    api.get('/dashboard/recent-orders'),
                    api.get('/dashboard/recent-activities'),
                    api.get('/dashboard/expiry-alerts'),
                ]);
                setStats(statsRes.data.data);
                setSalesChart(chartRes.data.data);
                setTopMeds(topRes.data.data);
                setRecentOrders(ordersRes.data.data);
                setActivities(actRes.data.data);
                setExpiryAlerts(expiryRes.data.data);
                const exp = expiryRes.data.data;
                if (exp.expired?.length > 0 || exp.expiring?.length > 0) {
                    setShowExpiryPanel(true);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const fmt = (n) => {
        const num = parseFloat(n) || 0;
        return num >= 1000 ? `ETB ${(num / 1000).toFixed(1)}K` : `ETB ${num.toFixed(2)}`;
    };

    const lineData = {
        labels: salesChart.map(d => d.label),
        datasets: [{
            label: 'Revenue (ETB )',
            data: salesChart.map(d => d.value),
            borderColor: '#0369a1',
            backgroundColor: 'rgba(3,105,161,0.08)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#0369a1',
            pointRadius: 4,
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => `ETB ${v / 1000}K` } }
        }
    };

    const hasExpiryIssues = expiryAlerts.expired.length > 0 || expiryAlerts.expiring.length > 0;
    const totalAtRisk = expiryAlerts.expired.reduce((s, m) => s + parseFloat(m.selling_price || 0) * (m.quantity || 0), 0) +
        expiryAlerts.expiring.reduce((s, m) => s + parseFloat(m.selling_price || 0) * (m.quantity || 0), 0);

    if (loading) return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="skeleton h-72 rounded-xl lg:col-span-2" />
                <div className="skeleton h-72 rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Welcome back! Here's what's happening.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="text-xs text-slate-500">Last updated just now</div>
                </div>
            </div>

            {/* Alert banners */}
            <div className="flex flex-wrap gap-3">
                {stats?.lowStock > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm">
                        <FiAlertTriangle size={15} />
                        <span><b>{stats.lowStock}</b> medicines are low on stock</span>
                        <Link to="/admin/inventory" className="underline font-medium">View</Link>
                    </div>
                )}
                {stats?.expiredMedicines > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-red-100 transition-colors"
                        onClick={() => setShowExpiryPanel(p => !p)}
                    >
                        <FiAlertTriangle size={15} />
                        <span><b>{stats.expiredMedicines}</b> medicines have expired</span>
                        <span className="underline font-medium">Details</span>
                    </motion.div>
                )}
                {stats?.expiringSoon > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 bg-orange-50 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => setShowExpiryPanel(p => !p)}
                    >
                        <FiClock size={15} />
                        <span><b>{stats.expiringSoon}</b> medicines expiring within 30 days</span>
                        <span className="underline font-medium">Details</span>
                    </motion.div>
                )}
            </div>

            {/* Expiry Alerts Panel */}
            <AnimatePresence>
                {showExpiryPanel && hasExpiryIssues && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="card p-5 border-2 border-red-200 bg-red-50/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                        <FiCalendar size={20} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Expiry Alerts</h3>
                                        <p className="text-sm text-slate-500">
                                            {expiryAlerts.expired.length} expired �� {expiryAlerts.expiring.length} expiring soon ��
                                            <span className="text-red-600 font-semibold"> ETB {totalAtRisk.toLocaleString()} at risk</span>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowExpiryPanel(false)} className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                                    <FiX size={16} />
                                </button>
                            </div>

                            {/* Expired Table */}
                            {expiryAlerts.expired.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        Expired Medicines ({expiryAlerts.expired.length})
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-red-200">
                                        <table className="data-table w-full text-sm">
                                            <thead className="bg-red-100/50">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold text-red-800">Medicine</th>
                                                    <th className="text-left p-3 font-semibold text-red-800">Batch</th>
                                                    <th className="text-left p-3 font-semibold text-red-800">Expired</th>
                                                    <th className="text-right p-3 font-semibold text-red-800">Overdue</th>
                                                    <th className="text-right p-3 font-semibold text-red-800">Qty</th>
                                                    <th className="text-right p-3 font-semibold text-red-800">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expiryAlerts.expired.map(m => (
                                                    <tr key={m.id} className="border-t border-red-100 hover:bg-red-50/50">
                                                        <td className="p-3 font-medium text-slate-800">
                                                            <Link to={`/admin/medicines/edit/${m.id}`} className="hover:text-red-700">{m.name}</Link>
                                                        </td>
                                                        <td className="p-3 text-slate-500 font-mono text-xs">{m.batch_number || 'ETB '}</td>
                                                        <td className="p-3 text-red-600 font-medium">{new Date(m.expiry_date).toLocaleDateString()}</td>
                                                        <td className="p-3 text-right text-red-600 font-bold">{m.days_overdue}d</td>
                                                        <td className="p-3 text-right text-slate-700">{m.quantity}</td>
                                                        <td className="p-3 text-right font-semibold text-red-700">{fmt(m.selling_price * m.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Expiring Soon Table */}
                            {expiryAlerts.expiring.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-orange-700 mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                                        Expiring Soon ({expiryAlerts.expiring.length})
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-orange-200">
                                        <table className="data-table w-full text-sm">
                                            <thead className="bg-orange-100/50">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold text-orange-800">Medicine</th>
                                                    <th className="text-left p-3 font-semibold text-orange-800">Batch</th>
                                                    <th className="text-left p-3 font-semibold text-orange-800">Expires</th>
                                                    <th className="text-right p-3 font-semibold text-orange-800">Days Left</th>
                                                    <th className="text-right p-3 font-semibold text-orange-800">Qty</th>
                                                    <th className="text-right p-3 font-semibold text-orange-800">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expiryAlerts.expiring.map(m => (
                                                    <tr key={m.id} className="border-t border-orange-100 hover:bg-orange-50/50">
                                                        <td className="p-3 font-medium text-slate-800">
                                                            <Link to={`/admin/medicines/edit/${m.id}`} className="hover:text-orange-700">{m.name}</Link>
                                                        </td>
                                                        <td className="p-3 text-slate-500 font-mono text-xs">{m.batch_number || 'ETB '}</td>
                                                        <td className={`p-3 font-medium ${m.days_remaining <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                                                            {new Date(m.expiry_date).toLocaleDateString()}
                                                            {m.days_remaining <= 7 && <span className="ml-1.5 text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">URGENT</span>}
                                                        </td>
                                                        <td className={`p-3 text-right font-bold ${m.days_remaining <= 7 ? 'text-red-600' : 'text-orange-600'}`}>{m.days_remaining}d</td>
                                                        <td className="p-3 text-right text-slate-700">{m.quantity}</td>
                                                        <td className="p-3 text-right font-semibold text-orange-700">{fmt(m.selling_price * m.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard label="Today's Sales" value={stats ? fmt(stats.todaySales?.value) : 'ETB '} icon={FiTrendingUp} bg="card-blue" link="/admin/orders" />
                <StatCard label="Monthly Revenue" value={stats ? fmt(stats.monthlySales?.value) : 'ETB '} icon={FiDollarSign} bg="card-green" />
                <StatCard label="Total Customers" value={stats?.totalCustomers || 0} icon={FiUsers} bg="card-purple" link="/admin/customers" />
                <StatCard label="Total Medicines" value={stats?.totalMedicines || 0} icon={FiPackage} bg="card-cyan" link="/admin/medicines" />
                <StatCard label="Pending Orders" value={stats?.pendingOrders || 0} icon={FiShoppingBag} bg="card-orange" link="/admin/orders" />
                <StatCard label="Low Stock" value={stats?.lowStock || 0} icon={FiAlertTriangle} bg="card-red" link="/admin/inventory" />
                <StatCard label="Expiring Soon" value={stats?.expiringSoon || 0} icon={FiClock} bg="card-orange" link="/admin/inventory" />
                <StatCard label="Yearly Revenue" value={stats ? fmt(stats.yearlySales?.value) : 'ETB '} icon={FiActivity} bg="card-indigo" />
            </div>

            {/* Expiry Alerts Card — always visible when there are alerts */}
            {hasExpiryIssues && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card border-2 border-red-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center animate-pulse">
                                <FiAlertTriangle size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Expiry Alerts</h3>
                                <p className="text-sm text-slate-500">
                                    {expiryAlerts.expired.length} expired, {expiryAlerts.expiring.length} expiring soon —
                                    <span className="text-red-600 font-semibold"> ETB {totalAtRisk.toLocaleString()} value at risk</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowExpiryPanel(p => !p)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                            {showExpiryPanel ? 'Hide' : 'Show Details'}
                        </button>
                    </div>

                    {/* Inline preview: top 5 most urgent items */}
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {expiryAlerts.expired.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        Expired ({expiryAlerts.expired.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {expiryAlerts.expired.slice(0, 5).map(m => (
                                            <Link key={m.id} to={`/admin/medicines/edit/${m.id}`}
                                                className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm text-slate-800 truncate">{m.name}</div>
                                                    <div className="text-xs text-red-500">{Math.abs(m.days_overdue)} day{Math.abs(m.days_overdue) !== 1 ? 's' : ''} overdue</div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-3">
                                                    <div className="text-xs text-slate-500">{m.quantity} units</div>
                                                    <div className="text-xs font-bold text-red-600">{fmt(m.selling_price * m.quantity)}</div>
                                                </div>
                                            </Link>
                                        ))}
                                        {expiryAlerts.expired.length > 5 && (
                                            <div className="text-xs text-red-400 text-center py-1">+{expiryAlerts.expired.length - 5} more expired</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {expiryAlerts.expiring.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                                        Expiring Soon ({expiryAlerts.expiring.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {expiryAlerts.expiring.slice(0, 5).map(m => (
                                            <Link key={m.id} to={`/admin/medicines/edit/${m.id}`}
                                                className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors">
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm text-slate-800 truncate flex items-center gap-1.5">
                                                        {m.name}
                                                        {m.days_remaining <= 7 && (
                                                            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">URGENT</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-orange-500 flex items-center gap-1">
                                                        <FiClock size={10} />
                                                        {m.days_remaining} day{m.days_remaining !== 1 ? 's' : ''} left
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-3">
                                                    <div className="text-xs text-slate-500">{m.quantity} units</div>
                                                    <div className="text-xs font-bold text-orange-600">{fmt(m.selling_price * m.quantity)}</div>
                                                </div>
                                            </Link>
                                        ))}
                                        {expiryAlerts.expiring.length > 5 && (
                                            <div className="text-xs text-orange-400 text-center py-1">+{expiryAlerts.expiring.length - 5} more expiring</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Monthly Revenue</h3>
                        <div className="flex gap-2">
                            <span className="badge badge-info">This Year</span>
                        </div>
                    </div>
                    <Line data={lineData} options={chartOptions} height={100} />
                </div>

                <div className="card p-5">
                    <h3 className="font-semibold text-slate-800 mb-4">Top Selling Medicines</h3>
                    <div className="space-y-3">
                        {topMeds.slice(0, 7).map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-700 truncate">{m.medicine_name}</div>
                                    <div className="text-xs text-slate-400">{m.total_sold} units</div>
                                </div>
                                <div className="text-sm font-semibold text-green-600">{fmt(m.revenue)}</div>
                            </div>
                        ))}
                        {!topMeds.length && <div className="text-sm text-slate-400 text-center py-4">No data yet</div>}
                    </div>
                </div>
            </div>

            {/* Recent Orders + Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">Recent Orders</h3>
                        <Link to="/admin/orders" className="text-sm text-sky-600 hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.slice(0, 6).map(o => (
                                    <tr key={o.id}>
                                        <td className="font-mono text-xs">{o.order_number}</td>
                                        <td>{o.customer_name || 'Walk-in'}</td>
                                        <td className="font-semibold text-green-600">{fmt(o.total)}</td>
                                        <td>
                                            <span className={`badge ${o.status === 'completed' ? 'badge-success' :
                                                    o.status === 'pending' ? 'badge-warning' :
                                                        o.status === 'cancelled' ? 'badge-danger' : 'badge-info'
                                                }`}>
                                                {o.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!recentOrders.length && (
                                    <tr><td colSpan={4} className="text-center text-slate-400 py-6">No orders yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Recent Activity</h3>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {activities.slice(0, 10).map((a, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <div className="w-7 h-7 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FiActivity size={12} className="text-sky-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-slate-700 font-medium">{a.action}</div>
                                    <div className="text-slate-400 text-xs truncate">{a.description}</div>
                                </div>
                                <div className="text-xs text-slate-400 flex-shrink-0">
                                    {new Date(a.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {!activities.length && <div className="text-sm text-slate-400 text-center py-4">No activity yet</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
