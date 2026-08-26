import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiCreditCard,
    FiShoppingBag,
    FiDollarSign,
    FiSmartphone
} from "react-icons/fi";

import "../styles/adminpayments.css";


function AdminPayments() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [paymentFilter, setPaymentFilter] = useState("All");


    useEffect(() => {

        const fetchOrders = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response =
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


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to fetch payment records"
                    );

                }


                setOrders(
                    data.orders || []
                );


            } catch (error) {

                console.error(
                    "Payment fetch error:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load payment records"
                );


            } finally {

                setLoading(false);

            }

        };


        fetchOrders();

    }, []);


    const validOrders =
        orders.filter(
            (order) =>
                order.orderStatus !== "Cancelled"
        );


    const totalRevenue =
        validOrders.reduce(
            (total, order) =>
                total +
                (Number(order.totalAmount) || 0),
            0
        );


    const upiPayments =
        validOrders.filter(
            (order) =>
                order.paymentMethod === "upi"
        ).length;


    const cardPayments =
        validOrders.filter(
            (order) =>
                order.paymentMethod === "card"
        ).length;


    const codPayments =
        validOrders.filter(
            (order) =>
                order.paymentMethod === "cod"
        ).length;


    const filteredOrders =
        paymentFilter === "All"
            ? orders
            : orders.filter(
                (order) =>
                    order.paymentMethod ===
                    paymentFilter.toLowerCase()
            );


    const getPaymentMethodName = (method) => {

        if (method === "upi") {
            return "UPI";
        }

        if (method === "card") {
            return "Card";
        }

        if (method === "cod") {
            return "Cash on Delivery";
        }

        return "Unknown";

    };


    const getPaymentStatus = (order) => {

        if (order.orderStatus === "Cancelled") {
            return "Cancelled";
        }

        if (order.paymentMethod === "cod") {

            if (
                order.orderStatus === "Delivered"
            ) {
                return "Paid";
            }

            return "Pending";

        }

        return "Paid";

    };


    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    return (

        <div className="admin-payments-page">


            <div className="admin-payments-heading">

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
                        Payments
                    </h1>

                    <span>
                        View and manage customer payment records.
                    </span>

                </div>

            </div>


            {error && (

                <p className="admin-payments-error">
                    {error}
                </p>

            )}


            {!loading && !error && (

                <section className="admin-payment-summary">


                    {/* TOTAL PAYMENTS */}

                    <div className="admin-payment-summary-card">

                        <div className="admin-payment-summary-icon">

                            <FiCreditCard />

                        </div>

                        <div>

                            <span>
                                Total Payments
                            </span>

                            <strong>
                                {validOrders.length}
                            </strong>

                        </div>

                    </div>


                    {/* TOTAL REVENUE */}

                    <div className="admin-payment-summary-card">

                        <div className="admin-payment-summary-icon">

                            <FiDollarSign />

                        </div>

                        <div>

                            <span>
                                Total Revenue
                            </span>

                            <strong>
                                ₹
                                {totalRevenue.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>

                    </div>


                    {/* UPI */}

                    <div className="admin-payment-summary-card">

                        <div className="admin-payment-summary-icon">

                            <FiSmartphone />

                        </div>

                        <div>

                            <span>
                                UPI Payments
                            </span>

                            <strong>
                                {upiPayments}
                            </strong>

                        </div>

                    </div>


                    {/* CARD */}

                    <div className="admin-payment-summary-card">

                        <div className="admin-payment-summary-icon">

                            <FiCreditCard />

                        </div>

                        <div>

                            <span>
                                Card Payments
                            </span>

                            <strong>
                                {cardPayments}
                            </strong>

                        </div>

                    </div>


                    {/* COD */}

                    <div className="admin-payment-summary-card">

                        <div className="admin-payment-summary-icon">

                            <FiShoppingBag />

                        </div>

                        <div>

                            <span>
                                COD Orders
                            </span>

                            <strong>
                                {codPayments}
                            </strong>

                        </div>

                    </div>


                </section>

            )}


            <section className="admin-payments-section">


                <div className="admin-payments-section-heading">

                    <div>

                        <p>
                            PAYMENT MANAGEMENT
                        </p>

                        <h2>
                            Payment Records
                        </h2>

                    </div>


                    {/* FILTER */}

                    <select
                        value={paymentFilter}
                        onChange={(e) =>
                            setPaymentFilter(
                                e.target.value
                            )
                        }
                    >

                        <option value="All">
                            All Payments
                        </option>

                        <option value="UPI">
                            UPI
                        </option>

                        <option value="Card">
                            Card
                        </option>

                        <option value="COD">
                            Cash on Delivery
                        </option>

                    </select>

                </div>


                {loading ? (

                    <div className="admin-payment-message">

                        Loading payment records...

                    </div>

                ) : error ? (

                    <div className="admin-payment-message">

                        Unable to load payment records.

                    </div>

                ) : filteredOrders.length === 0 ? (

                    <div className="admin-payment-message">

                        <FiCreditCard />

                        <h3>
                            No payment records
                        </h3>

                        <p>
                            Payment information will appear
                            here when customers place orders.
                        </p>

                    </div>

                ) : (


                    <div className="admin-payment-table-wrapper">

                        <table className="admin-payment-table">

                            <thead>

                                <tr>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Payment Method
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredOrders.map(
                                    (order) => (

                                        <tr
                                            key={order._id}
                                        >


                                            {/* ORDER */}

                                            <td>

                                                <strong>
                                                    #
                                                    {order._id.slice(-8)}
                                                </strong>

                                            </td>


                                            {/* CUSTOMER */}

                                            <td>

                                                <div className="admin-payment-customer">

                                                    <strong>
                                                        {
                                                            order.user?.name ||
                                                            "Unknown"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            order.user?.email ||
                                                            "-"
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* PAYMENT METHOD */}

                                            <td>

                                                <span
                                                    className={
                                                        `payment-method payment-${order.paymentMethod}`
                                                    }
                                                >

                                                    {
                                                        getPaymentMethodName(
                                                            order.paymentMethod
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* AMOUNT */}

                                            <td>

                                                <strong>

                                                    ₹
                                                    {Number(
                                                        order.totalAmount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </strong>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={
                                                        `payment-status payment-status-${getPaymentStatus(
                                                            order
                                                        )
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s/g,
                                                                "-"
                                                            )}`
                                                    }
                                                >

                                                    {
                                                        getPaymentStatus(
                                                            order
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* DATE */}

                                            <td>

                                                {
                                                    formatDate(
                                                        order.createdAt
                                                    )
                                                }

                                            </td>


                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* ==========================================
                INFORMATION
            ========================================== */}

            <section className="admin-payment-info">

                <FiCreditCard />

                <div>

                    <h3>
                        Payment information
                    </h3>

                    <p>
                        Payment records are created from
                        customer orders. UPI and card payments
                        are currently recorded as demo payment
                        methods. Cash on Delivery remains
                        pending until the order is delivered.
                    </p>

                </div>

            </section>


        </div>

    );

}


export default AdminPayments;