import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiDownload, FiAlertTriangle, FiPackage, FiX, FiCheck, FiFilter, FiClock, FiTrash, FiStar } from 'react-icons/fi';
import api from '../../lib/api';
import MedicineImage from '../../components/MedicineImage';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const statusColor = { available: 'badge-success', out_of_stock: 'badge-danger', discontinued: 'badge-secondary' };

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
    { key: 'expiry_date', label: 'Expiry Date' },
    { key: 'description', label: 'Description' },
];

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', category_id: '', status: '', visibility: '', low_stock: '', expiring_soon: '', page: 1, limit: 20 });
    const [categories, setCategories] = useState([]);
    const [importing, setImporting] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [columnMap, setColumnMap] = useState({});
    const [importHistory, setImportHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem('abpharma_import_history') || '[]'); }
        catch { return []; }
    });
    const [importFileName, setImportFileName] = useState('');
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

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            toast.error('Please upload a valid Excel file (.xlsx, .xls, .csv)');
            e.target.value = null;
            return;
        }
        setImportFileName(file.name);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

            if (jsonData.length === 0) {
                toast.error('The uploaded file is empty or has no readable rows.');
                e.target.value = null;
                return;
            }

            const headers = Array.from(new Set(jsonData.flatMap(Object.keys)));
            setPreviewHeaders(headers);
            setPreviewData(jsonData);

            // Auto-map columns by comparing normalized names
            const autoMap = {};
            MAP_FIELDS.forEach(field => {
                const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                const match = headers.find(h => norm(h) === norm(field.key));
                if (match) { autoMap[field.key] = match; return; }
                // Fuzzy match for common aliases
                if (field.key === 'name') {
                    const m = headers.find(h => /name|medicine|product|item|drug/i.test(h));
                    if (m) autoMap.name = m;
                }
                if (field.key === 'selling_price') {
                    const m = headers.find(h => /sell|price|retail/i.test(h));
                    if (m) autoMap.selling_price = m;
                }
                if (field.key === 'purchase_price') {
                    const m = headers.find(h => /cost|purchase|buy/i.test(h));
                    if (m) autoMap.purchase_price = m;
                }
                if (field.key === 'quantity') {
                    const m = headers.find(h => /qty|stock|quantity|inventory/i.test(h));
                    if (m) autoMap.quantity = m;
                }
                if (field.key === 'category_id') {
                    const m = headers.find(h => /categ/i.test(h));
                    if (m) autoMap.category_id = m;
                }
            });
            setColumnMap(autoMap);
        } catch (err) {
            console.error(err);
            toast.error('Failed to read file. Please check the format.');
        } finally {
            e.target.value = null;
        }
    };

    const confirmImport = async () => {
        if (!previewData) return;
        if (!columnMap.name) {
            toast.error('Please map the "Medicine Name" column before importing.');
            return;
        }
        const mappedData = previewData.map(row => {
            const newRow = {};
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
            const failCount = res.data.errors ? res.data.errors.length : 0;
            const successCount = res.data.count || 0;
            if (failCount > 0) {
                toast.success(`Imported ${successCount} medicines (${failCount} failed)`);
            } else {
                toast.success(`✅ Imported ${successCount} medicines successfully!`);
            }
            // Save to import history
            const historyEntry = {
                id: Date.now(),
                fileName: importFileName,
                date: new Date().toISOString(),
                totalRows: previewData.length,
                successCount,
                failCount,
                errors: res.data.errors || [],
            };
            const newHistory = [historyEntry, ...importHistory].slice(0, 20);
            setImportHistory(newHistory);
            localStorage.setItem('abpharma_import_history', JSON.stringify(newHistory));
            fetchMedicines();
            setPreviewData(null);
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error.response?.data?.message || 'Failed to import medicines.');
        } finally {
            setImporting(false);
        }
    };

    const toggleFeature = async (id, isFeatured, name) => {
        try {
            await api.patch(`/medicines/${id}/feature`, { is_featured: !isFeatured });
            toast.success(`"${name}" is now ${!isFeatured ? 'Visible' : 'Hidden'} on Customer Store`);
            fetchMedicines();
        } catch { toast.error('Failed to update visibility'); }
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
        const rows = [
            { name: 'Paracetamol 500mg', brand_name: 'Panadol', generic_name: 'Acetaminophen', barcode: '600123456789', purchase_price: 500, selling_price: 800, quantity: 100, min_stock_level: 20, category_id: 'Pain Relief', supplier_id: 'Ethio Pharma', description: 'Pain reliever and fever reducer.', expiry_date: '2026-12-31' },
            { name: 'Amoxicillin 250mg', brand_name: 'Amoxil', generic_name: 'Amoxicillin', barcode: '600987654321', purchase_price: 1200, selling_price: 1500, quantity: 50, min_stock_level: 10, category_id: 'Antibiotics', supplier_id: '', description: 'Antibiotic for bacterial infections.', expiry_date: '2027-06-30' }
        ];
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'Medicine_Import_Template.xlsx');
    };

    return (
        <div className="space-y-5">

            {/* ============================================================
                IMPORT MODAL — fully inline-styled so it always renders
            ============================================================ */}
            {previewData && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(15,23,42,0.6)', padding: '16px',
                    backdropFilter: 'blur(4px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: '#fff', borderRadius: '14px',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
                            width: '100%', maxWidth: '1140px',
                            height: '88vh', display: 'flex', flexDirection: 'column',
                            overflow: 'hidden', border: '1px solid #e2e8f0'
                        }}
                    >
                        {/* --- Header --- */}
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', flexShrink: 0 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                                    📊 Excel Import — Map Columns &amp; Preview Data
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>
                                    <strong style={{ color: '#0284c7' }}>{previewData.length} rows</strong> read from file &nbsp;·&nbsp; {previewHeaders.length} columns detected
                                </p>
                            </div>
                            <button onClick={() => setPreviewData(null)} style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                                <FiX size={16} /> Close
                            </button>
                        </div>

                        {/* --- Column Mapper --- */}
                        <div style={{ padding: '16px 24px', borderBottom: '2px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
                            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiFilter size={14} style={{ color: '#0284c7' }} />
                                Step 1 — Map your Excel columns to system fields&nbsp;
                                <span style={{ fontWeight: 400, color: '#94a3b8' }}>(red border = required, not yet mapped)</span>
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '10px 18px' }}>
                                {MAP_FIELDS.map(f => (
                                    <div key={f.key}>
                                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            {f.label}{f.required && <span style={{ color: '#ef4444' }}> *</span>}
                                        </label>
                                        <select
                                            value={columnMap[f.key] || ''}
                                            onChange={e => setColumnMap(prev => ({ ...prev, [f.key]: e.target.value }))}
                                            style={{
                                                width: '100%', padding: '6px 8px', fontSize: '12px',
                                                border: `2px solid ${f.required && !columnMap[f.key] ? '#fca5a5' : '#94a3b8'}`,
                                                borderRadius: '6px',
                                                background: f.required && !columnMap[f.key] ? '#fff1f2' : '#f8fafc',
                                                color: '#0f172a', outline: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            <option value="">— Ignore this field —</option>
                                            {previewHeaders.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- Data Preview Table --- */}
                        <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
                            <div style={{ background: '#0f172a', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', position: 'sticky', top: 0, zIndex: 10 }}>
                                <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '13px' }}>📋 Step 2 — Verify Data Preview</span>
                                <span style={{ color: '#64748b', fontSize: '12px' }}>Showing first {Math.min(50, previewData.length)} of {previewData.length} rows</span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ background: '#1e293b' }}>
                                            <th style={{ padding: '10px 14px', color: '#64748b', fontWeight: 700, fontSize: '11px', textAlign: 'center', borderRight: '1px solid #334155', minWidth: '36px', position: 'sticky', left: 0, background: '#1e293b' }}>#</th>
                                            {previewHeaders.map(h => (
                                                <th key={h} style={{ padding: '10px 14px', color: '#e2e8f0', fontWeight: 600, fontSize: '11px', textAlign: 'left', borderRight: '1px solid #334155', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(0, 50).map((row, idx) => (
                                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                                                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f1f5f9'}
                                            >
                                                <td style={{ padding: '7px 14px', color: '#94a3b8', fontWeight: 700, fontSize: '11px', textAlign: 'center', borderRight: '1px solid #e2e8f0', position: 'sticky', left: 0, background: 'inherit' }}>{idx + 1}</td>
                                                {previewHeaders.map(h => {
                                                    const val = row[h];
                                                    const display = val !== null && val !== '' ? String(val) : null;
                                                    return (
                                                        <td key={h} title={display || ''} style={{ padding: '7px 14px', color: display ? '#1e293b' : '#cbd5e1', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {display || '—'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {previewData.length > 50 && (
                                <div style={{ textAlign: 'center', padding: '12px', fontSize: '13px', color: '#92400e', background: '#fef3c7', borderTop: '1px solid #fde68a', fontWeight: 600 }}>
                                    ⚠️ Showing first 50 rows — <strong>{previewData.length - 50} more</strong> rows will also be imported when you confirm.
                                </div>
                            )}
                        </div>

                        {/* --- Footer Actions --- */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc', flexShrink: 0 }}>
                            <button onClick={() => setPreviewData(null)} style={{ padding: '10px 22px', border: '1.5px solid #cbd5e1', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                                Cancel
                            </button>
                            <button
                                onClick={confirmImport}
                                disabled={importing || !columnMap.name}
                                style={{ padding: '10px 26px', border: 'none', background: columnMap.name ? '#0284c7' : '#94a3b8', color: '#fff', borderRadius: '8px', cursor: columnMap.name ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', opacity: importing ? 0.7 : 1 }}
                            >
                                {importing ? '⏳ Importing...' : <><FiCheck size={17} /> Confirm &amp; Import All {previewData.length} Rows</>}
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
                    <select value={filters.visibility} onChange={e => setFilters(f => ({ ...f, visibility: e.target.value, page: 1 }))}
                        className="form-input w-40 text-sm">
                        <option value="">All Visibility</option>
                        <option value="featured">Store: Visible</option>
                        <option value="hidden">Store: Hidden</option>
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
                                                    <MedicineImage src={m.image} name={m.name} className="w-full h-full object-cover" fallbackSize={40} />
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
                                            <div className="mt-1">
                                                {m.is_featured ? (
                                                    <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">Visible on Store</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Hidden</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => toggleFeature(m.id, !!m.is_featured, m.name)}
                                                    title={m.is_featured ? "Hide from Store" : "Show on Store"}
                                                    className={`p-1.5 rounded-lg transition-colors ${m.is_featured ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                                                    <FiStar size={16} fill={m.is_featured ? "currentColor" : "none"} />
                                                </button>
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

            {/* ── Import History ───────────────────────────────── */}
            {importHistory.length > 0 && (
                <div className="card overflow-hidden">
                    {/* Header */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiClock size={18} style={{ color: '#0284c7' }} />
                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Import History</span>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>{importHistory.length} imports</span>
                        </div>
                        <button
                            onClick={() => { setImportHistory([]); localStorage.removeItem('abpharma_import_history'); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', border: '1.5px solid #fecaca', background: '#fff1f2', color: '#dc2626', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                            <FiTrash size={13} /> Clear History
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    {['#', 'File Name', 'Imported At', 'Total Rows', 'Imported ✅', 'Failed ❌', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', color: '#64748b', fontWeight: 700, fontSize: '11px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {importHistory.map((entry, idx) => {
                                    const isSuccess = entry.failCount === 0;
                                    const isPartial = entry.successCount > 0 && entry.failCount > 0;
                                    const isFailed = entry.successCount === 0;
                                    const statusLabel = isFailed ? 'Failed' : isPartial ? 'Partial' : 'Success';
                                    const statusStyle = isFailed
                                        ? { background: '#fee2e2', color: '#dc2626' }
                                        : isPartial
                                            ? { background: '#fef3c7', color: '#d97706' }
                                            : { background: '#dcfce7', color: '#16a34a' };
                                    const formattedDate = new Date(entry.date).toLocaleString();
                                    return (
                                        <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                            <td style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: 700, fontSize: '12px' }}>{importHistory.length - idx}</td>
                                            <td style={{ padding: '10px 16px', fontWeight: 600, color: '#334155', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.fileName}>
                                                📄 {entry.fileName}
                                            </td>
                                            <td style={{ padding: '10px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>{formattedDate}</td>
                                            <td style={{ padding: '10px 16px', color: '#334155', fontWeight: 600, textAlign: 'center' }}>{entry.totalRows}</td>
                                            <td style={{ padding: '10px 16px', color: '#16a34a', fontWeight: 700, textAlign: 'center', fontSize: '14px' }}>{entry.successCount}</td>
                                            <td style={{ padding: '10px 16px', color: entry.failCount > 0 ? '#dc2626' : '#94a3b8', fontWeight: entry.failCount > 0 ? 700 : 400, textAlign: 'center', fontSize: '14px' }}>{entry.failCount}</td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <span style={{ ...statusStyle, borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 700 }}>{statusLabel}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
