import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiTrendingUp, FiPackage, FiUsers, FiAlertTriangle,
    FiDollarSign, FiClock, FiActivity, FiCalendar, FiX,
    FiShoppingBag, FiArrowUpRight, FiArrowDownRight, FiBox
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../../lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [salesChart, setSalesChart] = useState([]);
    const [topMeds, setTopMeds] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [activities, setActivities] = useState([]);
    const [expiryAlerts, setExpiryAlerts] = useState({ expired: [], expiring: [] });
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
        return num >= 1000 ? `ETB ${(num / 1000).toFixed(1)}K` : `ETB ${num.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const lineData = {
        labels: salesChart.map(d => d.label),
        datasets: [{
            label: 'Revenue (ETB)',
            data: salesChart.map(d => d.value),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.06)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2.5,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleFont: { size: 12 }, bodyFont: { size: 13 }, padding: 10, cornerRadius: 8, callbacks: { label: (ctx) => `ETB ${ctx.parsed.y.toLocaleString()}` } } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v } }
        }
    };

    const hasExpiryIssues = expiryAlerts.expired.length > 0 || expiryAlerts.expiring.length > 0;
    const totalAtRisk = expiryAlerts.expired.reduce((s, m) => s + parseFloat(m.selling_price || 0) * (m.quantity || 0), 0) +
        expiryAlerts.expiring.reduce((s, m) => s + parseFloat(m.selling_price || 0) * (m.quantity || 0), 0);

    const statCards = [
        { label: "Today's Sales", value: fmt(stats?.todaySales?.value), icon: FiTrendingUp, color: 'bg-blue-500', link: '/admin/pos' },
        { label: 'Monthly Revenue', value: fmt(stats?.monthlySales?.value), icon: FiDollarSign, color: 'bg-emerald-500' },
        { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: FiUsers, color: 'bg-purple-500', link: '/admin/customers' },
        { label: 'Total Medicines', value: stats?.totalMedicines || 0, icon: FiBox, color: 'bg-teal-500', link: '/admin/medicines' },
        { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: FiShoppingBag, color: 'bg-orange-500' },
        { label: 'Low Stock', value: stats?.lowStock || 0, icon: FiAlertTriangle, color: 'bg-red-500', link: '/admin/inventory' },
        { label: 'Expiring Soon', value: stats?.expiringSoon || 0, icon: FiClock, color: 'bg-amber-500', link: '/admin/inventory' },
        { label: 'Yearly Revenue', value: fmt(stats?.yearlySales?.value), icon: FiActivity, color: 'bg-indigo-500' },
    ];

    if (loading) return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl h-[88px] animate-pulse" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl h-72 animate-pulse lg:col-span-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
                <div className="bg-white rounded-xl h-72 animate-pulse" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <motion.div {...fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-slate-700">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Last updated just now</div>
                </div>
            </motion.div>

            {/* Alert Banners */}
            {(stats?.lowStock > 0 || stats?.expiredMedicines > 0 || stats?.expiringSoon > 0) && (
                <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="flex flex-wrap gap-2">
                    {stats?.lowStock > 0 && (
                        <Link to="/admin/inventory" className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm hover:bg-amber-100 transition-colors">
                            <FiAlertTriangle size={14} />
                            <span className="font-medium">{stats.lowStock}</span> low stock
                        </Link>
                    )}
                    {stats?.expiredMedicines > 0 && (
                        <Link to="/admin/inventory" className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-100 transition-colors">
                            <FiAlertTriangle size={14} />
                            <span className="font-medium">{stats.expiredMedicines}</span> expired
                        </Link>
                    )}
                    {stats?.expiringSoon > 0 && (
                        <Link to="/admin/inventory" className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-lg text-sm hover:bg-orange-100 transition-colors">
                            <FiClock size={14} />
                            <span className="font-medium">{stats.expiringSoon}</span> expiring within 30 days
                        </Link>
                    )}
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        {...fadeUp}
                        transition={{ delay: i * 0.04 }}
                        className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow relative group"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                    >
                        <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <card.icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-lg font-bold text-slate-800 leading-tight">{card.value}</div>
                            <div className="text-xs text-slate-500 truncate">{card.label}</div>
                        </div>
                        {card.link && (
                            <Link to={card.link} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FiArrowUpRight size={14} className="text-slate-400 hover:text-blue-600" />
                            </Link>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Expiry Alerts Card */}
            {hasExpiryIssues && (
                <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                                <FiAlertTriangle size={17} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">Expiry Alerts</h3>
                                <p className="text-xs text-slate-400">
                                    {expiryAlerts.expired.length} expired, {expiryAlerts.expiring.length} expiring —
                                    <span className="text-red-500 font-medium"> ETB {totalAtRisk.toLocaleString()} at risk</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Expired */}
                            {expiryAlerts.expired.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        Expired ({expiryAlerts.expired.length})
                                    </h4>
                                    <div className="space-y-1.5">
                                        {expiryAlerts.expired.slice(0, 5).map(m => (
                                            <Link key={m.id} to={`/admin/medicines/edit/${m.id}`}
                                                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">{m.name}</div>
                                                    <div className="text-xs text-red-400">{Math.abs(m.days_overdue)}d overdue</div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-3">
                                                    <div className="text-xs text-slate-400">{m.quantity} units</div>
                                                    <div className="text-xs font-semibold text-red-500">{fmt(m.selling_price * m.quantity)}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Expiring Soon */}
                            {expiryAlerts.expiring.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        Expiring Soon ({expiryAlerts.expiring.length})
                                    </h4>
                                    <div className="space-y-1.5">
                                        {expiryAlerts.expiring.slice(0, 5).map(m => (
                                            <Link key={m.id} to={`/admin/medicines/edit/${m.id}`}
                                                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                                        {m.name}
                                                        {m.days_remaining <= 7 && (
                                                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">URGENT</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-orange-400">{m.days_remaining}d left</div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-3">
                                                    <div className="text-xs text-slate-400">{m.quantity} units</div>
                                                    <div className="text-xs font-semibold text-orange-500">{fmt(m.selling_price * m.quantity)}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="lg:col-span-2 bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">Monthly Revenue</h3>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">This Year</span>
                    </div>
                    <div className="h-64">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Top Selling Medicines</h3>
                    <div className="space-y-3">
                        {topMeds.slice(0, 7).map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-700 truncate">{m.medicine_name}</div>
                                    <div className="text-xs text-slate-400">{m.total_sold} units</div>
                                </div>
                                <div className="text-sm font-semibold text-emerald-600">{fmt(m.revenue)}</div>
                            </div>
                        ))}
                        {!topMeds.length && (
                            <div className="text-sm text-slate-400 text-center py-8">
                                <FiPackage size={28} className="mx-auto mb-2 opacity-30" />
                                <div>No data yet</div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Orders */}
                <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="lg:col-span-2 bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-800">Recent Orders</h3>
                        <Link to="/admin/pos" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Order</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.slice(0, 6).map(o => (
                                    <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs text-slate-600">{o.order_number}</td>
                                        <td className="px-5 py-3 text-slate-700">{o.customer_name || 'Walk-in'}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-emerald-600">{fmt(o.total)}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                o.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                o.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                o.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {o.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!recentOrders.length && (
                                    <tr><td colSpan={4} className="text-center text-slate-400 py-10">
                                        <FiShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                                        <div className="text-sm">No orders yet</div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                        {activities.slice(0, 10).map((a, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FiActivity size={13} className="text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-700">{a.action}</div>
                                    <div className="text-xs text-slate-400 truncate mt-0.5">{a.description}</div>
                                </div>
                                <div className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                                    {new Date(a.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {!activities.length && (
                            <div className="text-sm text-slate-400 text-center py-8">
                                <FiActivity size={28} className="mx-auto mb-2 opacity-30" />
                                <div>No activity yet</div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
