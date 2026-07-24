import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiDownload, FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { MdQrCode } from 'react-icons/md';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const statusColor = { available: 'badge-success', out_of_stock: 'badge-danger', discontinued: 'badge-secondary' };

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', category_id: '', status: '', low_stock: '', expiring_soon: '', page: 1, limit: 20 });
    const [categories, setCategories] = useState([]);
    const [importing, setImporting] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef();
    const fileRef = useRef();

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')));
            const res = await api.get(`/medicines?${params}`);
            setMedicines(res.data.data);
            setTotal(res.data.total);
        } catch { toast.error('Failed to load medicines'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data.data)).catch(() => { });
    }, []);

    useEffect(() => { fetchMedicines(); }, [filters.page, filters.status, filters.category_id, filters.low_stock, filters.expiring_soon]);

    const handleSearch = (e) => { e.preventDefault(); setFilters(f => ({ ...f, page: 1 })); fetchMedicines(); };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure file is Excel
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            toast.error('Please upload a valid Excel file (.xlsx, .xls, .csv)');
            e.target.value = null;
            return;
        }

        setImporting(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const workbookSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(workbookSheet);

            if (jsonData.length === 0) {
                toast.error('The uploaded file is empty or formatted incorrectly.');
                setImporting(false);
                e.target.value = null;
                return;
            }

            const res = await api.post('/medicines/import', { medicines: jsonData });
            toast.success(`Imported ${res.data.count} medicines successfully!`);
            fetchMedicines();
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error.response?.data?.message || 'Failed to import medicines. Please check file format.');
        } finally {
            setImporting(false);
            e.target.value = null;
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Deactivate "${name}"?`)) return;
        try {
            await api.delete(`/medicines/${id}`);
            toast.success('Medicine deactivated');
            fetchMedicines();
        } catch { toast.error('Failed to deactivate'); }
    };

    const fmt = (n) => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    const handleDownloadTemplate = () => {
        const headers = [
            { name: 'Paracetamol 500mg', brand_name: 'Panadol', generic_name: 'Acetaminophen', barcode: '123456789', purchase_price: 500, selling_price: 800, quantity: 100, min_stock_level: 20, category_id: 1, supplier_id: 1, description: 'Pain reliever and fever reducer.', strength: '500mg', dosage_form: 'Tablet', unit: 'Pack' },
            { name: 'Amoxicillin 250mg', brand_name: 'Amoxil', generic_name: 'Amoxicillin', barcode: '987654321', purchase_price: 1200, selling_price: 1500, quantity: 50, min_stock_level: 10, category_id: 2, supplier_id: 2, description: 'Antibiotic used to treat bacterial infections.', strength: '250mg', dosage_form: 'Capsule', unit: 'Pack' }
        ];
        const ws = XLSX.utils.json_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Medicine_Import_Template.xlsx");
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Medicines</h1>
                    <p className="text-slate-500 text-sm">{total} medicines in system</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setFilters(f => ({ ...f, low_stock: f.low_stock ? '' : 'true', page: 1 }))}
                        className={`btn-outline text-sm py-2 ${filters.low_stock ? 'bg-amber-600 text-white border-amber-600' : ''}`}>
                        <FiAlertTriangle size={14} /> Low Stock
                    </button>
                    <button onClick={handleDownloadTemplate} className="btn-outline text-sm py-2 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                        <FiDownload size={14} /> Template
                    </button>
                    <input type="file" ref={fileRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImport} />
                    <button onClick={() => fileRef.current?.click()} disabled={importing} className="btn-outline text-sm py-2 text-sky-600 border-sky-200 bg-sky-50 hover:bg-sky-100">
                        <FiPlus size={14} /> {importing ? 'Importing...' : 'Import Excel'}
                    </button>
                    <Link to="/admin/medicines/add" className="btn-primary">
                        <FiPlus size={16} /> Add Medicine
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-60">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input ref={searchRef} type="text" placeholder="Search by name, brand, generic, barcode..."
                                value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                                className="form-input pl-9 text-sm" />
                        </div>
                        <button type="submit" className="btn-primary py-2">Search</button>
                    </form>
                    <select value={filters.category_id} onChange={e => setFilters(f => ({ ...f, category_id: e.target.value, page: 1 }))}
                        className="form-input w-44 text-sm">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
                        className="form-input w-40 text-sm">
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                    </select>
                    <button onClick={() => setFilters(f => ({ ...f, expiring_soon: f.expiring_soon ? '' : 'true', page: 1 }))}
                        className={`btn-outline text-sm py-2 ${filters.expiring_soon ? 'bg-orange-500 text-white border-orange-500' : ''}`}>
                        Expiring Soon
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th>Category</th>
                                <th>Barcode</th>
                                <th>Stock</th>
                                <th>Price</th>
                                <th>Expiry</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(10).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={8}><div className="skeleton h-6 w-full" /></td></tr>
                                ))
                            ) : medicines.map(m => {
                                const daysLeft = m.expiry_date ? Math.ceil((new Date(m.expiry_date) - new Date()) / (1000 * 86400)) : null;
                                return (
                                    <tr key={m.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-sky-50 rounded-lg overflow-hidden flex-shrink-0">
                                                    {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center text-sky-400 text-xs font-bold">
                                                            {m.name?.charAt(0)}
                                                        </div>}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800 text-sm">{m.name}</div>
                                                    <div className="text-xs text-slate-400">{m.generic_name || m.brand_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-info text-xs">{m.category_name || '-'}</span></td>
                                        <td className="font-mono text-xs text-slate-600">{m.barcode || '-'}</td>
                                        <td>
                                            <div className={`font-semibold text-sm ${m.quantity <= m.min_stock_level ? 'text-red-600' : m.quantity <= m.min_stock_level * 2 ? 'text-amber-600' : 'text-green-600'}`}>
                                                {m.quantity}
                                            </div>
                                            {m.quantity <= m.min_stock_level && <div className="text-xs text-red-500">Low stock!</div>}
                                        </td>
                                        <td>
                                            <div className="text-sm font-semibold text-slate-800">{fmt(m.selling_price)}</div>
                                            <div className="text-xs text-slate-400">Cost: {fmt(m.purchase_price)}</div>
                                        </td>
                                        <td>
                                            {m.expiry_date ? (
                                                <div className={`text-sm font-medium ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-slate-600'}`}>
                                                    {new Date(m.expiry_date).toLocaleDateString()}
                                                    {daysLeft !== null && <div className="text-xs">{daysLeft < 0 ? 'Expired!' : `${daysLeft}d left`}</div>}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${statusColor[m.status] || 'badge-secondary'}`}>{m.status?.replace('_', ' ')}</span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => navigate(`/admin/medicines/edit/${m.id}`)}
                                                    className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(m.id, m.name)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && !medicines.length && (
                                <tr><td colSpan={8} className="text-center py-12 text-slate-400">
                                    <FiPackage size={32} className="mx-auto mb-2 opacity-30" />
                                    <div>No medicines found</div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > filters.limit && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                        <div className="text-sm text-slate-500">Showing {(filters.page - 1) * filters.limit + 1} - {Math.min(filters.page * filters.limit, total)} of {total}</div>
                        <div className="flex gap-2">
                            <button onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))} disabled={filters.page === 1}
                                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">
                                Previous
                            </button>
                            <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page * filters.limit >= total}
                                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
