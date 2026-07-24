import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiShield, FiAlertCircle, FiCheck, FiMinus, FiPlus, FiArrowLeft, FiInfo, FiTag } from 'react-icons/fi';
import api from '../../lib/api';
import useCartStore from '../../store/useCartStore';
import toast from 'react-hot-toast';

export default function MedicineDetail() {
    const { id } = useParams();
    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const { addItem } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/public/medicines/${id}`);
                setMedicine(res.data.data);
            } catch (err) {
                toast.error('Medicine not found');
                navigate('/medicines');
            } finally { setLoading(false); }
        };
        fetch();
        window.scrollTo(0, 0);
    }, [id, navigate]);

    if (loading) return <div className="min-h-screen pt-32 flex justify-center"><div className="w-10 h-10 border-4 border-sky-500 border-t-transparent flex rounded-full animate-spin"></div></div>;
    if (!medicine) return null;

    const handleAddToCart = () => {
        addItem(medicine, qty);
        toast.success(`Added ${qty} ${medicine.name} to cart`);
    };

    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;
    const outOfStock = medicine.quantity <= 0;

    return (
        <div className="bg-slate-50 min-h-screen pt-28 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-6 transition-colors font-medium text-sm">
                    <FiArrowLeft /> Back to medicines
                </button>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                        {/* Image Section */}
                        <div className="lg:col-span-2 bg-slate-50/50 p-10 flex items-center justify-center relative border-r border-slate-100">
                            <div className="w-full aspect-square relative flex items-center justify-center">
                                {medicine.image ? (
                                    <img src={medicine.image} alt={medicine.name} className="w-full h-full object-contain drop-shadow-xl" />
                                ) : (
                                    <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg border-8 border-sky-50 text-sky-600 font-bold text-7xl">
                                        {medicine.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="badge badge-info px-3 py-1 text-sm bg-sky-100 text-sky-700">{medicine.category_name}</span>
                                {medicine.requires_prescription && (
                                    <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-amber-200">
                                        <FiShield /> Prescription Required
                                    </span>
                                )}
                                {medicine.is_featured && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-200">Featured</span>}
                            </div>

                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">{medicine.name}</h1>
                            <div className="text-lg text-slate-500 mb-6 flex items-center gap-2">
                                <span>{medicine.generic_name || medicine.brand_name}</span>
                                {medicine.strength && <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                                <span className="font-medium text-slate-700">{medicine.strength}</span>
                            </div>

                            <div className="text-4xl font-bold text-slate-900 mb-8">{fmt(medicine.selling_price)}</div>

                            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${outOfStock ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                                    <span className={`font-semibold ${outOfStock ? 'text-red-700' : 'text-green-700'}`}>
                                        {outOfStock ? 'Currently Out of Stock' : 'In Stock & Ready to Ship'}
                                    </span>
                                </div>

                                {!outOfStock && (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-36">
                                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"><FiMinus /></button>
                                            <input type="number" value={qty} onChange={(e) => setQty(Math.min(medicine.quantity, Math.max(1, parseInt(e.target.value) || 1)))} className="flex-1 text-center font-bold text-slate-800 bg-transparent border-none outline-none" min="1" max={medicine.quantity} />
                                            <button onClick={() => setQty(Math.min(medicine.quantity, qty + 1))} className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"><FiPlus /></button>
                                        </div>
                                        <button onClick={handleAddToCart} className="flex-1 btn-primary py-3 justify-center text-lg shadow-lg hover:-translate-y-0.5 transition-all">
                                            <FiShoppingCart size={20} /> Add to Cart
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
                                {medicine.manufacturer && <div className="flex items-start gap-2"><FiTag className="text-sky-500 mt-1" /><div className="text-slate-500">Manufacturer:<br /><span className="font-semibold text-slate-800">{medicine.manufacturer}</span></div></div>}
                                {medicine.dosage_form && <div className="flex items-start gap-2"><FiInfo className="text-sky-500 mt-1" /><div className="text-slate-500">Form:<br /><span className="font-semibold text-slate-800">{medicine.dosage_form}</span></div></div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FiInfo className="text-sky-600" /> Description & Information</h3>
                            <div className="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                                {medicine.description || 'No description available for this medicine.'}
                            </div>
                        </div>

                        {medicine.uses && (
                            <div className="card p-8 bg-sky-50/50 border-sky-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FiCheck className="text-sky-600" /> Indications & Uses</h3>
                                <div className="text-slate-600 whitespace-pre-wrap">{medicine.uses}</div>
                            </div>
                        )}

                        {medicine.side_effects && (
                            <div className="card p-8 bg-amber-50/50 border-amber-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FiAlertCircle className="text-amber-600" /> Side Effects</h3>
                                <div className="text-slate-600 whitespace-pre-wrap">{medicine.side_effects}</div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {medicine.requires_prescription && (
                            <div className="card p-6 border-2 border-amber-200 bg-amber-50">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4"><FiShield size={24} /></div>
                                <h3 className="font-bold text-slate-800 mb-2">Prescription Required</h3>
                                <p className="text-sm text-slate-600 mb-4">This medicine requires a valid prescription from a certified healthcare professional. You will be prompted to upload it during checkout.</p>
                            </div>
                        )}

                        <div className="card p-6 shadow-md">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">Product Details</h3>
                            <div className="space-y-3 text-sm divide-y divide-slate-100">
                                {[['Brand', medicine.brand_name], ['Generic', medicine.generic_name], ['Barcode', medicine.barcode], ['Pregnancy Cat.', medicine.pregnancy_category ? `Category ${medicine.pregnancy_category}` : null], ['Storage', medicine.storage_conditions]].map(([k, v]) => v ? (
                                    <div key={k} className="flex justify-between py-2">
                                        <span className="text-slate-500">{k}</span>
                                        <span className="font-semibold text-slate-800 text-right">{v}</span>
                                    </div>
                                ) : null)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
