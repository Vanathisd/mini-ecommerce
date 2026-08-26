import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

import { useAuth } from "../context/authContext.jsx";

import "../styles/login.css";

function Login() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});

    const [showPassword, setShowPassword] = useState(false);


    const validateField = (name, value) => {

        let error = "";


        // EMAIL VALIDATION
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


        // PASSWORD VALIDATION
        if (name === "password") {

            if (!value.trim()) {

                error = "Please enter your password";

            }

        }


        return error;

    };


    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        let updatedValue = value;


        // EMAIL
        if (name === "email") {

            updatedValue = value;


            if (value.trim()) {

                const emailRegex =
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


                if (!emailRegex.test(value)) {

                    setErrors((current) => ({
                        ...current,
                        email: "Please enter a valid email"
                    }));

                }
                else {

                    setErrors((current) => ({
                        ...current,
                        email: ""
                    }));

                }

            }
            else {

                setErrors((current) => ({
                    ...current,
                    email: ""
                }));

            }

        }


        // PASSWORD
        else if (name === "password") {

            updatedValue = value;


            if (value.length > 0) {

                setErrors((current) => ({
                    ...current,
                    password: ""
                }));

            }
            else {

                setErrors((current) => ({
                    ...current,
                    password: ""
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


        const error = validateField(
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


        // Validate email
        const emailError =
            validateField(
                "email",
                formData.email
            );


        if (emailError) {

            newErrors.email = emailError;

        }


        // Validate password
        const passwordError =
            validateField(
                "password",
                formData.password
            );


        if (passwordError) {

            newErrors.password = passwordError;

        }


        setErrors(newErrors);


        // Stop if validation failed
        if (Object.keys(newErrors).length !== 0) {

            return;

        }


        try {

            const response = await fetch(
                "http://localhost:5000/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

    if (data.field === "email") {

        setErrors({
            email: data.message
        });

    }
    else if (data.field === "password") {

        setErrors({
            password: data.message
        });

    }
    else {

        setErrors({
            email: data.message
        });

    }

    return;
}


            login(
                data.user,
                data.token
            );



            if (data.user.role === "admin") {

                navigate("/admin");

            }
            else {

                navigate("/");

            }


        }
        catch (error) {

            console.error(
                "Login error:",
                error
            );


            setErrors({
                email:
                    "Unable to connect to server"
            });

        }

    };


    return (

        <div className="login-page">


            {/* BACK BUTTON */}

            <button
                type="button"
                className="login-back-btn"
                onClick={() => navigate("/")}
            >

                <FiArrowLeft />

                Back

            </button>


            <div className="login-container">


                {/* HEADER */}

                <div className="login-header">

                    <h1>
                        Welcome Back
                    </h1>

                    <p>
                        Login to continue shopping with us
                    </p>

                </div>


                {/* LOGIN FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >


                    {/* EMAIL */}

                    <div className="login-field">

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

                            <span className="login-error">

                                {errors.email}

                            </span>

                        )}

                    </div>


                    {/* PASSWORD */}

                    <div className="login-field">

                        <label>
                            Password
                        </label>


                        <div className="password-wrapper">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Enter your password"
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
                                className="password-toggle"
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


                        {errors.password && (

                            <span className="login-error">

                                {errors.password}

                            </span>

                        )}

                    </div>


                    {/* FORGOT PASSWORD */}

                    <div className="forgot-password">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/forgotpwd")
                            }
                        >
                            Forgot Password?
                        </button>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="login-submit-btn"
                    >
                        Login
                    </button>


                </form>


                {/* CREATE ACCOUNT */}

                <div className="login-divider">

                    <span>
                        Don't have an account?
                    </span>

                </div>


                <button
                    type="button"
                    className="create-account-btn"
                    onClick={() =>
                        navigate("/createaccount")
                    }
                >

                    Create Account

                </button>


            </div>

        </div>

    );

}


export default Login;