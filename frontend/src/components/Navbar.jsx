import {
    FaHome,
    FaShoppingBag,
    FaInfoCircle,
    FaShoppingCart,
    FaUser,
    FaUserPlus,
    FaSearch,
} from "react-icons/fa";

import {
    FiHeadphones,
    FiPackage,
    FiLogOut,
} from "react-icons/fi";

import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/authContext.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";


function Navbar() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [products, setProducts] = useState([]);


    const { cart } = useCart();

    const { user, logout } = useAuth();


    // ==========================================
    // FETCH PRODUCTS FROM MONGODB
    // ==========================================

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response =
                    await fetch(
                        "http://localhost:5000/products"
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to fetch products"
                    );

                }


                setProducts(data);


            } catch (error) {

                console.error(
                    "Error fetching products:",
                    error
                );

            }

        };


        fetchProducts();

    }, []);


    // ==========================================
    // FILTER SEARCH RESULTS
    // ==========================================

    const filteredProducts =
        search.trim()
            ? products.filter((product) => {

                const value =
                    search
                        .toLowerCase()
                        .trim();


                return (

                    product.name
                        ?.toLowerCase()
                        .includes(value) ||

                    product.category
                        ?.toLowerCase()
                        .includes(value) ||

                    product.subcategory
                        ?.toLowerCase()
                        .includes(value) ||

                    product.description
                        ?.toLowerCase()
                        .includes(value)

                );

            })
            : [];


    // ==========================================
    // GET PRODUCT IMAGE
    // ==========================================

    const getProductImage = (image) => {

        if (!image) {
            return "";
        }


        if (image.startsWith("/uploads")) {

            return `http://localhost:5000${image}`;

        }


        return image;

    };


    // ==========================================
    // HANDLE SEARCH
    // ==========================================

    const handleSearch = (e) => {

        const value =
            e.target.value;


        setSearch(value);

    };


    // ==========================================
    // HANDLE ENTER
    // ==========================================

    const handleSearchKeyDown = (e) => {

        if (e.key === "Enter") {

            if (
                filteredProducts.length > 0
            ) {

                const firstProduct =
                    filteredProducts[0];


                navigate(
                    `/product/${firstProduct._id}`
                );


                setSearch("");

            }

        }

    };


    // ==========================================
    // OPEN PRODUCT
    // ==========================================

    const handleProductClick =
        (productId) => {

            navigate(
                `/product/${productId}`
            );

            setSearch("");

        };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        logout();

        navigate("/");

    };


    return (

        <nav className="navbar">

            {/* ==================================
                BRAND
            ================================== */}

            <div className="brand">

                <div className="logo">
                    VELORA
                </div>

                <div className="tagline">
                    Your Style, Your Story
                </div>

            </div>


            {/* ==================================
                SEARCH
            ================================== */}

            <div className="search-box">

                <FaSearch />


                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={handleSearch}
                    onKeyDown={handleSearchKeyDown}
                />


                {/* SEARCH RESULTS */}

                {search.trim() && (

                    <div className="search-results">

                        {filteredProducts.length > 0 ? (

                            filteredProducts.map(
                                (product) => (

                                    <div
                                        className="search-result-item"
                                        key={product._id}
                                        onClick={() =>
                                            handleProductClick(
                                                product._id
                                            )
                                        }
                                    >

                                        {/* PRODUCT IMAGE */}

                                        <img
                                            src={getProductImage(
                                                product.image
                                            )}
                                            alt={product.name}
                                        />


                                        {/* PRODUCT DETAILS */}

                                        <div className="search-result-info">

                                            <h4>
                                                {product.name}
                                            </h4>


                                            <p>

                                                {product.category}

                                                {" · "}

                                                {product.subcategory}

                                            </p>


                                            <strong>

                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>

                                        </div>

                                    </div>

                                )
                            )

                        ) : (

                            <div className="search-no-results">

                                No products found.

                            </div>

                        )}

                    </div>

                )}

            </div>


            {/* ==================================
                NAVIGATION ICONS
            ================================== */}

            <div className="nav-icons">


                {/* HOME */}

                <button
                    type="button"
                    className="nav-icon"
                    onClick={() =>
                        navigate("/")
                    }
                >

                    <FaHome />

                    <span className="tooltip">
                        Home
                    </span>

                </button>


                {/* SHOP */}

                <button
                    type="button"
                    className="nav-icon"
                    onClick={() =>
                        navigate("/shop")
                    }
                >

                    <FaShoppingBag />

                    <span className="tooltip">
                        Shop
                    </span>

                </button>


                {/* ABOUT */}

                <button
                    type="button"
                    className="nav-icon"
                    onClick={() =>
                        navigate("/about")
                    }
                >

                    <FaInfoCircle />

                    <span className="tooltip">
                        About
                    </span>

                </button>


                {/* SUPPORT */}

                <button
                    type="button"
                    className="nav-icon"
                    onClick={() =>
                        navigate("/support")
                    }
                >

                    <FiHeadphones />

                    <span className="tooltip">
                        Support
                    </span>

                </button>


                {/* CART */}

                <button
                    type="button"
                    className="nav-icon"
                    onClick={() =>
                        navigate("/cart")
                    }
                >

                    <FaShoppingCart />

                    {cart.length > 0 && (

                        <span className="nav-cart-count">
                            {cart.length}
                        </span>

                    )}

                    <span className="tooltip">
                        Cart
                    </span>

                </button>


                {/* ==================================
                    NOT LOGGED IN
                ================================== */}

                {!user && (

                    <>

                        {/* LOGIN */}

                        <button
                            type="button"
                            className="nav-icon"
                            onClick={() =>
                                navigate("/login")
                            }
                        >

                            <FaUser />

                            <span className="tooltip">
                                Login
                            </span>

                        </button>


                        {/* CREATE ACCOUNT */}

                        <button
                            type="button"
                            className="nav-icon"
                            onClick={() =>
                                navigate(
                                    "/createaccount"
                                )
                            }
                        >

                            <FaUserPlus />

                            <span className="tooltip">
                                Create Account
                            </span>

                        </button>

                    </>

                )}


                {/* ==================================
                    LOGGED IN
                ================================== */}

                {user && (

                    <>

                        {/* MY ORDERS */}

                        <button
                            type="button"
                            className="nav-icon"
                            onClick={() =>
                                navigate(
                                    "/myorders"
                                )
                            }
                        >

                            <FiPackage />

                            <span className="tooltip">
                                My Orders
                            </span>

                        </button>


                        {/* LOGOUT */}

                        <button
                            type="button"
                            className="nav-icon"
                            onClick={handleLogout}
                        >

                            <FiLogOut />

                            <span className="tooltip">
                                Logout
                            </span>

                        </button>

                    </>

                )}

            </div>

        </nav>

    );

}


export default Navbar;