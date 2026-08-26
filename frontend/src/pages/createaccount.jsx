import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

import "../styles/createaccount.css";


function CreateAccount() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: ""
    });


    const [errors, setErrors] = useState({});


    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [acceptedTerms, setAcceptedTerms] =
        useState(false);

    const validateField = (name, value) => {

        let error = "";


        if (name === "name") {

            if (!value.trim()) {

                error = "Please enter your name";

            }
            else if (value.startsWith(" ")) {

                error = "Name cannot start with a space";

            }
            else if (value.endsWith(" ")) {

                error = "Name cannot end with a space";

            }
            else if (/\s{2,}/.test(value)) {

                error = "Please use only single spaces";

            }
            else if (!/^[A-Za-z ]+$/.test(value)) {

                error =
                    "Name should contain only letters";

            }
            else if (value.trim().length < 3) {

                error =
                    "Name must contain at least 3 characters";

            }

        }



        if (name === "email") {

            if (!value.trim()) {

                error = "Please enter your email";

            }
            else if (
                !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                    value
                )
            ) {

                error =
                    "Please enter a valid email";

            }

        }


        if (name === "mobile") {

            if (!value) {

                error =
                    "Please enter your mobile number";

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



        if (name === "password") {

            if (!value) {

                error =
                    "Please enter a password";

            }
            else if (value.length < 8) {

                error =
                    "Password must contain at least 8 characters";

            }
            else if (!/[A-Z]/.test(value)) {

                error =
                    "Password must contain at least one uppercase letter";

            }
            else if (!/[a-z]/.test(value)) {

                error =
                    "Password must contain at least one lowercase letter";

            }
            else if (!/[0-9]/.test(value)) {

                error =
                    "Password must contain at least one number";

            }
            else if (!/[@#$!%]/.test(value)) {

                error =
                    "Password must contain at least one special character (@ # $ ! %)";

            }

        }

        if (name === "confirmPassword") {

            if (!value) {

                error =
                    "Please confirm your password";

            }
            else if (
                value !== formData.password
            ) {

                error =
                    "Passwords do not match";

            }

        }


        return error;

    };


    const handleChange = (e) => {

    const { name, value } = e.target;

    let updatedValue = value;

    if (name === "name") {

        // If number or special character is typed
        if (/[^A-Za-z ]/.test(value)) {

            setErrors((current) => ({
                ...current,
                name: "Name should contain only letters"
            }));

            // Do NOT allow invalid character
            updatedValue = value.replace(
                /[^A-Za-z ]/g,
                ""
            );

        } else {

            updatedValue = value;

            // Validate while typing
            if (value.trim()) {

                if (value.startsWith(" ")) {

                    setErrors((current) => ({
                        ...current,
                        name: "Name cannot start with a space"
                    }));

                } else if (/\s{2,}/.test(value)) {

                    setErrors((current) => ({
                        ...current,
                        name: "Please use only single spaces"
                    }));

                } else if (value.trim().length < 3) {

                    setErrors((current) => ({
                        ...current,
                        name: "Name must contain at least 3 characters"
                    }));

                } else if (value.endsWith(" ")) {

                    setErrors((current) => ({
                        ...current,
                        name: "Name cannot end with a space"
                    }));

                } else {

                    setErrors((current) => ({
                        ...current,
                        name: ""
                    }));

                }

            } else {

                setErrors((current) => ({
                    ...current,
                    name: ""
                }));

            }

        }

    }


    else if (name === "email") {

        updatedValue = value;

        if (value.trim()) {

            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(value)) {

                setErrors((current) => ({
                    ...current,
                    email: "Please enter a valid email"
                }));

            } else {

                setErrors((current) => ({
                    ...current,
                    email: ""
                }));

            }

        } else {

            setErrors((current) => ({
                ...current,
                email: ""
            }));

        }

    }


    else if (name === "mobile") {

        updatedValue = value.replace(/\D/g, "");


        if (updatedValue.length > 10) {

            // Keep only first 10 digits
            updatedValue =
                updatedValue.slice(0, 10);

            setErrors((current) => ({
                ...current,
                mobile:
                    "Mobile number must contain only 10 digits"
            }));

        }

        else if (
            updatedValue.length > 0 &&
            !/^[6-9]/.test(updatedValue)
        ) {

            setErrors((current) => ({
                ...current,
                mobile:
                    "Mobile number must start with 6, 7, 8 or 9"
            }));

        }

        else if (
            updatedValue.length === 10 &&
            /^[6-9]0{9}$/.test(updatedValue)
        ) {

            setErrors((current) => ({
                ...current,
                mobile:
                    "Please enter a valid mobile number"
            }));

        }

        // Less than 10 digits
        else if (
            updatedValue.length > 0 &&
            updatedValue.length < 10
        ) {

            setErrors((current) => ({
                ...current,
                mobile:
                    "Mobile number must contain 10 digits"
            }));

        }

        else {

            setErrors((current) => ({
                ...current,
                mobile: ""
            }));

        }

    }

    else if (name === "password") {

        updatedValue = value;

        if (value.length > 0) {

            const passwordRegex =
                /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$!%]).{8,}$/;

            if (!passwordRegex.test(value)) {

                setErrors((current) => ({
                    ...current,
                    password:
                        "Password must contain 8+ characters, uppercase, lowercase, number and special character"
                }));

            } else {

                setErrors((current) => ({
                    ...current,
                    password: ""
                }));

            }

        } else {

            setErrors((current) => ({
                ...current,
                password: ""
            }));

        }

    }



    else if (name === "confirmPassword") {

        updatedValue = value;

        if (value.length > 0) {

            if (value !== formData.password) {

                setErrors((current) => ({
                    ...current,
                    confirmPassword:
                        "Passwords do not match"
                }));

            } else {

                setErrors((current) => ({
                    ...current,
                    confirmPassword: ""
                }));

            }

        } else {

            setErrors((current) => ({
                ...current,
                confirmPassword: ""
            }));

        }

    }


    setFormData((current) => ({
        ...current,
        [name]: updatedValue
    }));

};


    const handleBlur = (e) => {

        const {
            name,
            value
        } = e.target;


        const error =
            validateField(
                name,
                value
            );


        setErrors((current) => ({
            ...current,
            [name]: error
        }));

    };



    const handleSubmit = async (e) => {

        e.preventDefault();


        const newErrors = {};


        // Validate all fields
        Object.entries(formData).forEach(
            ([name, value]) => {

                const error =
                    validateField(
                        name,
                        value
                    );


                if (error) {

                    newErrors[name] = error;

                }

            }
        );


        // Terms validation
        if (!acceptedTerms) {

            newErrors.terms =
                "Please accept the terms and conditions";

        }


        setErrors(newErrors);


        if (Object.keys(newErrors).length !== 0) {

            return;

        }


        try {

            const response =
                await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            name: formData.name,
                            email: formData.email,
                            mobile: formData.mobile,
                            password: formData.password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                if (
                    data.message ===
                    "Email is already registered"
                ) {

                    setErrors({
                        email:
                            "Email is already registered"
                    });

                }
                else if (
                    data.message ===
                    "Mobile number already exists"
                ) {

                    setErrors({
                        mobile:
                            "Mobile number already exists"
                    });

                }
                else {

                    console.error(
                        data.message
                    );

                }


                return;

            }


            console.log(
                data.message
            );


            navigate("/login");


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

        }

    };


    return (

        <div className="create-account-page">


            <button
                className="create-back-btn"
                onClick={() =>
                    navigate("/login")
                }
            >

                <FiArrowLeft />

                Back to Login

            </button>


            <div className="create-account-container">


                <div className="create-account-header">

                    <h1>
                        Create Account
                    </h1>

                    <p>
                        Join us and start shopping
                    </p>

                </div>


                <form
                    className="create-account-form"
                    onSubmit={handleSubmit}
                >


                    {/* NAME */}

                    <div className="create-field">

                        <label>
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.name
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.name && (

                            <span className="create-error">

                                {errors.name}

                            </span>

                        )}

                    </div>


                    {/* EMAIL */}

                    <div className="create-field">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="text"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={
                                errors.email
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.email && (

                            <span className="create-error">

                                {errors.email}

                            </span>

                        )}

                    </div>


                    {/* MOBILE */}

                    <div className="create-field">

                        <label>
                            Mobile Number
                        </label>

                        <input
                            type="text"
                            name="mobile"
                            placeholder="Enter 10-digit mobile number"
                            value={formData.mobile}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength="10"
                            inputMode="numeric"
                            className={
                                errors.mobile
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.mobile && (

                            <span className="create-error">

                                {errors.mobile}

                            </span>

                        )}

                    </div>


                    {/* PASSWORD */}

                    <div className="create-field">

                        <label>
                            Password
                        </label>

                        <div className="create-password-wrapper">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.password
                                        ? "input-error"
                                        : ""
                                }
                            />

                            <button
                                type="button"
                                className="create-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >

                                {showPassword ? (
                                    <FiEyeOff />
                                ) : (
                                    <FiEye />
                                )}

                            </button>

                        </div>

                        {errors.password && (

                            <span className="create-error">

                                {errors.password}

                            </span>

                        )}

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="create-field">

                        <label>
                            Confirm Password
                        </label>

                        <div className="create-password-wrapper">

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.confirmPassword
                                        ? "input-error"
                                        : ""
                                }
                            />

                            <button
                                type="button"
                                className="create-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >

                                {showConfirmPassword ? (
                                    <FiEyeOff />
                                ) : (
                                    <FiEye />
                                )}

                            </button>

                        </div>

                        {errors.confirmPassword && (

                            <span className="create-error">

                                {errors.confirmPassword}

                            </span>

                        )}

                    </div>


                    {/* TERMS */}

                    <div className="terms-section">

                        <label className="terms-label">

                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => {

                                    setAcceptedTerms(
                                        e.target.checked
                                    );

                                    setErrors((current) => ({
                                        ...current,
                                        terms: ""
                                    }));

                                }}
                            />

                            <span>
                                I agree to the Terms & Conditions
                            </span>

                        </label>


                        {errors.terms && (

                            <span className="create-error">

                                {errors.terms}

                            </span>

                        )}

                    </div>


                    <button
                        type="submit"
                        className="create-account-submit"
                    >

                        Create Account

                    </button>


                </form>


                <div className="already-account">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        onClick={() =>
                            navigate("/login")
                        }
                    >

                        Login

                    </button>

                </div>


            </div>

        </div>

    );

}


export default CreateAccount;

