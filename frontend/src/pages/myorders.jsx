import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import {
    FiArrowLeft,
    FiPackage,
    FiTruck,
    FiCheckCircle
} from "react-icons/fi";

import { useAuth } from "../context/authContext.jsx";

import "../styles/myorders.css";


function MyOrders() {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCancelPopup, setShowCancelPopup] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);;


    // FETCH USER ORDERS
    useEffect(() => {

        const fetchOrders = async () => {

            try {

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }


                const response = await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/orders/myorders",
                    {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    setError(
                        data.message || "Failed to load orders"
                    );

                    return;
                }


                setOrders(data.orders || []);

            }

            catch (error) {

                console.error(
                    "Fetch orders error:",
                    error
                );

                setError(
                    "Unable to connect to server"
                );

            }

            finally {

                setLoading(false);

            }

        };


        fetchOrders();

    }, [navigate]);

const handleCancelOrder = async () => {

    if (!selectedOrderId) {
        return;
    }

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `https://mini-ecommerce-backend-yxii.onrender.com/orders/${selectedOrderId}/cancel`,
            {
                method: "PATCH",

                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {

            setError(
                data.message || "Unable to cancel order"
            );

            setShowCancelPopup(false);
            return;
        }


        setOrders((currentOrders) =>
            currentOrders.map((order) =>
                order._id === selectedOrderId
                    ? {
                        ...order,
                        orderStatus: "Cancelled"
                    }
                    : order
            )
        );


        setShowCancelPopup(false);
        setSelectedOrderId(null);

    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );

        setError(
            "Unable to connect to server"
        );

        setShowCancelPopup(false);
    }
};
    return (

        <div className="my-orders-page">


            {/* BACK BUTTON */}

            <button
                className="my-orders-back-btn"
                onClick={() => navigate("/")}
            >
                <FiArrowLeft />
                Back to Home
            </button>


            {/* HEADER */}

            <div className="my-orders-header">

                <h1>
                    My Orders
                </h1>

                <p>
                    Track and manage your orders
                </p>

            </div>


            {/* LOADING */}

            {loading && (

                <div className="orders-empty">

                    <FiPackage className="orders-empty-icon" />

                    <h2>
                        Loading your orders...
                    </h2>

                </div>

            )}


            {/* ERROR */}

            {!loading && error && (

                <div className="orders-empty">

                    <FiPackage className="orders-empty-icon" />

                    <h2>
                        Something went wrong
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="start-shopping-btn"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* NO ORDERS */}

            {!loading &&
                !error &&
                orders.length === 0 && (

                    <div className="orders-empty">

                        <FiPackage className="orders-empty-icon" />

                        <h2>
                            No orders yet
                        </h2>

                        <p>
                            You haven't placed any orders yet.
                            Start shopping and your orders
                            will appear here.
                        </p>

                        <button
                            className="start-shopping-btn"
                            onClick={() => navigate("/shop")}
                        >
                            Start Shopping
                        </button>

                    </div>

                )}


            {/* ORDERS */}

            {!loading &&
                !error &&
                orders.length > 0 && (

                    <div className="orders-list">

                        {orders.map((order) => (

                            <div
                                className="order-card"
                                key={order._id}
                            >


                                {/* ORDER HEADER */}

                                <div className="order-card-header">

                                    <div>

                                        <span>
                                            ORDER ID
                                        </span>

                                        <h3>
                                            #{order._id}
                                        </h3>

                                    </div>


                                    <div className="order-status">

                                        <FiCheckCircle />

                                        {order.orderStatus}

                                    </div>
                                    {(order.orderStatus === "Placed" ||
                                        order.orderStatus === "Processing") && (

                                        <button
                                        type="button"
                                        className="cancel-order-btn"
                                        onClick={() => {
                                            setSelectedOrderId(order._id);
                                            setShowCancelPopup(true);
                                        }}
                                    >
                                        Cancel Order
                                    </button>

                                    )}
                                </div>


                                {/* PRODUCTS */}

                                <div className="order-products">

                                    {order.products.map(
                                        (product, index) => (

                                            <div
                                                className="order-product"
                                                key={`${order._id}-${index}`}
                                            >

                                                <img
                                                    src={
                                                        product.image?.startsWith("/uploads")
                                                            ? `https://mini-ecommerce-backend-yxii.onrender.com${product.image}`
                                                            : product.image
                                                    }
                                                    alt={product.name}
                                                />

                                                <div className="order-product-info">

                                                    <h3>
                                                        {product.name}
                                                    </h3>

                                                    <p>
                                                        Quantity:{" "}
                                                        {product.quantity}
                                                    </p>

                                                    <p>
                                                        ₹
                                                        {product.price.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                </div>


                                                <strong>

                                                    ₹
                                                    {(
                                                        product.price *
                                                        product.quantity
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </strong>

                                            </div>

                                        )
                                    )}

                                </div>


                                {/* DELIVERY */}

                                <div className="order-delivery">

                                    <div>

                                        <FiTruck />

                                        <div>

                                            <span>
                                                Delivery Address
                                            </span>

                                            <p>
                                                {order.deliveryAddress.fullName}
                                            </p>

                                            <p>
                                                {order.deliveryAddress.address},
                                                {" "}
                                                {order.deliveryAddress.city},
                                                {" "}
                                                {order.deliveryAddress.state}
                                                {" "}
                                                {order.deliveryAddress.pincode}
                                            </p>

                                            <p>
                                                Mobile:{" "}
                                                {order.deliveryAddress.mobile}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* ORDER FOOTER */}

                                <div className="order-card-footer">

                                    <div>

                                        <span>
                                            Payment
                                        </span>

                                        <strong>
                                            {order.paymentMethod.toUpperCase()}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Order Total
                                        </span>

                                        <strong>
                                            ₹
                                            {order.totalAmount.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Ordered On
                                        </span>

                                        <strong>
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>

                                </div>


                            </div>

                        ))}

                    </div>

                )}
                {showCancelPopup && (
    <div className="cancel-popup-overlay">

        <div className="cancel-popup">

            <h2>Cancel Order?</h2>

            <p>
                Are you sure you want to cancel this order?
            </p>

            <div className="cancel-popup-actions">

                <button
                    type="button"
                    className="cancel-popup-no"
                    onClick={() => {
                        setShowCancelPopup(false);
                        setSelectedOrderId(null);
                    }}
                >
                    No, Keep Order
                </button>

                <button
                    type="button"
                    className="cancel-popup-yes"
                    onClick={handleCancelOrder}
                >
                    Yes, Cancel Order
                </button>

            </div>

        </div>

    </div>
)}
        </div>

    );
}


export default MyOrders;