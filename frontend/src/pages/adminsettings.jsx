import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiSettings,
    FiUser,
    FiLock,
    FiSave,
    FiLogOut
} from "react-icons/fi";

import { useAuth } from "../context/authContext.jsx";

import "../styles/adminsettings.css";


function AdminSettings() {

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        mobile: user?.mobile || ""
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [error, setError] = useState("");


    const handleProfileChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setProfileData((current) => ({
            ...current,
            [name]: value
        }));

        setProfileMessage("");
        setError("");

    };


    const handlePasswordChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setPasswordData((current) => ({
            ...current,
            [name]: value
        }));

        setPasswordMessage("");
        setError("");

    };


    const handleProfileSubmit = async (e) => {

        e.preventDefault();

        setProfileMessage("");
        setError("");

        try {

            const token =
                localStorage.getItem("token");

            const response =
                await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/user/admin/profile",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            name: profileData.name,
                            mobile: profileData.mobile
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update profile"
                );

            }


            setProfileMessage(
                "Profile updated successfully."
            );


        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            setError(
                error.message ||
                "Failed to update profile"
            );

        }

    };


    const handlePasswordSubmit = async (e) => {

        e.preventDefault();

        setPasswordMessage("");
        setError("");


        if (
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
        ) {

            setError(
                "Please fill in all password fields."
            );

            return;

        }


        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {

            setError(
                "New password and confirm password do not match."
            );

            return;

        }


        if (passwordData.newPassword.length < 8) {

            setError(
                "New password must contain at least 8 characters."
            );

            return;

        }


        try {

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/user/admin/change-password",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            currentPassword:
                                passwordData.currentPassword,

                            newPassword:
                                passwordData.newPassword
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to change password"
                );

            }


            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });


            setPasswordMessage(
                "Password changed successfully."
            );


        } catch (error) {

            console.error(
                "Password change error:",
                error
            );

            setError(
                error.message ||
                "Failed to change password"
            );

        }

    };


    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    return (

        <div className="admin-settings-page">


            {/* PAGE HEADING */}

            <div className="admin-settings-heading">

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
                        Settings
                    </h1>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="admin-settings-error">

                    {error}

                </div>

            )}


            {/* SETTINGS CONTENT */}

            <div className="admin-settings-layout">


                {/* PROFILE */}

                <section className="admin-settings-card">


                    <div className="admin-settings-card-heading">

                        <div className="admin-settings-icon">

                            <FiUser />

                        </div>


                        <div>

                            <p>
                                ADMIN ACCOUNT
                            </p>

                            <h2>
                                Profile Information
                            </h2>

                        </div>

                    </div>


                    <form
                        onSubmit={handleProfileSubmit}
                        className="admin-settings-form"
                    >


                        <div className="admin-settings-field">

                            <label>
                                Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleProfileChange}
                                placeholder="Enter admin name"
                                required
                            />

                        </div>


                        <div className="admin-settings-field">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                readOnly
                            />

                            <small>
                                Email cannot be changed from settings.
                            </small>

                        </div>


                        <div className="admin-settings-field">

                            <label>
                                Mobile Number
                            </label>

                            <input
                                type="text"
                                name="mobile"
                                value={profileData.mobile}
                                onChange={handleProfileChange}
                                placeholder="Enter mobile number"
                            />

                        </div>


                        {profileMessage && (

                            <p className="admin-settings-success">

                                {profileMessage}

                            </p>

                        )}


                        <button
                            type="submit"
                            className="admin-settings-save-btn"
                        >

                            <FiSave />

                            Save Profile

                        </button>


                    </form>

                </section>


                {/* PASSWORD */}

                <section className="admin-settings-card">


                    <div className="admin-settings-card-heading">

                        <div className="admin-settings-icon">

                            <FiLock />

                        </div>


                        <div>

                            <p>
                                SECURITY
                            </p>

                            <h2>
                                Change Password
                            </h2>

                        </div>

                    </div>


                    <form
                        onSubmit={handlePasswordSubmit}
                        className="admin-settings-form"
                    >


                        <div className="admin-settings-field">

                            <label>
                                Current Password
                            </label>

                            <input
                                type="password"
                                name="currentPassword"
                                value={
                                    passwordData.currentPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="Enter current password"
                                required
                            />

                        </div>


                        <div className="admin-settings-field">

                            <label>
                                New Password
                            </label>

                            <input
                                type="password"
                                name="newPassword"
                                value={
                                    passwordData.newPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="Enter new password"
                                required
                            />

                        </div>


                        <div className="admin-settings-field">

                            <label>
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                value={
                                    passwordData.confirmPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                placeholder="Confirm new password"
                                required
                            />

                        </div>


                        {passwordMessage && (

                            <p className="admin-settings-success">

                                {passwordMessage}

                            </p>

                        )}


                        <button
                            type="submit"
                            className="admin-settings-save-btn"
                        >

                            <FiLock />

                            Change Password

                        </button>


                    </form>

                </section>


                {/* STORE INFORMATION */}

                <section className="admin-settings-card">


                    <div className="admin-settings-card-heading">

                        <div className="admin-settings-icon">

                            <FiSettings />

                        </div>


                        <div>

                            <p>
                                STORE
                            </p>

                            <h2>
                                Store Information
                            </h2>

                        </div>

                    </div>


                    <div className="admin-store-info">


                        <div>

                            <span>
                                Store Name
                            </span>

                            <strong>
                                VELORA
                            </strong>

                        </div>


                        <div>

                            <span>
                                Tagline
                            </span>

                            <strong>
                                Your Style, Your Story
                            </strong>

                        </div>


                        <div>

                            <span>
                                Store Type
                            </span>

                            <strong>
                                Fashion & Lifestyle
                            </strong>

                        </div>


                        <div>

                            <span>
                                Platform
                            </span>

                            <strong>
                                MERN E-Commerce
                            </strong>

                        </div>


                    </div>

                </section>


                {/* LOGOUT */}

                <section className="admin-settings-card admin-danger-card">


                    <div className="admin-settings-card-heading">

                        <div className="admin-settings-icon">

                            <FiLogOut />

                        </div>


                        <div>

                            <p>
                                ACCOUNT
                            </p>

                            <h2>
                                Logout
                            </h2>

                        </div>

                    </div>


                    <p className="admin-logout-text">

                        Sign out from the VELORA administrator
                        account on this device.

                    </p>


                    <button
                        type="button"
                        className="admin-settings-logout-btn"
                        onClick={handleLogout}
                    >

                        <FiLogOut />

                        Logout

                    </button>


                </section>


            </div>

        </div>

    );

}


export default AdminSettings;