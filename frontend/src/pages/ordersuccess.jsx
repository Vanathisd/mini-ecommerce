import { useNavigate } from "react-router-dom";

import {
    FiCheck,
    FiShoppingBag,
    FiArrowRight
} from "react-icons/fi";

import "../styles/ordersuccess.css";


function OrderSuccess() {

    const navigate = useNavigate();


    const orderId =
        "VEL" +
        Math.floor(
            100000 + Math.random() * 900000
        );


    return (

        <main className="order-success-page">



            <section className="order-success-card">


                {/* SUCCESS ICON */}

                <div className="success-icon">

                    <FiCheck />

                </div>



                {/* LABEL */}

                <p className="success-label">

                    ORDER CONFIRMED

                </p>



                {/* HEADING */}

                <h1>

                    Your Order Is
                    <span> Confirmed!</span>

                </h1>



                {/* MESSAGE */}

                <p className="success-message">

                    Thank you for shopping with Velora.
                    Your order has been placed successfully
                    and is being prepared for delivery.

                </p>



                {/* ORDER ID */}

                <div className="order-id-box">

                    <p>
                        ORDER ID
                    </p>

                    <strong>
                        #{orderId}
                    </strong>

                </div>



                {/* DELIVERY MESSAGE */}

                <div className="delivery-message">

                    <FiShoppingBag />

                    <div>

                        <strong>
                            Your order is on its way
                        </strong>

                        <span>
                            You will receive your order
                            within 3-5 business days.
                        </span>

                    </div>

                </div>



                {/* BUTTONS */}

                <div className="success-actions">


                    <button
                        type="button"
                        className="continue-shopping-btn"
                        onClick={() =>
                            navigate("/shop")
                        }
                    >

                        <FiShoppingBag />

                        Continue Shopping

                    </button>



                    <button
                        type="button"
                        className="home-btn"
                        onClick={() =>
                            navigate("/")
                        }
                    >

                        Back to Home

                        <FiArrowRight />

                    </button>


                </div>


            </section>


        </main>

    );

}


export default OrderSuccess;