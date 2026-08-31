import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/footer";

import Home from "./pages/Home";
import Shop from "./pages/shop";
import NewArrivals from "./pages/new-arrivals";
import ScrollToTop from "./components/scrolltotop";
import ProductDetails from "./pages/productdetails";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import OrderSuccess from "./pages/ordersuccess";
import About from "./pages/about";
import Support from "./pages/support";
import Login from "./pages/login";
import CreateAccount from "./pages/createaccount";
import MyOrders from "./pages/myorders";
import AdminOrders from "./pages/adminorders";
import AdminDashboard from "./pages/admindashboard";
import AdminRoute from "./components/adminroute";
import AdminProducts from "./pages/adminproducts";
import AdminUsers from "./pages/adminusers";
import AdminCategories from "./pages/admincategories";
import AdminPayments from "./pages/adminpayments";
import AdminAnalytics from "./pages/adminanalytics";
import AdminSettings from "./pages/adminsettings";
import PrivacyPolicy from "./pages/privacypolicy";
import Terms from "./pages/terms";
import ForgotPassword from "./pages/forgotpwd";
import Assistant from "./pages/assistant";



import "./App.css";

function App() {

    return (
        <BrowserRouter>

            <ScrollToTop />

            <AppContent />

        </BrowserRouter>
    );
}

function AppContent() {

    const location = useLocation();

    const isAdminPage =
        location.pathname.startsWith("/admin");

    return (
        <>
            {!isAdminPage && <Navbar />}

            <Routes>

                {/* USER ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/ordersuccess" element={<OrderSuccess />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<Support />} />
                <Route path="/login" element={<Login />} />
                <Route path="/createaccount" element={<CreateAccount />} />
                <Route path="/myorders" element={<MyOrders />} />
                <Route path="/adminpayments" element={<AdminPayments />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/forgotpwd" element={<ForgotPassword />} />
                <Route path="/assistant" element={<Assistant />} />

                {/* ADMIN ROUTES */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/adminorders"
                    element={
                        <AdminRoute>
                            <AdminOrders />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/adminproducts"
                    element={
                        <AdminRoute>
                            <AdminProducts />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/adminusers"
                    element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admincategories"
                    element={
                        <AdminRoute>
                            <AdminCategories />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/adminpayments"
                    element={
                        <AdminRoute>
                            <AdminPayments />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/adminanalytics"
                    element={
                        <AdminRoute>
                            <AdminAnalytics />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/adminsettings"
                    element={
                        <AdminRoute>
                            <AdminSettings />
                        </AdminRoute>
                    }
                />
            </Routes>

            {!isAdminPage && <Footer />}
        </>
    );
}
export default App;