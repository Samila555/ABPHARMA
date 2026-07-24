import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShield } from 'react-icons/fi';
import useCartStore from '../../store/useCartStore';

export default function Cart() {
    const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');

    const total = getCartTotal();
    const fmt = n => `ETB ${parseFloat(n || 0).toLocaleString()}`;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-3xl text-center">
                    <div className="w-32 h-32 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiShield className="text-sky-300 w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">Your cart is empty</h1>
                    <p className="text-slate-500 mb-8">Looks like you haven't added any medicines or products to your cart yet.</p>
                    <Link to="/medicines" className="btn-primary inline-flex">Return to Shop</Link>
                </div>
            </div>
        );
    }

    const requiresRx = items.some(i => i.requires_prescription);

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">Shopping Cart</h1>

                {requiresRx && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-8 flex gap-3 text-amber-800">
                        <FiShield className="flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <strong>Prescription Required:</strong> One or more items in your cart require a valid medical prescription. You will be asked to upload it during checkout.
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        <div className="card divide-y divide-slate-100">
                            {items.map(item => (
                                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center">
                                    <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" /> :
                                            <div className="text-sky-600 font-bold text-2xl">{item.name.charAt(0)}</div>}
                                    </div>

                                    <div className="flex-1 text-center sm:text-left min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate mb-1">
                                            <Link to={`/medicines/${item.id}`} className="hover:text-sky-600">{item.name}</Link>
                                        </h3>
                                        <div className="text-sm text-slate-500 mb-2">{item.category_name}</div>
                                        <div className="font-bold text-slate-800">{fmt(item.selling_price)}</div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-1">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"><FiMinus size={14} /></button>
                                            <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"><FiPlus size={14} /></button>
                                        </div>
                                        <div className="w-24 text-right font-bold text-slate-800 text-lg hidden sm:block">
                                            {fmt(item.selling_price * item.quantity)}
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Checkout Summary */}
                    <div className="w-full lg:w-96">
                        <div className="card p-6 sticky top-28">
                            <h3 className="font-bold text-lg text-slate-800 mb-6">Order Summary</h3>

                            <div className="space-y-3 mb-6 pb-6 border-b border-slate-100">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span className="font-medium">{fmt(total)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="text-sm">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Taxes</span>
                                    <span className="text-sm">Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-xl font-bold text-slate-800 mb-6">
                                <span>Estimated Total</span>
                                <span className="text-sky-600">{fmt(total)}</span>
                            </div>

                            <button onClick={() => navigate('/checkout')} className="w-full btn-primary justify-center py-4 text-lg mb-4">
                                Proceed to Checkout <FiArrowRight className="ml-2" />
                            </button>

                            <Link to="/medicines" className="w-full btn-outline justify-center py-3">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
