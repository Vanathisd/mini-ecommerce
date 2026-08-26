import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiLayers,
    FiPackage
} from "react-icons/fi";

import "../styles/admincategories.css";


function AdminCategories() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);


    const categoryStructure = {

        Women: [
            "Dresses",
            "Tops",
            "Ethnic Wear"
        ],

        Men: [
            "Shirts",
            "Jeans",
            "Jackets"
        ],

        Accessories: [
            "Watches",
            "Bags",
            "Sunglasses",
            "Wallets"
        ]

    };


    const categories = Object.keys(
        categoryStructure
    );



    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setLoading(true);
                setError("");


                const token =
                    localStorage.getItem("token");


                if (!token) {

                    throw new Error(
                        "Admin authentication token not found. Please login again."
                    );

                }


                const response =
                    await fetch(
                        `https://mini-ecommerce-backend-yxii.onrender.com/products/admin/all?t=${Date.now()}`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Cache-Control":
                                    "no-cache"
                            },

                            cache: "no-store"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to fetch products"
                    );

                }


                const productList =
                    Array.isArray(data)
                        ? data
                        : data.products || [];


                setProducts(productList);


            } catch (error) {

                console.error(
                    "Category fetch error:",
                    error
                );


                if (
                    error.name ===
                    "TypeError"
                ) {

                    setError(
                        "Unable to connect to the backend server. Make sure your Node.js server is running on port 5000."
                    );

                } else {

                    setError(
                        error.message ||
                        "Failed to load categories"
                    );

                }


            } finally {

                setLoading(false);

            }

        };


        fetchProducts();

    }, []);


    const activeProducts =
        products.filter(
            (product) =>
                !product.isDeleted
        );


    const getSubcategoryCount =
        (category, subcategory) => {

            return activeProducts.filter(
                (product) => {

                    const productCategory =
                        product.category
                            ?.trim()
                            .toLowerCase();

                    const productSubcategory =
                        product.subcategory
                            ?.trim()
                            .toLowerCase();


                    return (
                        productCategory ===
                            category
                                .toLowerCase() &&

                        productSubcategory ===
                            subcategory
                                .toLowerCase()
                    );

                }
            ).length;

        };


    const getCategoryCount =
        (category) => {

            return activeProducts.filter(
                (product) =>
                    product.category
                        ?.trim()
                        .toLowerCase() ===
                    category.toLowerCase()
            ).length;

        };


    const totalSubcategories =
        categories.reduce(
            (total, category) =>
                total +
                categoryStructure[
                    category
                ].length,
            0
        );



    return (

        <div className="admin-categories-page">


            {/* PAGE HEADING */}

            <div className="admin-categories-heading">

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
                        Categories
                    </h1>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <p className="admin-categories-error">
                    {error}
                </p>

            )}


            {/* SUMMARY */}

            {!loading && !error && (

                <section className="admin-category-summary">


                    {/* MAIN CATEGORIES */}

                    <div className="admin-category-summary-card">

                        <div className="admin-category-summary-icon">

                            <FiLayers />

                        </div>

                        <div>

                            <span>
                                Main Categories
                            </span>

                            <strong>
                                {categories.length}
                            </strong>

                        </div>

                    </div>


                    {/* SUBCATEGORIES */}

                    <div className="admin-category-summary-card">

                        <div className="admin-category-summary-icon">

                            <FiLayers />

                        </div>

                        <div>

                            <span>
                                Subcategories
                            </span>

                            <strong>
                                {totalSubcategories}
                            </strong>

                        </div>

                    </div>


                    {/* ACTIVE PRODUCTS */}

                    <div className="admin-category-summary-card">

                        <div className="admin-category-summary-icon">

                            <FiPackage />

                        </div>

                        <div>

                            <span>
                                Active Products
                            </span>

                            <strong>
                                {activeProducts.length}
                            </strong>

                        </div>

                    </div>


                </section>

            )}


            {/* CATEGORY LIST */}

            <section className="admin-category-list">


                <div className="admin-category-list-heading">

                    <div>

                        <p>
                            CATEGORY MANAGEMENT
                        </p>

                        <h2>
                            Product Categories
                        </h2>

                    </div>

                </div>


                {/* LOADING */}

                {loading ? (

                    <div className="admin-category-message">

                        Loading categories...

                    </div>


                ) : error ? (

                    <div className="admin-category-message">

                        Unable to load categories.

                    </div>


                ) : (

                    /* CATEGORY GRID */

                    <div className="admin-category-grid">


                        {categories.map(
                            (category) => {

                                const subcategories =
                                    categoryStructure[
                                        category
                                    ];


                                return (

                                    <div
                                        className="admin-category-card"
                                        key={category}
                                    >


                                        {/* MAIN CATEGORY */}

                                        <div className="admin-category-card-header">


                                            <div>

                                                <div className="admin-category-icon">

                                                    <FiLayers />

                                                </div>

                                            </div>


                                            <div>

                                                <span>
                                                    MAIN CATEGORY
                                                </span>

                                                <h3>
                                                    {category}
                                                </h3>

                                            </div>


                                            <strong>

                                                {
                                                    getCategoryCount(
                                                        category
                                                    )
                                                }

                                                {" "}
                                                Products

                                            </strong>


                                        </div>


                                        {/* SUBCATEGORIES */}

                                        <div className="admin-subcategory-section">


                                            <h4>
                                                Subcategories
                                            </h4>


                                            <div className="admin-subcategory-list">


                                                {subcategories.map(
                                                    (
                                                        subcategory
                                                    ) => {

                                                        const count =
                                                            getSubcategoryCount(
                                                                category,
                                                                subcategory
                                                            );


                                                        return (

                                                            <div
                                                                className="admin-subcategory-item"
                                                                key={
                                                                    subcategory
                                                                }
                                                            >

                                                                <span>
                                                                    {
                                                                        subcategory
                                                                    }
                                                                </span>


                                                                <strong>
                                                                    {
                                                                        count
                                                                    }
                                                                </strong>

                                                            </div>

                                                        );

                                                    }
                                                )}


                                            </div>


                                        </div>


                                    </div>

                                );

                            }
                        )}


                    </div>

                )}


            </section>


            {/* INFORMATION */}

            <section className="admin-category-info">


                <FiLayers />


                <div>

                    <h3>
                        Categories are managed through Products
                    </h3>


                    <p>
                        Main categories and subcategories are
                        defined by the Velora shop structure.
                        Product counts are automatically calculated
                        from your active products.
                    </p>

                </div>


            </section>


        </div>

    );

}


export default AdminCategories;