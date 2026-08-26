import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiMinus,
    FiPlus,
    FiTrash2,
    FiShoppingBag
} from "react-icons/fi";

import { useCart } from "../context/CartContext.jsx";

import "../styles/cart.css";


function Cart() {

    const navigate = useNavigate();


    const {
        cart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        cartTotal
    } = useCart();


    // EMPTY CART
    if (cart.length === 0) {

        return (

            <main className="cart-page">

                <div className="empty-cart">

                    <FiShoppingBag
                        className="empty-cart-icon"
                    />

                    <p className="cart-label">
                        YOUR SHOPPING BAG
                    </p>

                    <h1>
                        Your Cart Is <span>Empty</span>
                    </h1>

                    <p>
                        Looks like you haven't added
                        anything to your cart yet.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/shop")
                        }
                    >
                        Continue Shopping
                    </button>

                </div>

            </main>

        );

    }


    return (

        <main className="cart-page">


            {/* BACK */}

            <button
                className="cart-back-btn"
                onClick={() =>
                    navigate(-1)
                }
            >

                <FiArrowLeft />

                Continue Shopping

            </button>



            {/* HEADING */}

            <div className="cart-heading">

                <p className="cart-label">
                    YOUR SHOPPING BAG
                </p>

                <h1>
                    Your <span>Cart</span>
                </h1>

                <p>
                    {cart.length} product
                    {cart.length > 1
                        ? "s"
                        : ""} in your bag
                </p>

            </div>



            {/* CART CONTENT */}

            <section className="cart-layout">


                {/* PRODUCTS */}

                <div className="cart-products">

                    {cart.map((item) => (

                        <div
                            className="cart-item"
                            key={
                                item._id ||
                                item.id
                            }
                        >


                            {/* IMAGE */}

                            <div className="cart-item-image">

                                <img
                                    src={
                                        item.image?.startsWith(
                                            "/uploads"
                                        )
                                            ? `http://localhost:5000${item.image}`
                                            : item.image
                                    }
                                    alt={item.name}
                                />

                            </div>



                            {/* DETAILS */}

                            <div className="cart-item-details">

                                <p className="cart-item-category">

                                    {item.category}

                                    {" · "}

                                    {item.subcategory}

                                </p>


                                <h2>
                                    {item.name}
                                </h2>


                                <p className="cart-item-price">

                                    ₹
                                    {Number(
                                        item.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                </p>



                                {/* QUANTITY */}

                                <div className="cart-quantity">

                                    <button
                                        onClick={() =>
                                            decreaseQuantity(
                                                item._id ||
                                                item.id
                                            )
                                        }
                                    >

                                        <FiMinus />

                                    </button>


                                    <span>
                                        {item.quantity}
                                    </span>


                                    <button
                                        onClick={() =>
                                            increaseQuantity(
                                                item._id ||
                                                item.id
                                            )
                                        }
                                    >

                                        <FiPlus />

                                    </button>

                                </div>

                            </div>



                            {/* REMOVE */}

                            <button
                                className="cart-remove-btn"
                                onClick={() =>
                                    removeFromCart(
                                        item._id ||
                                        item.id
                                    )
                                }
                            >

                                <FiTrash2 />

                            </button>

                        </div>

                    ))}

                </div>



                {/* ORDER SUMMARY */}

                <aside className="cart-summary">

                    <p className="summary-label">
                        ORDER SUMMARY
                    </p>

                    <h2>
                        Summary
                    </h2>



                    <div className="summary-row">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹
                            {cartTotal.toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                    </div>



                    <div className="summary-row">

                        <span>
                            Delivery
                        </span>

                        <strong>
                            FREE
                        </strong>

                    </div>



                    <div className="summary-divider"></div>



                    <div className="summary-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            ₹
                            {cartTotal.toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                    </div>



                    <button
                        className="checkout-btn"
                        onClick={() =>
                            navigate("/checkout")
                        }
                    >
                        Proceed to Checkout
                    </button>

                </aside>

            </section>

        </main>

    );

}


export default Cart;