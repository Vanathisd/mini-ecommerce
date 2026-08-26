import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext.jsx";

import {
    FiArrowLeft,
    FiMapPin,
    FiCreditCard,
    FiShoppingBag
} from "react-icons/fi";

import { useCart } from "../context/CartContext.jsx";

import "../styles/checkout.css";


function Checkout() {

    const navigate = useNavigate();


    const {
        cart,
        cartTotal
    } = useCart();


    const { user } = useAuth();


    const [formData, setFormData] = useState({

        fullName: "",
        mobile: "",
        address: "",
        country: "",
        state: "",
        district: "",
        city: "",
        pincode: ""

    });


    useEffect(() => {

        if (user) {

            setFormData((current) => ({

                ...current,

                fullName:
                    user.name || "",

                mobile:
                    user.mobile || ""

            }));

        }

    }, [user]);


    const [errors, setErrors] = useState({});


    const [paymentMethod, setPaymentMethod] =
        useState("upi");


    const [submitted, setSubmitted] =
        useState(false);



    // VALIDATE FIELD

    const validateField = (
        name,
        value,
        showRequired = false
    ) => {

        let error = "";


        // FULL NAME

        if (name === "fullName") {

            if (!value.trim()) {

                if (showRequired) {
                    error =
                        "Please fill out this field";
                }

            }

            else if (value.startsWith(" ")) {

                error =
                    "Name cannot start with a space";

            }

            else if (/\s{2,}/.test(value)) {

                error =
                    "Please use only single spaces";

            }

            else if (!/^[a-zA-Z ]*$/.test(value)) {

                error =
                    "Name should contain only letters";

            }

            else if (value.trim().length < 3) {

                error =
                    "Name must contain at least 3 characters";

            }

            else if (value.endsWith(" ")) {

                error =
                    "Name cannot end with a space";

            }

        }



        // MOBILE

        if (name === "mobile") {

            if (!value) {

                if (showRequired) {

                    error =
                        "Please fill out this field";

                }

            }

            else if (!/^\d+$/.test(value)) {

                error =
                    "Mobile number should contain only numbers";

            }

            else if (!/^[6-9]/.test(value)) {

                error =
                    "Mobile number must start with 6, 7, 8 or 9";

            }

            else if (value.length < 10) {

                error =
                    "Mobile number must contain 10 digits";

            }

            else if (
                value.length === 10 &&
                /^[6-9]0{9}$/.test(value)
            ) {

                error =
                    "Please enter a valid mobile number";

            }

        }



        // ADDRESS

        if (name === "address") {

            if (!value.trim()) {

                if (showRequired) {

                    error =
                        "Please fill out this field";

                }

            }

            else if (value.startsWith(" ")) {

                error =
                    "Address cannot start with a space";

            }

            else if (value.trim().length < 10) {

                error =
                    "Please enter a complete address";

            }

        }



        // COUNTRY

        if (name === "country") {

            if (!value && showRequired) {

                error =
                    "Please fill out this field";

            }

        }



        // STATE

        if (name === "state") {

            if (!value.trim()) {

                if (showRequired) {

                    error =
                        "Please fill out this field";

                }

            }

            else if (value.startsWith(" ")) {

                error =
                    "State cannot start with a space";

            }

            else if (!/^[a-zA-Z ]*$/.test(value)) {

                error =
                    "State should contain only letters";

            }

            else if (/\s{2,}/.test(value)) {

                error =
                    "Please use only single spaces";

            }

            else if (value.endsWith(" ")) {

                error =
                    "State cannot end with a space";

            }

        }



        // DISTRICT

        if (name === "district") {

            if (!value.trim()) {

                if (showRequired) {

                    error =
                        "Please fill out this field";

                }

            }

            else if (value.startsWith(" ")) {

                error =
                    "District cannot start with a space";

            }

            else if (!/^[a-zA-Z ]*$/.test(value)) {

                error =
                    "District should contain only letters";

            }

            else if (/\s{2,}/.test(value)) {

                error =
                    "Please use only single spaces";

            }

            else if (value.endsWith(" ")) {

                error =
                    "District cannot end with a space";

            }

        }



        // CITY

        if (name === "city") {

            if (!value.trim()) {

                if (showRequired) {

                    error =
                        "Please fill out this field";

                }

            }

            else if (value.startsWith(" ")) {

                error =
                    "City cannot start with a space";

            }

            else if (!/^[a-zA-Z ]*$/.test(value)) {

                error =
                    "City should contain only letters";

            }

            else if (/\s{2,}/.test(value)) {

                error =
                    "Please use only single spaces";

            }

            else if (value.endsWith(" ")) {

                error =
                    "City cannot end with a space";

            }

        }



        // PINCODE

        if (name === "pincode") {

            if (!value) {

                if (showRequired) {

                    error =
                        "Please fill out this field";

                }

            }

            else if (!/^\d+$/.test(value)) {

                error =
                    "Pincode should contain only numbers";

            }

            else if (value.length < 6) {

                error =
                    "Pincode must contain 6 digits";

            }

            else if (value.length > 6) {

                error =
                    "Pincode must contain only 6 digits";

            }

            else if (
                value.length === 6 &&
                value.startsWith("0")
            ) {

                error =
                    "Pincode cannot start with 0";

            }

        }


        setErrors((current) => ({

            ...current,

            [name]: error

        }));


        return error === "";

    };



    // HANDLE CHANGE

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        let updatedValue = value;



        // MOBILE

        if (name === "mobile") {

            updatedValue =
                value.replace(/\D/g, "");


            if (updatedValue.length > 10) {

                updatedValue =
                    updatedValue.slice(0, 10);


                setErrors((current) => ({

                    ...current,

                    mobile:
                        "Mobile number must contain only 10 digits"

                }));

            }

            else {

                validateField(
                    "mobile",
                    updatedValue,
                    submitted
                );

            }

        }



        // PINCODE

        else if (name === "pincode") {

            updatedValue =
                value.replace(/\D/g, "");


            if (updatedValue.length > 6) {

                updatedValue =
                    updatedValue.slice(0, 6);


                setErrors((current) => ({

                    ...current,

                    pincode:
                        "Pincode must contain only 6 digits"

                }));

            }

            else {

                validateField(
                    "pincode",
                    updatedValue,
                    submitted
                );

            }

        }



        // OTHER FIELDS

        else {

            updatedValue = value;


            if (name === "fullName") {

                if (/[^a-zA-Z ]/.test(value)) {

                    setErrors((current) => ({

                        ...current,

                        fullName:
                            "Name should contain only letters"

                    }));


                    updatedValue =
                        value.replace(
                            /[^a-zA-Z ]/g,
                            ""
                        );

                }

                else {

                    validateField(
                        name,
                        updatedValue,
                        submitted
                    );

                }

            }

            else {

                validateField(
                    name,
                    updatedValue,
                    submitted
                );

            }

        }


        setFormData((current) => ({

            ...current,

            [name]: updatedValue

        }));

    };



    // HANDLE BLUR

    const handleBlur = (e) => {

        const {
            name,
            value
        } = e.target;


        validateField(
            name,
            value,
            true
        );

    };



    // COUNTRY

    const handleCountryChange = (e) => {

        const value =
            e.target.value;


        setFormData((current) => ({

            ...current,

            country: value

        }));


        validateField(
            "country",
            value,
            true
        );

    };



    // VALIDATE FORM

    const validateForm = () => {

        let isValid = true;


        Object.entries(formData).forEach(
            ([name, value]) => {

                const valid =
                    validateField(
                        name,
                        value,
                        true
                    );


                if (!valid) {

                    isValid = false;

                }

            }
        );


        return isValid;

    };



    // PLACE ORDER

    const handlePlaceOrder = async (e) => {

        e.preventDefault();


        // LOGIN CHECK

        if (!user) {

            navigate("/login");

            return;

        }


        setSubmitted(true);


        const isValid =
            validateForm();


        if (!isValid) {

            return;

        }


        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                setErrors({

                    order:
                        "Session expired. Please login again."

                });

                navigate("/login");

                return;

            }



            // IMPORTANT:
            // MongoDB uses _id
            // Old frontend products use id

            const orderProducts =
                cart.map((item) => ({

                    productId:
                        item._id || item.id,

                    name:
                        item.name,

                    image:
                        item.image,

                    price:
                        Number(item.price),

                    quantity:
                        item.quantity

                }));



            console.log(
                "Products being sent:",
                orderProducts
            );

            console.log(
                "Token exists:",
                !!token
            );



            const response =
                await fetch(
                    "http://localhost:5000/orders/create",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                products:
                                    orderProducts,

                                deliveryAddress:
                                    formData,

                                paymentMethod:
                                    paymentMethod,

                                totalAmount:
                                    cartTotal

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(
                    "Order creation failed:",
                    data
                );


                setErrors({

                    order:
                        data.message ||
                        "Failed to place order"

                });

                return;

            }


            console.log(
                "Order created successfully:",
                data
            );


            navigate(
                "/ordersuccess"
            );

        }

        catch (error) {

            console.error(
                "Place order error:",
                error
            );


            setErrors({

                order:
                    "Unable to connect to server"

            });

        }

    };



    // LOGIN REQUIRED

    if (!user) {

        return (

            <main className="checkout-page">

                <div className="checkout-empty">

                    <FiShoppingBag />

                    <h2>
                        Login Required
                    </h2>

                    <p>
                        Please login or create
                        an account before
                        placing an order.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Login to Continue
                    </button>

                </div>

            </main>

        );

    }



    // EMPTY CART

    if (cart.length === 0) {

        return (

            <main className="checkout-page">

                <div className="checkout-empty">

                    <FiShoppingBag />

                    <h2>
                        Your Cart Is Empty
                    </h2>

                    <button
                        type="button"
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

        <main className="checkout-page">


            {/* BACK */}

            <button
                type="button"
                className="checkout-back-btn"
                onClick={() =>
                    navigate("/cart")
                }
            >

                <FiArrowLeft />

                Back to Cart

            </button>



            {/* HEADING */}

            <div className="checkout-heading">

                <p>
                    COMPLETE YOUR ORDER
                </p>

                <h1>
                    Checkout
                </h1>

                <span>
                    Enter your delivery details
                    and choose your preferred
                    payment method.
                </span>

            </div>



            <form
                className="checkout-layout"
                onSubmit={handlePlaceOrder}
            >


                <div className="checkout-left">


                    {/* DELIVERY */}

                    <section className="checkout-card">


                        <div className="checkout-card-heading">

                            <FiMapPin />

                            <div>

                                <p>
                                    DELIVERY
                                </p>

                                <h2>
                                    Delivery Address
                                </h2>

                            </div>

                        </div>



                        <div className="checkout-fields">


                            {/* FULL NAME */}

                            <div className="checkout-field full">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={
                                        formData.fullName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    placeholder="Enter your full name"
                                    required
                                    className={
                                        errors.fullName
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.fullName && (

                                    <small className="checkout-error">

                                        {errors.fullName}

                                    </small>

                                )}

                            </div>



                            {/* MOBILE */}

                            <div className="checkout-field">

                                <label>
                                    Mobile Number
                                </label>

                                <input
                                    type="text"
                                    name="mobile"
                                    value={
                                        formData.mobile
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    placeholder="Enter mobile number"
                                    required
                                    inputMode="numeric"
                                    maxLength="10"
                                    className={
                                        errors.mobile
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.mobile && (

                                    <small className="checkout-error">

                                        {errors.mobile}

                                    </small>

                                )}

                            </div>



                            {/* PINCODE */}

                            <div className="checkout-field">

                                <label>
                                    Pincode
                                </label>

                                <input
                                    type="text"
                                    name="pincode"
                                    value={
                                        formData.pincode
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    placeholder="Enter pincode"
                                    required
                                    inputMode="numeric"
                                    maxLength="6"
                                    className={
                                        errors.pincode
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.pincode && (

                                    <small className="checkout-error">

                                        {errors.pincode}

                                    </small>

                                )}

                            </div>



                            {/* ADDRESS */}

                            <div className="checkout-field full">

                                <label>
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={
                                        formData.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    placeholder="House / Street / Area"
                                    rows="3"
                                    required
                                    className={
                                        errors.address
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.address && (

                                    <small className="checkout-error">

                                        {errors.address}

                                    </small>

                                )}

                            </div>



                            {/* COUNTRY */}

                            <div className="checkout-field">

                                <label>
                                    Country
                                </label>

                                <select
                                    name="country"
                                    value={
                                        formData.country
                                    }
                                    onChange={
                                        handleCountryChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    required
                                    className={
                                        errors.country
                                            ? "input-error"
                                            : ""
                                    }
                                >

                                    <option value="">
                                        Select Country
                                    </option>

                                    <option value="India">
                                        India
                                    </option>

                                    <option value="United States">
                                        United States
                                    </option>

                                    <option value="United Kingdom">
                                        United Kingdom
                                    </option>

                                    <option value="Australia">
                                        Australia
                                    </option>

                                    <option value="Canada">
                                        Canada
                                    </option>

                                </select>

                                {errors.country && (

                                    <small className="checkout-error">

                                        {errors.country}

                                    </small>

                                )}

                            </div>



                            {/* STATE */}

                            <div className="checkout-field">

                                <label>
                                    State
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    value={
                                        formData.state
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    placeholder="Enter state"
                                    required
                                    className={
                                        errors.state
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.state && (

                                    <small className="checkout-error">

                                        {errors.state}

                                    </small>

                                )}

                            </div>



                            {/* DISTRICT */}

                            <div className="checkout-field">

                                <label>
                                    District
                                </label>

                                <input
                                    type="text"
                                    name="district"
                                    value={
                                        formData.district
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    placeholder="Enter district"
                                    required
                                    className={
                                        errors.district
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.district && (

                                    <small className="checkout-error">

                                        {errors.district}

                                    </small>

                                )}

                            </div>



                            {/* CITY */}

                            <div className="checkout-field">

                                <label>
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={
                                        formData.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    placeholder="Enter city"
                                    required
                                    className={
                                        errors.city
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.city && (

                                    <small className="checkout-error">

                                        {errors.city}

                                    </small>

                                )}

                            </div>


                        </div>

                    </section>



                    {/* PAYMENT */}

                    <section className="checkout-card">


                        <div className="checkout-card-heading">

                            <FiCreditCard />

                            <div>

                                <p>
                                    PAYMENT
                                </p>

                                <h2>
                                    Payment Method
                                </h2>

                            </div>

                        </div>



                        <div className="payment-options">


                            {/* UPI */}

                            <label
                                className={
                                    paymentMethod === "upi"
                                        ? "payment-option active"
                                        : "payment-option"
                                }
                            >

                                <input
                                    type="radio"
                                    name="payment"
                                    value="upi"
                                    checked={
                                        paymentMethod === "upi"
                                    }
                                    onChange={(e) =>
                                        setPaymentMethod(
                                            e.target.value
                                        )
                                    }
                                />

                                <div>

                                    <strong>
                                        UPI
                                    </strong>

                                    <span>
                                        Pay using UPI
                                    </span>

                                </div>

                            </label>



                            {/* CARD */}

                            <label
                                className={
                                    paymentMethod === "card"
                                        ? "payment-option active"
                                        : "payment-option"
                                }
                            >

                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={
                                        paymentMethod === "card"
                                    }
                                    onChange={(e) =>
                                        setPaymentMethod(
                                            e.target.value
                                        )
                                    }
                                />

                                <div>

                                    <strong>
                                        Credit / Debit Card
                                    </strong>

                                    <span>
                                        Enter card details
                                    </span>

                                </div>

                            </label>



                            {/* COD */}

                            <label
                                className={
                                    paymentMethod === "cod"
                                        ? "payment-option active"
                                        : "payment-option"
                                }
                            >

                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={
                                        paymentMethod === "cod"
                                    }
                                    onChange={(e) =>
                                        setPaymentMethod(
                                            e.target.value
                                        )
                                    }
                                />

                                <div>

                                    <strong>
                                        Cash on Delivery
                                    </strong>

                                    <span>
                                        Pay when your order arrives
                                    </span>

                                </div>

                            </label>


                        </div>

                    </section>


                </div>



                {/* ORDER SUMMARY */}

                <aside className="checkout-summary">


                    <p className="summary-label">
                        ORDER SUMMARY
                    </p>

                    <h2>
                        Your Order
                    </h2>



                    <div className="checkout-products">

                        {cart.map((item) => (

                            <div
                                className="checkout-product"
                                key={
                                    item._id ||
                                    item.id
                                }
                            >

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


                                <div>

                                    <h3>
                                        {item.name}
                                    </h3>

                                    <p>
                                        Qty:{" "}
                                        {item.quantity}
                                    </p>

                                </div>


                                <strong>

                                    ₹
                                    {(
                                        Number(
                                            item.price
                                        ) *
                                        item.quantity
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                </strong>

                            </div>

                        ))}

                    </div>



                    {/* SUBTOTAL */}

                    <div className="checkout-summary-row">

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



                    {/* DELIVERY */}

                    <div className="checkout-summary-row">

                        <span>
                            Delivery
                        </span>

                        <strong>
                            FREE
                        </strong>

                    </div>



                    <div className="checkout-divider"></div>



                    {/* TOTAL */}

                    <div className="checkout-total">

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



                    {/* ORDER ERROR */}

                    {errors.order && (

                        <small className="checkout-error">

                            {errors.order}

                        </small>

                    )}



                    {/* PLACE ORDER */}

                    <button
                        type="submit"
                        className="place-order-btn"
                    >
                        Place Order
                    </button>



                    <p className="checkout-note">

                        This is a demo checkout for the
                        mini e-commerce project.

                    </p>


                </aside>


            </form>


        </main>

    );

}


export default Checkout;