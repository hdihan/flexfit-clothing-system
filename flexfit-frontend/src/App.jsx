import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import VendorDashboard from './pages/VendorDashboard';
import Returns from './pages/Returns';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import MixAndMatch from './pages/MixAndMatch';
import Wishlist from './pages/Wishlist';
import PublicWishlist from './pages/PublicWishlist';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Profile from './pages/Profile';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ConfirmProvider>
                <WishlistProvider>
                    <CartProvider>
                        <Toaster position="top-right" />
                        <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <CartDrawer />
                        <Chatbot />
                        <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/products" element={<ProductList />} />
                            <Route path="/mix-and-match" element={<MixAndMatch />} />
                            <Route path="/outfit-builder" element={<MixAndMatch />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/about" element={<About />} />

                            {/* Public — no auth required (friends can view shared links) */}
                            <Route path="/wishlist/shared/:token" element={<PublicWishlist />} />

                            {/* Protected — shopper only */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/wishlist"
                                element={
                                    <ProtectedRoute>
                                        <Wishlist />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/checkout"
                                element={
                                    <ProtectedRoute>
                                        <Checkout />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/order-success/:id"
                                element={
                                    <ProtectedRoute>
                                        <OrderSuccess />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orders"
                                element={
                                    <ProtectedRoute>
                                        <MyOrders />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/returns"
                                element={
                                    <ProtectedRoute>
                                        <Returns />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/cart"
                                element={
                                    <ProtectedRoute>
                                        <Cart />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Role-restricted */}
                            <Route
                                path="/vendor"
                                element={
                                    <ProtectedRoute roles={['vendor']}>
                                        <VendorDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute roles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                        </main>
                        <Footer />
                        </div>
                    </CartProvider>
                </WishlistProvider>
                </ConfirmProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}