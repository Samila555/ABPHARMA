import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiDownload, FiAlertTriangle, FiPackage, FiX, FiCheck } from 'react-icons/fi';
import { MdQrCode } from 'react-icons/md';
import api, { getImageUrl } from '../../lib/api';
import MedicineImage from '../../components/MedicineImage';
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
    const [previewData, setPreviewData] = useState(null);
    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [columnMap, setColumnMap] = useState({});
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

    const MAP_FIELDS = [
        { key: 'name', label: 'Medicine Name', required: true },
        { key: 'brand_name', label: 'Brand Name' },
        { key: 'generic_name', label: 'Generic Name' },
        { key: 'barcode', label: 'Barcode' },
        { key: 'category_id', label: 'Category' },
        { key: 'supplier_id', label: 'Supplier' },
        { key: 'purchase_price', label: 'Purchase Price' },
        { key: 'selling_price', label: 'Selling Price' },
        { key: 'quantity', label: 'Quantity (Stock)' },
        { key: 'min_stock_level', label: 'Min Stock Level' },
        { key: 'expiry_date', label: 'Expiry Date (YYYY-MM-DD)' },
        { key: 'description', label: 'Description' }
    ];

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure file is Excel
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            toast.error('Please upload a valid Excel file (.xlsx, .xls, .csv)');
            e.target.value = null;
            return;
        }

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const workbookSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(workbookSheet);

            if (jsonData.length === 0) {
                toast.error('The uploaded file is empty or formatted incorrectly.');
                e.target.value = null;
                return;
            }

            const headers = Array.from(new Set(jsonData.flatMap(Object.keys)));
            setPreviewHeaders(headers);
            setPreviewData(jsonData);

            // Auto mapping
            const autoMap = {};
            MAP_FIELDS.forEach(field => {
                const match = headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.key.toLowerCase().replace(/[^a-z0-9]/g, ''));
                if (match) autoMap[field.key] = match;
            });
            // Try to auto-map 'name' more aggressively
            if (!autoMap.name) {
                const nameMatch = headers.find(h => /name|medicine|product|item/i.test(h));
                if (nameMatch) autoMap.name = nameMatch;
            }
            if (!autoMap.purchase_price) {
                const costMatch = headers.find(h => /cost|purchase/i.test(h));
                if (costMatch) autoMap.purchase_price = costMatch;
            }
            if (!autoMap.selling_price) {
                const priceMatch = headers.find(h => /price|selling|retail/i.test(h));
                if (priceMatch) autoMap.selling_price = priceMatch;
            }
            setColumnMap(autoMap);
        } catch (error) {
            console.error('File read error:', error);
            toast.error('Failed to parse file. Please check file format.');
        } finally {
            e.target.value = null;
        }
    };

    const confirmImport = async () => {
        if (!previewData) return;
        if (!columnMap.name) {
            toast.error("Please map the Medicine Name column before importing.");
            return;
        }

        const mappedData = previewData.map(row => {
            const newRow = { ...row }; // keep original keys just in case
            Object.entries(columnMap).forEach(([sysKey, excelKey]) => {
                if (excelKey && row[excelKey] !== undefined) {
                    newRow[sysKey] = row[excelKey];
                }
            });
            return newRow;
        });

        setImporting(true);
        try {
            const res = await api.post('/medicines/import', { medicines: mappedData });
            if (res.data.errors && res.data.errors.length > 0) {
                toast.success(`Imported ${res.data.count} medicines (${res.data.errors.length} failed: ${res.data.errors.map(e => e.name).join(', ')})`);
            } else {
                toast.success(`Imported ${res.data.count} medicines successfully!`);
            }
            fetchMedicines();
            setPreviewData(null);
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error.response?.data?.message || 'Failed to import medicines.');
        } finally {
            setImporting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`⚠️ PERMANENTLY DELETE "${name}"?\n\nThis will completely remove this medicine and all its data from the database. This action CANNOT be undone.`)) return;
        try {
            await api.delete(`/medicines/${id}`);
            toast.success(`"${name}" permanently deleted`);
            fetchMedicines();
        } catch { toast.error('Failed to delete medicine'); }
    };

    const fmt = (n) => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    const handleDownloadTemplate = () => {
        const headers = [
            { name: 'Paracetamol 500mg', brand_name: 'Panadol', generic_name: 'Acetaminophen', barcode: '600123456789', purchase_price: 500, selling_price: 800, quantity: 100, min_stock_level: 20, category: 'Pain Relief', supplier: 'Ethio Pharma', description: 'Pain reliever and fever reducer.', strength: '500mg', dosage_form: 'Tablet', unit: 'Pack', image: 'https://example.com/paracetamol.jpg' },
            { name: 'Amoxicillin 250mg', brand_name: 'Amoxil', generic_name: 'Amoxicillin', barcode: '600987654321', purchase_price: 1200, selling_price: 1500, quantity: 50, min_stock_level: 10, category: 'Prescription Medicines', supplier: '', description: 'Antibiotic used to treat bacterial infections.', strength: '250mg', dosage_form: 'Capsule', unit: 'Pack', image: '' }
        ];
        const ws = XLSX.utils.json_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Medicine_Import_Template.xlsx");
    };

    return (
        <div className="space-y-5">
            {/* Import Preview Modal */}
            {previewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Map & Preview Excel Import</h3>
                                <p className="text-sm text-slate-500 mt-1">{previewData.length} records parsed from file. Please map the columns accurately.</p>
                            </div>
                            <button onClick={() => setPreviewData(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-5 border-b border-slate-200 bg-white">
                            <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <FiFilter className="text-sky-500" /> Map Columns
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                                {MAP_FIELDS.map(f => (
                                    <div key={f.key} className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                            <span>{f.label} {f.required && <span className="text-red-500">*</span>}</span>
                                        </label>
                                        <select
                                            className={`form-input text-sm py-1.5 ${f.required && !columnMap[f.key] ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                            value={columnMap[f.key] || ''}
                                            onChange={(e) => setColumnMap(prev => ({ ...prev, [f.key]: e.target.value }))}
                                        >
                                            <option value="">-- Ignore --</option>
                                            {previewHeaders.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-0 bg-slate-50">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs uppercase bg-slate-200 text-slate-600 sticky top-0 shadow-sm z-10">
                                    <tr>
                                        {previewHeaders.map(h => (
                                            <th key={h} className="px-5 py-3 font-semibold border-b border-slate-300 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 30).map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-200 bg-white hover:bg-sky-50 transition-colors">
                                            {previewHeaders.map(h => (
                                                <td key={h} className="px-5 py-2 whitespace-nowrap truncate max-w-[200px]" title={row[h]}>
                                                    {row[h] !== undefined && row[h] !== null ? String(row[h]) : '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length > 30 && (
                                <div className="text-center py-3 text-sm font-medium text-amber-700 bg-amber-50 border-t border-amber-100">
                                    Showing first 30 rows. {previewData.length - 30} more rows are hidden but will be imported.
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => setPreviewData(null)} className="btn-outline px-6">Cancel</button>
                            <button onClick={confirmImport} disabled={importing} className="btn-primary px-6 flex items-center gap-2">
                                {importing ? 'Importing...' : <><FiCheck size={18} /> Confirm & Import All</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

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
                    <input type="file" ref={fileRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
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
                                                    <MedicineImage
                                                        src={m.image}
                                                        name={m.name}
                                                        className="w-full h-full object-cover"
                                                        fallbackSize={40}
                                                    />
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
