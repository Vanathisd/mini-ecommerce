import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

import {
    FiShoppingBag,
    FiEye,
    FiChevronDown,
} from "react-icons/fi";

import "../styles/shop.css";


const subcategories = {

    Women: [
        "Dresses",
        "Tops",
        "Ethnic Wear",
    ],

    Men: [
        "Shirts",
        "Jeans",
        "Jackets",
    ],

    Accessories: [
        "Watches",
        "Bags",
        "Sunglasses",
        "Wallets",
    ],

};


function Shop() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { addToCart } = useCart();

    const selectedCategory =
        searchParams.get("category");

    const searchTerm =
    searchParams.get("search") || "";

    const [products, setProducts] = useState([]);

    const [category, setCategory] = useState(
        selectedCategory || "All"
    );

    const [subcategory, setSubcategory] =
        useState("All");

    const [sort, setSort] =
        useState("featured");

    const [currentPage, setCurrentPage] =
        useState(1);



    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response = await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/products"
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

    useEffect(() => {

    const newCategory =
        searchParams.get("category");

    const newSearch =
        searchParams.get("search") || "";

    if (newCategory) {
        setCategory(newCategory);
    } else {
        setCategory("All");
    }

    setSubcategory("All");
    setCurrentPage(1);

    // Scroll to the top of Shop page
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}, [searchParams]);


    // useEffect(() => {

    //     if (selectedCategory) {

    //         setCategory(selectedCategory);
    //         setSubcategory("All");
    //         setCurrentPage(1);

    //     }

    // }, [selectedCategory]);


    const handleCategoryChange =
        (newCategory) => {

            setCategory(newCategory);
            setSubcategory("All");
            setCurrentPage(1);

        };


    const handleSubcategoryChange =
        (item) => {

            setSubcategory(item);
            setCurrentPage(1);

        };



    const getProductImage = (image) => {

        if (!image) {
            return "";
        }

        if (image.startsWith("/uploads")) {

            return `https://mini-ecommerce-backend-yxii.onrender.com${image}`;

        }

        return image;

    };


    let filteredProducts =
    products.filter((product) => {

        const productCategory =
            product.category
                ?.trim()
                .toLowerCase();

        const productSubcategory =
            product.subcategory
                ?.trim()
                .toLowerCase();

        const selectedCategoryValue =
            category
                .trim()
                .toLowerCase();

        const selectedSubcategoryValue =
            subcategory
                .trim()
                .toLowerCase();


        // CATEGORY MATCH

        const categoryMatch =
            category === "All" ||
            productCategory === selectedCategoryValue;


        // SUBCATEGORY MATCH

        const subcategoryMatch =
            subcategory === "All" ||
            productSubcategory ===
            selectedSubcategoryValue;


        // SEARCH

        const search =
            searchTerm
                .toLowerCase()
                .trim();


        const searchMatch =
            !search ||

            product.name
                ?.toLowerCase()
                .includes(search) ||

            product.category
                ?.toLowerCase()
                .includes(search) ||

            product.subcategory
                ?.toLowerCase()
                .includes(search) ||

            product.description
                ?.toLowerCase()
                .includes(search);


        return (
            categoryMatch &&
            subcategoryMatch &&
            searchMatch
        );

    });


    if (sort === "price-low") {

        filteredProducts.sort(
            (a, b) => a.price - b.price
        );

    }

    if (sort === "price-high") {

        filteredProducts.sort(
            (a, b) => b.price - a.price
        );

    }

    if (sort === "rating") {

        filteredProducts.sort(
            (a, b) => b.rating - a.rating
        );

    }


    const productsPerPage = 6;

    const totalPages =
        Math.ceil(
            filteredProducts.length /
            productsPerPage
        );

    const startIndex =
        (currentPage - 1) *
        productsPerPage;

    const endIndex =
        startIndex +
        productsPerPage;

    const currentProducts =
        filteredProducts.slice(
            startIndex,
            endIndex
        );


    return (

        <main className="shop-page">



            <section className="shop-intro">

                <p className="shop-label">
                    DISCOVER VELORA
                </p>

                <h1>
                    Shop <span>Your Style</span>
                </h1>

                <p>
                    Browse our curated collection of
                    fashion and lifestyle essentials.
                    Filter by category, availability,
                    and style to find pieces that feel
                    perfectly yours.
                </p>

            </section>



            <div className="shop-main-categories">

                <button
                    className={
                        category === "All"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        handleCategoryChange("All")
                    }
                >
                    All
                </button>


                <button
                    className={
                        category === "Women"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        handleCategoryChange("Women")
                    }
                >
                    Women
                </button>


                <button
                    className={
                        category === "Men"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        handleCategoryChange("Men")
                    }
                >
                    Men
                </button>


                <button
                    className={
                        category === "Accessories"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        handleCategoryChange(
                            "Accessories"
                        )
                    }
                >
                    Accessories
                </button>

            </div>




            <div className="shop-subcategories">

                <button
                    className={
                        subcategory === "All"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        handleSubcategoryChange(
                            "All"
                        )
                    }
                >
                    All
                </button>


                {category !== "All" &&
                    subcategories[category]?.map(
                        (item) => (

                            <button
                                key={item}
                                className={
                                    subcategory === item
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    handleSubcategoryChange(
                                        item
                                    )
                                }
                            >
                                {item}
                            </button>

                        )
                    )
                }

            </div>



            <div className="shop-toolbar">

                <p>
                    Showing{" "}
                    <strong>
                        {filteredProducts.length}
                    </strong>{" "}
                    products
                </p>


                <div className="shop-sort">

                    <span>
                        Sort by
                    </span>


                    <div className="sort-box">

                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(
                                    e.target.value
                                );
                                setCurrentPage(1);
                            }}
                        >

                            <option value="featured">
                                Featured
                            </option>

                            <option value="price-low">
                                Price: Low to High
                            </option>

                            <option value="price-high">
                                Price: High to Low
                            </option>

                            <option value="rating">
                                Highest Rated
                            </option>

                        </select>

                        <FiChevronDown />

                    </div>

                </div>

            </div>



            <div className="shop-product-grid">

                {currentProducts.map(
                    (product) => (

                        <div
                            className="shop-product-card"
                            key={product._id}
                        >


                            {/* IMAGE */}

                            <div className="shop-product-image">

                                <img
                                    src={getProductImage(
                                        product.image
                                    )}
                                    alt={product.name}
                                />

                            </div>



                            {/* CONTENT */}

                            <div className="shop-product-content">

                                <p className="product-category">

                                    {product.category}

                                    {" · "}

                                    {product.subcategory}

                                </p>


                                <h3>
                                    {product.name}
                                </h3>


                                <p className="product-description">

                                    {product.description}

                                </p>



                                {/* REVIEW */}

                                <div className="product-review">

                                    <span>
                                        ★
                                    </span>

                                    <strong>
                                        {product.rating}
                                    </strong>

                                    <small>
                                        ({product.reviews} reviews)
                                    </small>

                                </div>



                                {/* PRICE */}

                                <h4 className="product-price">

                                    ₹
                                    {Number(
                                        product.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                </h4>



                                {/* STOCK */}

                                <p className="product-stock">

                                    {product.stock > 0
                                        ? `✓ ${product.stock} in stock`
                                        : "Out of stock"
                                    }

                                </p>



                                {/* BUTTONS */}

                                <div className="product-buttons">

                                    <button
                                        className="add-cart-btn"
                                        disabled={
                                            product.stock === 0
                                        }
                                        onClick={(e) => {

                                            e.stopPropagation();

                                            addToCart(
                                                product
                                            );

                                        }}
                                    >

                                        <FiShoppingBag />

                                        Add to Cart

                                    </button>


                                    <button
                                        className="view-details-btn"
                                        onClick={() =>
                                            navigate(
                                                `/product/${product._id}`
                                            )
                                        }
                                    >

                                        <FiEye />

                                        View Details

                                    </button>

                                </div>

                            </div>

                        </div>

                    )
                )}

            </div>



            {totalPages > 1 && (

                <div className="shop-pagination">

                    {Array.from(
                        {
                            length: totalPages
                        },
                        (_, index) => (

                            <button
                                key={index + 1}
                                className={
                                    currentPage ===
                                    index + 1
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        index + 1
                                    )
                                }
                            >
                                {index + 1}
                            </button>

                        )
                    )}

                </div>

            )}



            {filteredProducts.length === 0 &&
                products.length > 0 && (

                    <div className="no-products">

                        <h3>
                            No products found
                        </h3>

                        <p>
                            Try selecting another
                            category.
                        </p>

                    </div>

                )}

        </main>

    );

}


export default Shop;