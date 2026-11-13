import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Cart() {
    const { cart, updateItem, removeItem, subtotal, itemCount, clearCart } = useCart();
    const navigate = useNavigate();

    const shipping = subtotal > 5000 ? 0 : 350;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={44} className="text-gray-300" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h1>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Start shopping to fill it up!</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-brand-200"
                    >
                        Browse Products <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumbs
                    items={[
                        { label: 'Shop', to: '/products' },
                        { label: 'Shopping Cart' },
                    ]}
                    fallbackTo="/products"
                    backLabel="Continue Shopping"
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Shopping Cart</h1>
                        <p className="text-gray-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                        <Trash2 size={15} /> Clear cart
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ── Cart Items ── */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5 hover:shadow-md hover:border-gray-200 transition-all duration-300">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-24 h-28 object-cover rounded-xl bg-gray-100"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">{item.size}</span>
                                                <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                    <span className="w-3 h-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: item.color?.toLowerCase() }} />
                                                    {item.color}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity stepper */}
                                        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => updateItem(item._id, Math.max(1, item.quantity - 1))}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateItem(item._id, item.quantity + 1)}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Line total */}
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">LKR {item.price.toLocaleString()} × {item.quantity}</p>
                                            <p className="font-black text-gray-900 text-base">
                                                LKR {(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Shipping notice */}
                        {subtotal < 5000 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                                <Truck size={20} className="text-amber-600 flex-shrink-0" />
                                <p className="text-sm text-amber-700">
                                    Add <span className="font-bold">LKR {(5000 - subtotal).toLocaleString()}</span> more to get <span className="font-bold">FREE shipping!</span>
                                </p>
                            </div>
                        )}
                        {subtotal >= 5000 && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                                <Truck size={20} className="text-emerald-600 flex-shrink-0" />
                                <p className="text-sm text-emerald-700 font-semibold">🎉 You qualify for FREE shipping!</p>
                            </div>
                        )}
                    </div>

                    {/* ── Order Summary ── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 shadow-sm">
                            <h2 className="font-black text-lg text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span className="font-semibold text-gray-900">LKR {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="flex items-center gap-1.5"><Truck size={14} /> Shipping</span>
                                    <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                        {shipping === 0 ? 'FREE' : `LKR ${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="flex items-center gap-1.5"><Tag size={14} /> Tax (8%)</span>
                                    <span className="font-semibold text-gray-900">LKR {tax.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between font-black text-lg pt-5 mt-5 border-t border-gray-100">
                                <span>Total</span>
                                <span className="text-brand-600">LKR {total.toFixed(0)}</span>
                            </div>

                            <button
                                id="cart-checkout-btn"
                                onClick={() => navigate('/checkout')}
                                className="w-full mt-6 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-purple-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-brand-200 hover:shadow-brand-300"
                            >
                                Proceed to Checkout <ArrowRight size={18} />
                            </button>

                            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-brand-600 font-medium mt-4 transition-colors">
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}