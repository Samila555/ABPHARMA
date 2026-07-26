import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiUpload, FiInfo } from 'react-icons/fi';
import api, { getImageUrl } from '../../lib/api';
import toast from 'react-hot-toast';

const pregCats = ['A', 'B', 'C', 'D', 'X', 'N'];
const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Suppository', 'Patch', 'Gel', 'Spray', 'Powder', 'Solution', 'Suspension'];

const TabBtn = ({ active, onClick, label }) => (
    <button onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${active ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
        {label}
    </button>
);

// Field component extracted outside to prevent re-rendering focus loss
const Field = ({ label, name, type = 'text', required, textarea, rows = 3, select, options, placeholder, form, set }) => (
    <div>
        <label className="form-label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
        {textarea ? (
            <textarea
                rows={rows}
                value={form[name] || ''}
                onChange={e => set(name, e.target.value)}
                className="form-input resize-none"
                placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            />
        ) : select ? (
            <select value={form[name] || ''} onChange={e => set(name, e.target.value)} className="form-input">
                <option value="">{placeholder || `Select ${label}`}</option>
                {options.map(o => <option key={o.value || o.id} value={o.value || o.id}>{o.label || o.name}</option>)}
            </select>
        ) : (
            <input
                type={type}
                value={form[name] || ''}
                onChange={e => set(name, e.target.value)}
                className="form-input"
                placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
                required={required}
            />
        )}
    </div>
);

export default function MedicineForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [tab, setTab] = useState('basic');
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [form, setForm] = useState({
        name: '', brand_name: '', generic_name: '', barcode: '', category_id: '', supplier_id: '',
        manufacturer: '', description: '', uses: '', indications: '', contraindications: '',
        warnings: '', side_effects: '', drug_interactions: '', storage_conditions: '',
        pregnancy_category: 'N', breastfeeding_info: '', adult_dosage: '', child_dosage: '',
        overdose_info: '', missed_dose_info: '', strength: '', dosage_form: 'Tablet', unit: 'Tablet',
        purchase_price: '', selling_price: '', quantity: '0', min_stock_level: '10',
        batch_number: '', expiry_date: '', requires_prescription: false, is_featured: false, status: 'available'
    });

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data.data)).catch(() => { });
        api.get('/suppliers').then(r => setSuppliers(r.data.data)).catch(() => { });
        if (isEdit) {
            api.get(`/medicines/${id}`).then(r => {
                const d = r.data.data;
                setForm({ ...d, expiry_date: d.expiry_date?.split('T')[0] || '', requires_prescription: !!d.requires_prescription, is_featured: !!d.is_featured });
                if (d.image) setImagePreview(getImageUrl(d.image));
            }).catch(() => toast.error('Failed to load medicine'));
        }
    }, [id]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
            setForm(f => ({ ...f, _imageFile: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.selling_price) return toast.error('Name and selling price are required');
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k === '_imageFile' && v) formData.append('image', v);
                else if (v !== null && v !== undefined) formData.append(k, v);
            });
            if (isEdit) {
                await api.put(`/medicines/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Medicine updated!');
            } else {
                await api.post('/medicines', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Medicine added successfully!');
            }
            navigate('/admin/medicines');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save medicine');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button type="button" onClick={() => navigate('/admin/medicines')}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                    <FiArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h1>
                    <p className="text-slate-500 text-sm">Fill in the medicine details across the tabs below</p>
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={15} />}
                    {isEdit ? 'Update Medicine' : 'Save Medicine'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
                {['basic', 'clinical', 'pricing', 'drug-info'].map(t => (
                    <TabBtn key={t} active={tab === t} onClick={() => setTab(t)}
                        label={t === 'basic' ? 'Basic Info' : t === 'clinical' ? 'Clinical Info' : t === 'pricing' ? 'Pricing & Stock' : 'Drug Library'} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main form area */}
                <div className="lg:col-span-2 card p-5">

                    {/* ETB ETB  BASIC INFO TAB ETB ETB  */}
                    {tab === 'basic' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Medicine Name" name="name" required
                                    placeholder="e.g. Paracetamol 500mg Tablets"
                                />
                            </div>
                            <Field form={form} set={set}
                                label="Brand Name" name="brand_name"
                                placeholder="e.g. Panadol, Emzor"
                            />
                            <Field form={form} set={set}
                                label="Generic Name" name="generic_name"
                                placeholder="e.g. Acetaminophen"
                            />
                            <Field form={form} set={set}
                                label="Barcode" name="barcode"
                                placeholder="e.g. 600123456789"
                            />
                            <Field form={form} set={set}
                                label="Manufacturer" name="manufacturer"
                                placeholder="e.g. Emzor Pharma"
                            />
                            <Field form={form} set={set}
                                label="Category" name="category_id" select
                                options={categories}
                                placeholder="-- Select a Category --"
                            />

                            <Field form={form} set={set}
                                label="Strength" name="strength"
                                placeholder="e.g. 500mg"
                            />
                            <Field form={form} set={set}
                                label="Dosage Form" name="dosage_form" select
                                options={dosageForms.map(d => ({ value: d, label: d }))}
                                placeholder="-- Select Dosage Form --"
                            />
                            <Field form={form} set={set}
                                label="Unit" name="unit"
                                placeholder="e.g. Tablet, Bottle, Strip"
                            />
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Description" name="description" textarea rows={10}
                                    placeholder="e.g. Paracetamol is a widely used pain reliever (analgesic) and fever reducer (antipyretic). It is typically used for mild to moderate pain relief, including headaches, menstrual periods, toothaches, backaches, osteoarthritis, or cold/flu aches and pains. Type as much detail as you need here..."
                                />
                            </div>
                            <Field form={form} set={set}
                                label="Storage Conditions" name="storage_conditions"
                                placeholder="e.g. Store below 25��C"
                            />
                            <Field form={form} set={set}
                                label="Purchase Price (ETB )" name="purchase_price" type="number" required
                                placeholder="e.g. 500"
                            />
                            <Field form={form} set={set}
                                label="Selling Price (ETB )" name="selling_price" type="number" required
                                placeholder="e.g. 800"
                            />
                            <Field form={form} set={set}
                                label="Status" name="status" select
                                options={[
                                    { value: 'available', label: 'Available' },
                                    { value: 'out_of_stock', label: 'Out of Stock' },
                                    { value: 'discontinued', label: 'Discontinued' }
                                ]}
                                placeholder="-- Select Status --"
                            />
                            <div className="sm:col-span-2 flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={!!form.requires_prescription} onChange={e => set('requires_prescription', e.target.checked)}
                                        className="w-4 h-4 text-sky-600 rounded" />
                                    <span className="text-sm text-slate-700">Requires Prescription</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={!!form.is_featured} onChange={e => set('is_featured', e.target.checked)}
                                        className="w-4 h-4 text-sky-600 rounded" />
                                    <span className="text-sm text-slate-700">Featured Medicine</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* ETB ETB  CLINICAL INFO TAB ETB ETB  */}
                    {tab === 'clinical' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Uses / Indications" name="uses" textarea rows={4}
                                    placeholder="e.g. Indicated for the relief of mild to moderate pain (such as headaches, backaches, toothaches, and muscle aches) and for the reduction of fever associated with cold and flu."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Contraindications" name="contraindications" textarea rows={4}
                                    placeholder="e.g. This medicine is contraindicated in patients with a known hypersensitivity or severe allergic reaction to the active ingredient or any of the excipients in the formulation. Avoid in severe hepatic impairment."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Warnings" name="warnings" textarea rows={4}
                                    placeholder="e.g. Consult a doctor before use if you have underlying kidney or liver disease. Immediate medical advice should be sought in the event of an overdose, even if you feel well, because of the risk of delayed, serious liver damage."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Side Effects" name="side_effects" textarea rows={4}
                                    placeholder="e.g. Generally well tolerated. Uncommonly, some individuals may experience skin rashes, allergic reactions, dizziness, nausea, or blood dyscrasias. Stop taking and consult a doctor immediately if an allergic reaction occurs."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Drug Interactions" name="drug_interactions" textarea rows={4}
                                    placeholder="e.g. Keep in mind that the speed of absorption may be increased by metoclopramide or domperidone. The anticoagulant effect of warfarin and other coumarins may be enhanced by prolonged regular daily use of this medication."
                                />
                            </div>
                            <Field form={form} set={set}
                                label="Pregnancy Category" name="pregnancy_category" select
                                options={pregCats.map(c => ({ value: c, label: `Category ${c}` }))}
                                placeholder="-- Select Category --"
                            />
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Breastfeeding Information" name="breastfeeding_info" textarea rows={4}
                                    placeholder="e.g. The active substance is excreted in breast milk but not in a clinically significant amount. Available published data do not contraindicate breast feeding when used sensibly at recommended doses."
                                />
                            </div>
                        </div>
                    )}

                    {/* ETB ETB  PRICING & STOCK TAB ETB ETB  */}
                    {tab === 'pricing' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field form={form} set={set}
                                label="Purchase Price (ETB )" name="purchase_price" type="number" required
                                placeholder="e.g. 500"
                            />
                            <Field form={form} set={set}
                                label="Selling Price (ETB )" name="selling_price" type="number" required
                                placeholder="e.g. 800"
                            />
                            <Field form={form} set={set}
                                label="Current Quantity" name="quantity" type="number"
                                placeholder="e.g. 100"
                            />
                            <Field form={form} set={set}
                                label="Minimum Stock Level" name="min_stock_level" type="number"
                                placeholder="e.g. 20"
                            />
                            <Field form={form} set={set}
                                label="Batch Number" name="batch_number"
                                placeholder="e.g. BN-2024-00123"
                            />
                            <Field form={form} set={set}
                                label="Expiry Date" name="expiry_date" type="date"
                                placeholder=""
                            />
                        </div>
                    )}

                    {/* ETB ETB  DRUG LIBRARY TAB ETB ETB  */}
                    {tab === 'drug-info' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Adult Dosage" name="adult_dosage" textarea rows={4}
                                    placeholder="e.g. For adults and children aged 16 years and over: One to two tablets (500mg - 1000mg) to be taken orally every 4 to 6 hours as strictly required. Do not exceed 8 tablets (4000mg) in any 24-hour period."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Child Dosage" name="child_dosage" textarea rows={4}
                                    placeholder="e.g. For children aged 10-15 years: One tablet (500mg) every 4 to 6 hours as needed, with a maximum of 4 tablets in 24 hours. Do not give to children under 10 years of age without explicit advice from a medical practitioner."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Overdose Information" name="overdose_info" textarea rows={4}
                                    placeholder="e.g. Overdose can lead to severe organ damage. Early symptoms may include nausea, vomiting, sweating, and general malaise. Immediate medical attention is vital, and specific antidotes may be required in emergencies."
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Field form={form} set={set}
                                    label="Missed Dose Instructions" name="missed_dose_info" textarea rows={4}
                                    placeholder="e.g. If you omit a dose, take it as soon as you remember. However, if it is almost time for your next scheduled dose, skip the missed dose and return to your regular dosing schedule. Do not take a double dose to make up for it."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ETB ETB  SIDEBAR ETB ETB  */}
                <div className="space-y-4">
                    {/* Image upload */}
                    <div className="card p-5">
                        <h3 className="font-semibold text-slate-700 mb-3 text-sm">Medicine Image</h3>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-sky-400 transition-colors">
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="w-full h-36 object-contain rounded-lg" />
                                    <button type="button" onClick={() => { setImagePreview(null); set('_imageFile', null); }}
                                        className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">X</button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <FiUpload className="mx-auto text-slate-400 mb-2" size={24} />
                                    <div className="text-sm text-slate-500 mb-1">Drop image here or click to upload</div>
                                    <div className="text-xs text-slate-400">PNG, JPG up to 5MB</div>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="card p-5 bg-sky-50 border-sky-200">
                        <div className="flex items-start gap-2">
                            <FiInfo className="text-sky-600 mt-0.5 flex-shrink-0" size={15} />
                            <div className="text-xs text-sky-700">
                                <p className="font-semibold mb-2">Required Fields</p>
                                <ul className="space-y-1 text-sky-600">
                                    <li>ETB  Medicine Name</li>
                                    <li>ETB  Selling Price</li>
                                    <li>ETB  Purchase Price</li>
                                </ul>
                                <p className="font-semibold mt-3 mb-1">Tips</p>
                                <ul className="space-y-1 text-sky-600">
                                    <li>ETB  Fill Pricing & Stock tab for inventory tracking</li>
                                    <li>ETB  Set an expiry date to get alerts</li>
                                    <li>ETB  Enable Featured to show on home page</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Stock summary (edit mode) */}
                    {isEdit && (
                        <div className="card p-5">
                            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Stock Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Current Stock</span>
                                    <span className="font-semibold text-slate-800">{form.quantity} units</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Min Level</span>
                                    <span className="font-semibold text-slate-800">{form.min_stock_level} units</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Stock Value</span>
                                    <span className="font-semibold text-green-600">
                                        ETB {(parseFloat(form.selling_price || 0) * parseFloat(form.quantity || 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
