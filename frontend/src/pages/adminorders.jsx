
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "../styles/adminorders.css";

function AdminOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    // FETCH ALL ORDERS
    useEffect(() => {

        const fetchOrders = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/orders/admin/all",
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
                        data.message || "Failed to fetch orders"
                    );
                    return;
                }

                setOrders(data.orders || []);

            } catch (error) {

                console.error(error);

                setError(
                    "Unable to connect to server"
                );

            }

        };

        fetchOrders();

    }, []);


    // UPDATE ORDER STATUS
    const handleStatusChange = async (
        orderId,
        newStatus
    ) => {

        try {

            setUpdatingOrderId(orderId);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `https://mini-ecommerce-backend-yxii.onrender.com/orders/admin/${orderId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        orderStatus: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {

                setError(
                    data.message ||
                    "Failed to update order status"
                );

                return;
            }


            // UPDATE UI WITHOUT REFRESHING
            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order._id === orderId
                        ? {
                            ...order,
                            orderStatus:
                                data.order.orderStatus
                        }
                        : order
                )
            );

        } catch (error) {

            console.error(
                "Update status error:",
                error
            );

            setError(
                "Unable to connect to server"
            );

        } finally {

            setUpdatingOrderId(null);

        }

    };


    return (

        <div className="admin-orders-page">
            <button
                className="admin-orders-back-btn"
                onClick={() => navigate("/admin")}
            >
                <FiArrowLeft />
                Back to Dashboard
            </button>
            

            <h1>
                Admin Orders
            </h1>


            {error && (
                <p className="admin-orders-error">
                    {error}
                </p>
            )}


            {orders.length === 0 &&
                !error && (

                    <p className="admin-orders-empty">
                        No orders found.
                    </p>

                )}


            <div className="admin-orders-list">

                {orders.map((order) => (

                    <div
                        className="admin-order-card"
                        key={order._id}
                    >

                        {/* ORDER HEADER */}

                        <div className="admin-order-header">

                            <div>

                                <span>
                                    ORDER ID
                                </span>

                                <h3>
                                    #{order._id}
                                </h3>

                            </div>


                            <div className="admin-order-status">

                                {order.orderStatus}

                            </div>

                        </div>


                        {/* CUSTOMER */}

                        <div className="admin-order-section">

                            <h2>
                                Customer
                            </h2>

                            <div className="admin-customer-details">

                                <div className="admin-detail">

                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {order.user?.name}
                                    </strong>

                                </div>


                                <div className="admin-detail">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {order.user?.email}
                                    </strong>

                                </div>


                                <div className="admin-detail">

                                    <span>
                                        Mobile
                                    </span>

                                    <strong>
                                        {order.deliveryAddress?.mobile}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* PRODUCTS */}

                        <div className="admin-order-section">

                            <h2>
                                Products
                            </h2>

                            <div className="admin-products">

                                {order.products.map(
                                    (product, index) => (

                                        <div
                                            className="admin-product"
                                            key={`${order._id}-${index}`}
                                        >

                                            <img
                                                src={product.image}
                                                alt={product.name}
                                            />

                                            <div className="admin-product-info">

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


                                            <div className="admin-product-price">

                                                ₹
                                                {(
                                                    product.price *
                                                    product.quantity
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>


                        {/* DELIVERY */}

                        <div className="admin-order-section">

                            <h2>
                                Delivery Address
                            </h2>

                            <div className="admin-delivery">

                                <p>
                                    <strong>
                                        {
                                            order.deliveryAddress
                                                ?.fullName
                                        }
                                    </strong>
                                </p>

                                <p>
                                    {
                                        order.deliveryAddress
                                            ?.address
                                    }
                                </p>

                                <p>
                                    {
                                        order.deliveryAddress
                                            ?.city
                                    }
                                    ,{" "}
                                    {
                                        order.deliveryAddress
                                            ?.state
                                    }{" "}
                                    {
                                        order.deliveryAddress
                                            ?.pincode
                                    }
                                </p>

                                <p>
                                    Mobile:{" "}
                                    {
                                        order.deliveryAddress
                                            ?.mobile
                                    }
                                </p>

                            </div>

                        </div>


                        {/* FOOTER */}

                        <div className="admin-order-footer">

                            <div className="admin-payment">

                                <span>
                                    Payment
                                </span>

                                <strong>
                                    {order.paymentMethod.toUpperCase()}
                                </strong>

                            </div>


                            <div className="admin-total">

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

                        </div>


                        {/* STATUS UPDATE */}

                        <div className="admin-status-update">

                            <label>
                                Update Order Status
                            </label>

                            <div className="admin-status-controls">

                                <select
                                    value={
                                        order.orderStatus
                                    }
                                    onChange={(e) =>
                                        handleStatusChange(
                                            order._id,
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        updatingOrderId ===
                                        order._id
                                    }
                                >

                                    <option value="Placed">
                                        Placed
                                    </option>

                                    <option value="Processing">
                                        Processing
                                    </option>

                                    <option value="Shipped">
                                        Shipped
                                    </option>

                                    <option value="Out for Delivery">
                                        Out for Delivery
                                    </option>

                                    <option value="Delivered">
                                        Delivered
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>

                                </select>


                                {updatingOrderId ===
                                    order._id && (

                                    <span>
                                        Updating...
                                    </span>

                                )}

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default AdminOrders;
