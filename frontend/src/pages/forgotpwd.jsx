import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiEye,
    FiEyeOff
} from "react-icons/fi";

import "../styles/forgotpwd.css";

function ForgotPassword() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    const validateField = (name, value) => {

        let error = "";

        if (name === "email") {

            if (!value.trim()) {

                error = "Please enter your email";

            }
            else if (
                !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                    value
                )
            ) {

                error = "Please enter a valid email";

            }

        }

        if (name === "newPassword") {

            if (!value) {

                error = "Please enter a new password";

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
                value !== formData.newPassword
            ) {

                error =
                    "Passwords do not match";

            }

        }


        return error;

    };



    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((current) => ({
            ...current,
            [name]: value
        }));



        if (value.trim()) {

            const error =
                validateField(
                    name,
                    value
                );

            setErrors((current) => ({
                ...current,
                [name]: error
            }));

        }
        else {

            setErrors((current) => ({
                ...current,
                [name]: ""
            }));

        }

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


        setErrors(newErrors);


        if (
            Object.keys(newErrors).length !== 0
        ) {

            return;

        }


        try {

            const response =
                await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/auth/reset-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email:
                                formData.email,

                            newPassword:
                                formData.newPassword
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                setErrors({
                    email:
                        data.message ||
                        "Unable to reset password"
                });

                return;

            }


            alert(
                "Password reset successfully. Please login."
            );


            navigate("/login");


        }
        catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            setErrors({
                email:
                    "Unable to connect to server"
            });

        }

    };


    return (

        <div className="forgot-password-page">


            <button
                type="button"
                className="forgot-back-btn"
                onClick={() =>
                    navigate("/login")
                }
            >

                <FiArrowLeft />

                Back to Login

            </button>


            <div className="forgot-password-container">


                <div className="forgot-password-header">

                    <h1>
                        Forgot Password?
                    </h1>

                    <p>
                        Reset your password and
                        continue shopping with us
                    </p>

                </div>


                <form
                    className="forgot-password-form"
                    onSubmit={handleSubmit}
                >


                    <div className="forgot-field">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="text"
                            name="email"
                            placeholder="Enter your registered email"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            onBlur={
                                handleBlur
                            }
                            className={
                                errors.email
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.email && (

                            <span className="forgot-error">

                                {errors.email}

                            </span>

                        )}

                    </div>


                    <div className="forgot-field">

                        <label>
                            New Password
                        </label>


                        <div className="forgot-password-wrapper">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="newPassword"
                                placeholder="Enter new password"
                                value={
                                    formData.newPassword
                                }
                                onChange={
                                    handleChange
                                }
                                onBlur={
                                    handleBlur
                                }
                                className={
                                    errors.newPassword
                                        ? "input-error"
                                        : ""
                                }
                            />


                            <button
                                type="button"
                                className="forgot-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >

                                {showPassword
                                    ? <FiEyeOff />
                                    : <FiEye />
                                }

                            </button>

                        </div>


                        {errors.newPassword && (

                            <span className="forgot-error">

                                {errors.newPassword}

                            </span>

                        )}

                    </div>


                    <div className="forgot-field">

                        <label>
                            Confirm Password
                        </label>


                        <div className="forgot-password-wrapper">

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={
                                    handleChange
                                }
                                onBlur={
                                    handleBlur
                                }
                                className={
                                    errors.confirmPassword
                                        ? "input-error"
                                        : ""
                                }
                            />


                            <button
                                type="button"
                                className="forgot-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >

                                {showConfirmPassword
                                    ? <FiEyeOff />
                                    : <FiEye />
                                }

                            </button>

                        </div>


                        {errors.confirmPassword && (

                            <span className="forgot-error">

                                {errors.confirmPassword}

                            </span>

                        )}

                    </div>



                    <button
                        type="submit"
                        className="reset-password-btn"
                    >

                        Reset Password

                    </button>


                </form>



                <div className="back-login-section">

                    <span>
                        Remember your password?
                    </span>

                    <button
                        type="button"
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


export default ForgotPassword;