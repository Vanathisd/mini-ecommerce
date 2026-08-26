import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

import {
    FiGrid,
    FiShoppingBag,
    FiUsers,
    FiPackage,
    FiLayers,
    FiCreditCard,
    FiBarChart2,
    FiSettings,
    FiLogOut
} from "react-icons/fi";

import "../styles/admindashboard.css";


function AdminDashboard() {

    const navigate = useNavigate();

    const { logout } = useAuth();


    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    const [error, setError] = useState("");


    // FETCH DASHBOARD DATA
    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                const token =
                    localStorage.getItem("token");


                // FETCH USERS
                const usersResponse =
                    await fetch(
                        "https://mini-ecommerce-backend-yxii.onrender.com/user/admin/all",
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const usersData =
                    await usersResponse.json();


                if (!usersResponse.ok) {

                    throw new Error(
                        usersData.message ||
                        "Failed to fetch users"
                    );

                }


                setUsers(
                    usersData.users || []
                );


                // FETCH PRODUCTS
                const productsResponse =
                    await fetch(
                        "https://mini-ecommerce-backend-yxii.onrender.com/products"
                    );


                const productsData =
                    await productsResponse.json();


                if (!productsResponse.ok) {

                    throw new Error(
                        productsData.message ||
                        "Failed to fetch products"
                    );

                }


                setProducts(
                    productsData || []
                );


                // FETCH ORDERS
                const ordersResponse =
                    await fetch(
                        "https://mini-ecommerce-backend-yxii.onrender.com/orders/admin/all",
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const ordersData =
                    await ordersResponse.json();


                if (!ordersResponse.ok) {

                    throw new Error(
                        ordersData.message ||
                        "Failed to fetch orders"
                    );

                }


                setOrders(
                    ordersData.orders || []
                );


            } catch (error) {

                console.error(
                    "Dashboard data error:",
                    error
                );

                setError(
                    error.message ||
                    "Failed to load dashboard data"
                );

            }

        };


        fetchDashboardData();

    }, []);


    // TOTAL SALES
    const totalSales = orders
    .filter(
        (order) => order.orderStatus !== "Cancelled"
    )
    .reduce(
        (total, order) =>
            total + (Number(order.totalAmount) || 0),
        0
    );


    // ORDER STATUS COUNTS
    const processingOrders =
        orders.filter(
            (order) =>
                order.orderStatus === "Processing"
        ).length;


    const shippedOrders =
        orders.filter(
            (order) =>
                order.orderStatus === "Shipped"
        ).length;


    const outForDeliveryOrders =
        orders.filter(
            (order) =>
                order.orderStatus ===
                "Out for Delivery"
        ).length;


    const deliveredOrders =
        orders.filter(
            (order) =>
                order.orderStatus === "Delivered"
        ).length;


    const cancelledOrders =
        orders.filter(
            (order) =>
                order.orderStatus === "Cancelled"
        ).length;


    // LOGOUT
    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    return (

        <div className="admin-dashboard-page">


            {/* HEADER */}

            <header className="admin-header">

                <div className="admin-logo">

                    <h2>
                        VELORA
                    </h2>

                    <span>
                        ADMIN
                    </span>

                </div>


                <div className="admin-profile">

                    <div className="admin-avatar">
                        A
                    </div>

                    <div className="admin-profile-info">

                        <strong>
                            Admin
                        </strong>

                        <span>
                            Administrator
                        </span>

                    </div>

                </div>

            </header>


            {/* SIDEBAR */}

            <aside className="admin-sidebar">

                <nav className="admin-navigation">


                    <button
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >

                        <FiGrid />

                        <span>
                            Dashboard
                        </span>

                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/adminorders")
                        }
                    >

                        <FiShoppingBag />

                        <span>
                            Orders
                        </span>

                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/adminusers")
                        }
                    >

                        <FiUsers />

                        <span>
                            Users
                        </span>

                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/adminproducts")
                        }
                    >

                        <FiPackage />

                        <span>
                            Products
                        </span>

                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admincategories")
                        }
                    >

                        <FiLayers />

                        <span>
                            Categories
                        </span>

                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/adminpayments")
                        }
                    >

                        <FiCreditCard />

                        <span>
                            Payments
                        </span>

                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/adminanalytics")
                        }
                    >

                        <FiBarChart2 />

                        <span>
                            Analytics
                        </span>

                    </button>


                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/adminsettings")
                        }
                    >

                        <FiSettings />

                        <span>
                            Settings
                        </span>

                    </button>

                </nav>


                <button
                    className="admin-logout-btn"
                    onClick={handleLogout}
                >

                    <FiLogOut />

                    <span>
                        Logout
                    </span>

                </button>

            </aside>


            {/* MAIN CONTENT */}

            <main className="admin-main-content">


                {/* PAGE HEADING */}

                <div className="admin-page-heading">

                    <div>

                        <p>
                            VELORA ADMIN
                        </p>

                        <h1>
                            Dashboard
                        </h1>

                    </div>

                    <span>
                        Welcome back, Admin
                    </span>

                </div>


                {/* ERROR */}

                {error && (

                    <p className="admin-orders-error">
                        {error}
                    </p>

                )}


                {/* STATISTICS */}

                <section className="admin-stat-grid">


                    {/* TOTAL ORDERS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            <FiShoppingBag />
                        </div>

                        <div>

                            <span>
                                Total Orders
                            </span>

                            <h2>
                                {orders.length}
                            </h2>

                        </div>

                    </div>


                    {/* TOTAL SALES */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            <FiCreditCard />
                        </div>

                        <div>

                            <span>
                                Total Sales
                            </span>

                            <h2>
                                ₹{totalSales.toLocaleString("en-IN")}
                            </h2>

                        </div>

                    </div>


                    {/* TOTAL USERS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            <FiUsers />
                        </div>

                        <div>

                            <span>
                                Total Users
                            </span>

                            <h2>
                                {users.length}
                            </h2>

                        </div>

                    </div>


                    {/* TOTAL PRODUCTS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            <FiPackage />
                        </div>

                        <div>

                            <span>
                                Products
                            </span>

                            <h2>
                                {products.length}
                            </h2>

                        </div>

                    </div>

                </section>


                {/* ORDER OVERVIEW */}

                <section className="admin-status-section">

                    <h2>
                        Order Overview
                    </h2>


                    <div className="admin-status-grid">


                        <div className="admin-status-card">

                            <span>
                                Processing
                            </span>

                            <strong>
                                {processingOrders}
                            </strong>

                        </div>


                        <div className="admin-status-card">

                            <span>
                                Shipped
                            </span>

                            <strong>
                                {shippedOrders}
                            </strong>

                        </div>


                        <div className="admin-status-card">

                            <span>
                                Out for Delivery
                            </span>

                            <strong>
                                {outForDeliveryOrders}
                            </strong>

                        </div>


                        <div className="admin-status-card">

                            <span>
                                Delivered
                            </span>

                            <strong>
                                {deliveredOrders}
                            </strong>

                        </div>


                        <div className="admin-status-card">

                            <span>
                                Cancelled
                            </span>

                            <strong>
                                {cancelledOrders}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* RECENT ORDERS */}

                <section className="admin-recent-section">

                    <div className="admin-section-heading">

                        <div>

                            <p>
                                ORDER MANAGEMENT
                            </p>

                            <h2>
                                Recent Orders
                            </h2>

                        </div>


                        <button
                            onClick={() =>
                                navigate("/adminorders")
                            }
                        >
                            View All Orders
                        </button>

                    </div>


                    {orders.length === 0 ? (

                        <div className="admin-empty-table">

                            <FiShoppingBag />

                            <h3>
                                No orders yet
                            </h3>

                            <p>
                                Once customers place orders,
                                they will be displayed here.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-recent-orders">

                            {orders
                                .slice(0, 5)
                                .map((order) => (

                                    <div
                                        className="admin-recent-order"
                                        key={order._id}
                                    >

                                        <div>

                                            <span>
                                                ORDER
                                            </span>

                                            <strong>
                                                #{order._id.slice(-8)}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Customer
                                            </span>

                                            <strong>
                                                {order.user?.name ||
                                                    "Unknown"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {order.orderStatus}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Total
                                            </span>

                                            <strong>
                                                ₹
                                                {Number(
                                                    order.totalAmount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                ))}

                        </div>

                    )}

                </section>


                {/* QUICK ACTIONS */}

                <section className="admin-quick-actions">

                    <h2>
                        Quick Actions
                    </h2>


                    <div className="admin-action-grid">


                        {/* MANAGE ORDERS */}

                        <button
                            onClick={() =>
                                navigate("/adminorders")
                            }
                        >

                            <FiShoppingBag />

                            <div>

                                <strong>
                                    Manage Orders
                                </strong>

                                <span>
                                    View and update customer orders
                                </span>

                            </div>

                        </button>


                        {/* MANAGE PRODUCTS */}

                        <button
                            onClick={() =>
                                navigate("/adminproducts")
                            }
                        >

                            <FiPackage />

                            <div>

                                <strong>
                                    Manage Products
                                </strong>

                                <span>
                                    Add and manage products
                                </span>

                            </div>

                        </button>


                        {/* MANAGE USERS */}

                        <button onClick={() =>
                            navigate("/adminusers")
                        }>

                            <FiUsers />

                            <div>

                                <strong>
                                    Manage Users
                                </strong>

                                <span>
                                    View registered customers
                                </span>

                            </div>

                        </button>

                    </div>

                </section>


            </main>

        </div>

    );

}


export default AdminDashboard;

