import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiSearch,
    FiUser
} from "react-icons/fi";

import "../styles/adminusers.css";


function AdminUsers() {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("active");

    const [actionLoading, setActionLoading] =
        useState(null);



    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const token =
                    localStorage.getItem("token");


                const response = await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/user/admin/all",
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

                    setError(
                        data.message ||
                        "Failed to fetch users"
                    );

                    return;
                }


                setUsers(
                    data.users || []
                );


            } catch (error) {

                console.error(
                    "Fetch users error:",
                    error
                );

                setError(
                    "Unable to connect to server"
                );

            } finally {

                setLoading(false);

            }

        };


        fetchUsers();

    }, []);


    const filteredUsers = users

        // Active / Deleted tab
        .filter((user) =>
            activeTab === "active"
                ? !user.isDeleted
                : user.isDeleted
        )

        // Search
        .filter((user) => {

            const searchText =
                search.toLowerCase().trim();


            return (

                user.name
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                user.email
                    ?.toLowerCase()
                    .includes(searchText)

                ||

                user.mobile
                    ?.toLowerCase()
                    .includes(searchText)

            );

        });


    const handleSoftDelete = async (userId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to deactivate this user?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setActionLoading(userId);

            setError("");


            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `https://mini-ecommerce-backend-yxii.onrender.com/user/admin/${userId}/soft-delete`,
                {
                    method: "PATCH",

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
                    "Failed to deactivate user"
                );

            }


            // Update UI
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? {
                            ...user,
                            isDeleted: true
                        }
                        : user
                )
            );


        } catch (error) {

            console.error(
                "Soft delete error:",
                error
            );

            setError(error.message);

        } finally {

            setActionLoading(null);

        }

    };


    const handleRestore = async (userId) => {

        try {

            setActionLoading(userId);

            setError("");


            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `https://mini-ecommerce-backend-yxii.onrender.com/user/admin/${userId}/restore`,
                {
                    method: "PATCH",

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
                    "Failed to restore user"
                );

            }


            // Update UI
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? {
                            ...user,
                            isDeleted: false
                        }
                        : user
                )
            );


        } catch (error) {

            console.error(
                "Restore error:",
                error
            );

            setError(error.message);

        } finally {

            setActionLoading(null);

        }

    };


    const handlePermanentDelete =
        async (userId) => {

            const confirmed =
                window.confirm(
                    "This will permanently delete the user from the database. This action cannot be undone. Continue?"
                );


            if (!confirmed) {
                return;
            }


            try {

                setActionLoading(userId);

                setError("");


                const token =
                    localStorage.getItem("token");


                const response = await fetch(
                    `https://mini-ecommerce-backend-yxii.onrender.com/user/admin/${userId}/permanent`,
                    {
                        method: "DELETE",

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
                        "Failed to permanently delete user"
                    );

                }


                // Remove from UI completely
                setUsers((currentUsers) =>
                    currentUsers.filter(
                        (user) =>
                            user._id !== userId
                    )
                );


            } catch (error) {

                console.error(
                    "Permanent delete error:",
                    error
                );

                setError(error.message);

            } finally {

                setActionLoading(null);

            }

        };


    return (

        <div className="admin-users-page">


            {/* BACK BUTTON */}

            <button
                className="admin-users-back-btn"
                onClick={() =>
                    navigate("/admin")
                }
            >

                <FiArrowLeft />

                Back to Dashboard

            </button>


            {/* HEADING */}

            <div className="admin-users-heading">

                <div>

                    <p>
                        VELORA ADMIN
                    </p>

                    <h1>
                        User Management
                    </h1>

                </div>

                <span>
                    {users.length} Users
                </span>

            </div>


            {/* SEARCH */}

            <div className="admin-users-toolbar">

                <div className="admin-users-search">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search by name, email or mobile..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

            </div>


            {/* TABS */}

            <div className="admin-users-tabs">

                <button
                    className={
                        activeTab === "active"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("active")
                    }
                >
                    Active Users
                </button>


                <button
                    className={
                        activeTab === "deleted"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActiveTab("deleted")
                    }
                >
                    Deleted Users
                </button>

            </div>


            {/* ERROR */}

            {error && (

                <p className="admin-users-error">
                    {error}
                </p>

            )}


            {/* LOADING */}

            {loading && (

                <div className="admin-users-message">

                    <p>
                        Loading users...
                    </p>

                </div>

            )}


            {/* NO USERS */}

            {!loading &&
                !error &&
                filteredUsers.length === 0 && (

                    <div className="admin-users-message">

                        <FiUser />

                        <h3>
                            No users found
                        </h3>

                        <p>

                            {activeTab === "active"
                                ? "No active users match your search."
                                : "No deleted users match your search."
                            }

                        </p>

                    </div>

                )}


            {/* USERS TABLE */}

            {!loading &&
                filteredUsers.length > 0 && (

                    <div className="admin-users-table">


                        {/* TABLE HEADER */}

                        <div className="admin-users-table-header">

                            <span>
                                User
                            </span>

                            <span>
                                Email
                            </span>

                            <span>
                                Mobile
                            </span>

                            <span>
                                Role
                            </span>

                            <span>
                                Registered
                            </span>

                            <span>
                                Actions
                            </span>

                        </div>


                        {/* USERS */}

                        {filteredUsers.map(
                            (user) => (

                                <div
                                    className="admin-user-row"
                                    key={user._id}
                                >


                                    {/* USER */}

                                    <div className="admin-user-info">

                                        <div className="admin-user-avatar">

                                            {user.name
                                                ?.charAt(0)
                                                .toUpperCase()}

                                        </div>

                                        <div>

                                            <strong>
                                                {user.name}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* EMAIL */}

                                    <span>
                                        {user.email}
                                    </span>


                                    {/* MOBILE */}

                                    <span>
                                        {user.mobile || "-"}
                                    </span>


                                    {/* ROLE */}

                                    <span
                                        className={
                                            user.role === "admin"
                                                ? "admin-role"
                                                : "user-role"
                                        }
                                    >

                                        {user.role}

                                    </span>


                                    {/* DATE */}

                                    <span>

                                        {user.createdAt
                                            ? new Date(
                                                user.createdAt
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )
                                            : "-"
                                        }

                                    </span>


                                    {/* ACTIONS */}

                                    <div className="admin-user-actions">


                                        {/* ACTIVE USER */}

                                        {activeTab === "active" && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSoftDelete(
                                                        user._id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    user._id ||
                                                    user.role ===
                                                    "admin"
                                                }
                                            >

                                                {actionLoading ===
                                                user._id
                                                    ? "Processing..."
                                                    : "Deactivate"}

                                            </button>

                                        )}


                                        {/* DELETED USER */}

                                        {activeTab === "deleted" && (

                                            <>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRestore(
                                                            user._id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        user._id
                                                    }
                                                >

                                                    {actionLoading ===
                                                    user._id
                                                        ? "Processing..."
                                                        : "Restore"}

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handlePermanentDelete(
                                                            user._id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        user._id
                                                    }
                                                >

                                                    {actionLoading ===
                                                    user._id
                                                        ? "Processing..."
                                                        : "Permanently Delete"}

                                                </button>

                                            </>

                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

        </div>

    );

}


export default AdminUsers;