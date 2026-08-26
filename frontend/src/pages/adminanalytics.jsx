import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiBarChart2,
    FiShoppingBag,
    FiDollarSign,
    FiPackage,
    FiTrendingUp,
    FiCreditCard,
} from "react-icons/fi";

import "../styles/adminanalytics.css";


function AdminAnalytics() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");



    useEffect(() => {

        const fetchAnalyticsData = async () => {

            try {

                const token =
                    localStorage.getItem("token");


                // FETCH ORDERS

                const ordersResponse =
                    await fetch(
                        "http://localhost:5000/orders/admin/all",
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


                // FETCH PRODUCTS

                const productsResponse =
                    await fetch(
                        "http://localhost:5000/products"
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
                    Array.isArray(productsData)
                        ? productsData
                        : productsData.products || []
                );


            } catch (error) {

                console.error(
                    "Analytics fetch error:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load analytics"
                );


            } finally {

                setLoading(false);

            }

        };


        fetchAnalyticsData();

    }, []);



    const activeOrders =
        orders.filter(
            (order) =>
                order.orderStatus !== "Cancelled"
        );


    const totalSales =
        activeOrders.reduce(
            (total, order) =>
                total +
                (Number(order.totalAmount) || 0),
            0
        );


    const averageOrderValue =
        activeOrders.length > 0
            ? totalSales / activeOrders.length
            : 0;



    const statusData = [

        {
            name: "Placed",
            count: orders.filter(
                (order) =>
                    order.orderStatus === "Placed"
            ).length
        },

        {
            name: "Processing",
            count: orders.filter(
                (order) =>
                    order.orderStatus === "Processing"
            ).length
        },

        {
            name: "Shipped",
            count: orders.filter(
                (order) =>
                    order.orderStatus === "Shipped"
            ).length
        },

        {
            name: "Out for Delivery",
            count: orders.filter(
                (order) =>
                    order.orderStatus ===
                    "Out for Delivery"
            ).length
        },

        {
            name: "Delivered",
            count: orders.filter(
                (order) =>
                    order.orderStatus === "Delivered"
            ).length
        },

        {
            name: "Cancelled",
            count: orders.filter(
                (order) =>
                    order.orderStatus === "Cancelled"
            ).length
        }

    ];



    const paymentData = [

        {
            name: "UPI",
            count: activeOrders.filter(
                (order) =>
                    order.paymentMethod === "upi"
            ).length
        },

        {
            name: "Card",
            count: activeOrders.filter(
                (order) =>
                    order.paymentMethod === "card"
            ).length
        },

        {
            name: "COD",
            count: activeOrders.filter(
                (order) =>
                    order.paymentMethod === "cod"
            ).length
        }

    ];


    const productSales = {};


    activeOrders.forEach((order) => {

        order.products?.forEach((product) => {

            const productId =
                product.productId;

            if (!productSales[productId]) {

                productSales[productId] = {
                    name: product.name,
                    quantity: 0,
                    revenue: 0
                };

            }


            productSales[productId].quantity +=
                Number(product.quantity) || 0;


            productSales[productId].revenue +=
                (
                    Number(product.price) || 0
                ) *
                (
                    Number(product.quantity) || 0
                );

        });

    });


    const bestSellingProducts =
        Object.values(productSales)
            .sort(
                (a, b) =>
                    b.quantity - a.quantity
            )
            .slice(0, 5);



    const monthlySales = {};

    activeOrders.forEach((order) => {

        if (!order.createdAt) {
            return;
        }


        const date =
            new Date(order.createdAt);


        const month =
            date.toLocaleDateString(
                "en-IN",
                {
                    month: "short",
                    year: "numeric"
                }
            );


        if (!monthlySales[month]) {

            monthlySales[month] = 0;

        }


        monthlySales[month] +=
            Number(order.totalAmount) || 0;

    });


    const monthlySalesData =
        Object.entries(monthlySales)
            .slice(-6);



    const formatCurrency = (value) => {

        return `₹${Number(value || 0).toLocaleString(
            "en-IN"
        )}`;

    };


    return (

        <div className="admin-analytics-page">


            <div className="admin-analytics-heading">

                <button
                    type="button"
                    onClick={() =>
                        navigate("/admin")
                    }
                >

                    <FiArrowLeft />

                    Back to Dashboard

                </button>


                <div>

                    <p>
                        VELORA ADMIN
                    </p>

                    <h1>
                        Analytics
                    </h1>

                    <span>
                        Monitor your store performance and sales.
                    </span>

                </div>

            </div>



            {error && (

                <p className="admin-analytics-error">
                    {error}
                </p>

            )}


            {loading ? (

                <div className="admin-analytics-message">

                    Loading analytics...

                </div>

            ) : error ? (

                <div className="admin-analytics-message">

                    Unable to load analytics.

                </div>

            ) : (

                <>



                    <section className="admin-analytics-summary">


                        {/* SALES */}

                        <div className="admin-analytics-card">

                            <div className="admin-analytics-icon">

                                <FiDollarSign />

                            </div>

                            <div>

                                <span>
                                    Total Sales
                                </span>

                                <strong>
                                    {formatCurrency(
                                        totalSales
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* ORDERS */}

                        <div className="admin-analytics-card">

                            <div className="admin-analytics-icon">

                                <FiShoppingBag />

                            </div>

                            <div>

                                <span>
                                    Total Orders
                                </span>

                                <strong>
                                    {activeOrders.length}
                                </strong>

                            </div>

                        </div>


                        {/* PRODUCTS */}

                        <div className="admin-analytics-card">

                            <div className="admin-analytics-icon">

                                <FiPackage />

                            </div>

                            <div>

                                <span>
                                    Products
                                </span>

                                <strong>
                                    {products.length}
                                </strong>

                            </div>

                        </div>


                        {/* AVERAGE */}

                        <div className="admin-analytics-card">

                            <div className="admin-analytics-icon">

                                <FiTrendingUp />

                            </div>

                            <div>

                                <span>
                                    Average Order Value
                                </span>

                                <strong>
                                    {formatCurrency(
                                        averageOrderValue
                                    )}
                                </strong>

                            </div>

                        </div>


                    </section>



                    <section className="admin-analytics-section">

                        <div className="admin-analytics-section-heading">

                            <div>

                                <p>
                                    ORDER ANALYTICS
                                </p>

                                <h2>
                                    Order Status
                                </h2>

                            </div>

                        </div>


                        <div className="analytics-status-grid">

                            {statusData.map(
                                (status) => (

                                    <div
                                        className="analytics-status-card"
                                        key={status.name}
                                    >

                                        <span>
                                            {status.name}
                                        </span>

                                        <strong>
                                            {status.count}
                                        </strong>

                                    </div>

                                )
                            )}

                        </div>

                    </section>



                    <div className="admin-analytics-two-column">


                        {/* PAYMENT ANALYTICS */}

                        <section className="admin-analytics-panel">

                            <div className="admin-analytics-panel-heading">

                                <div>

                                    <p>
                                        PAYMENT ANALYTICS
                                    </p>

                                    <h2>
                                        Payment Methods
                                    </h2>

                                </div>

                                <FiCreditCard />

                            </div>


                            <div className="analytics-payment-list">

                                {paymentData.map(
                                    (payment) => {

                                        const percentage =
                                            activeOrders.length > 0
                                                ? (
                                                    payment.count /
                                                    activeOrders.length
                                                ) * 100
                                                : 0;


                                        return (

                                            <div
                                                className="analytics-payment-item"
                                                key={payment.name}
                                            >

                                                <div>

                                                    <span>
                                                        {
                                                            payment.name
                                                        }
                                                    </span>

                                                    <strong>
                                                        {
                                                            payment.count
                                                        }
                                                    </strong>

                                                </div>


                                                <div className="analytics-progress">

                                                    <div
                                                        className="analytics-progress-bar"
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    ></div>

                                                </div>

                                                <small>
                                                    {percentage.toFixed(
                                                        0
                                                    )}%
                                                </small>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </section>


                        {/* MONTHLY SALES */}

                        <section className="admin-analytics-panel">

                            <div className="admin-analytics-panel-heading">

                                <div>

                                    <p>
                                        SALES ANALYTICS
                                    </p>

                                    <h2>
                                        Monthly Sales
                                    </h2>

                                </div>

                                <FiBarChart2 />

                            </div>


                            {monthlySalesData.length === 0 ? (

                                <div className="analytics-no-data">

                                    No sales data available.

                                </div>

                            ) : (

                                <div className="analytics-monthly-list">

                                    {monthlySalesData.map(
                                        (
                                            [
                                                month,
                                                amount
                                            ]
                                        ) => (

                                            <div
                                                className="analytics-month"
                                                key={month}
                                            >

                                                <div>

                                                    <span>
                                                        {month}
                                                    </span>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                amount
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                                <div className="analytics-month-bar">

                                                    <div
                                                        style={{
                                                            width:
                                                                `${Math.min(
                                                                    (
                                                                        amount /
                                                                        Math.max(
                                                                            ...monthlySalesData.map(
                                                                                ([
                                                                                    ,
                                                                                    value
                                                                                ]) =>
                                                                                    value
                                                                            )
                                                                        )
                                                                    ) *
                                                                    100,
                                                                    100
                                                                )}%`
                                                        }}
                                                    ></div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </section>

                    </div>



                    <section className="admin-analytics-section">

                        <div className="admin-analytics-section-heading">

                            <div>

                                <p>
                                    PRODUCT PERFORMANCE
                                </p>

                                <h2>
                                    Best Selling Products
                                </h2>

                            </div>

                        </div>


                        {bestSellingProducts.length === 0 ? (

                            <div className="analytics-no-products">

                                <FiPackage />

                                <h3>
                                    No product sales yet
                                </h3>

                                <p>
                                    Product performance will appear
                                    after customers place orders.
                                </p>

                            </div>

                        ) : (

                            <div className="analytics-product-table-wrapper">

                                <table className="analytics-product-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                #
                                            </th>

                                            <th>
                                                Product
                                            </th>

                                            <th>
                                                Units Sold
                                            </th>

                                            <th>
                                                Revenue
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {bestSellingProducts.map(
                                            (
                                                product,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        product.name
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            {index + 1}
                                                        </strong>

                                                    </td>

                                                    <td>

                                                        <strong>
                                                            {
                                                                product.name
                                                            }
                                                        </strong>

                                                    </td>

                                                    <td>

                                                        {
                                                            product.quantity
                                                        }

                                                    </td>

                                                    <td>

                                                        <strong>
                                                            {
                                                                formatCurrency(
                                                                    product.revenue
                                                                )
                                                            }
                                                        </strong>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>



                    <section className="admin-analytics-info">

                        <FiBarChart2 />

                        <div>

                            <h3>
                                Analytics are based on your order data
                            </h3>

                            <p>
                                Sales, order status, payment method,
                                monthly sales and product performance
                                are calculated from the orders stored
                                in your MongoDB database.
                            </p>

                        </div>

                    </section>

                </>

            )}

        </div>

    );

}


export default AdminAnalytics;