import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';

export default function CartDrawer() {
    const { cart, isDrawerOpen, setDrawerOpen, updateItem, removeItem, subtotal } = useCart();
    const navigate = useNavigate();
    const confirm = useConfirm();

    if (!isDrawerOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setDrawerOpen(false)} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <ShoppingBag size={20} /> Your Cart
                    </h2>
                    <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {cart.items?.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                        <ShoppingBag size={60} className="text-gray-300" />
                        <p className="text-gray-500 mt-4">Your cart is empty</p>
                        <button onClick={() => { setDrawerOpen(false); navigate('/products'); }} className="btn-primary mt-4">
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {cart.items.map((item) => (
                                <div key={item._id} className="flex gap-4 pb-4 border-b">
                                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg bg-gray-100" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.size} • {item.color}</p>
                                        <p className="font-bold text-brand-600 mt-1">LKR {item.price?.toLocaleString()}</p>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border rounded-lg">
                                                <button onClick={() => updateItem(item._id, Math.max(1, item.quantity - 1))} className="p-1.5 hover:bg-gray-50">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                                <button onClick={() => updateItem(item._id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const ok = await confirm({
                                                        title: 'Remove Item?',
                                                        message: `"${item.name}" will be removed from your cart.`,
                                                        confirmLabel: 'Remove',
                                                        cancelLabel: 'Keep',
                                                        variant: 'warning',
                                                    });
                                                    if (ok) removeItem(item._id);
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1.5"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t p-5 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">LKR {subtotal.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-500">Shipping & taxes calculated at checkout</p>
                            <button
                                onClick={() => { setDrawerOpen(false); navigate('/checkout'); }}
                                className="btn-primary w-full"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}