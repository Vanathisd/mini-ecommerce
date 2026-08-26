import {
    useParams,
    useNavigate
} from "react-router-dom";

import {
    useState,
    useEffect
} from "react";

import {
    FiArrowLeft,
    FiShoppingBag,
    FiArrowUpRight
} from "react-icons/fi";

import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/authContext.jsx";

import "../styles/productdetails.css";


function ProductDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();

    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [selectedRating, setSelectedRating] =
        useState(0);

    const [hoverRating, setHoverRating] =
        useState(0);

    const [ratingSubmitted, setRatingSubmitted] =
        useState(false);


    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: ""
    });


    const showToast = (message, type = "success") => {

        setToast({
            show: true,
            message,
            type
        });


        setTimeout(() => {

            setToast({
                show: false,
                message: "",
                type: ""
            });

        }, 3000);

    };



    const getCurrentUserId = () => {

        // First try auth context
        if (user) {

            const currentId =
                user._id ||
                user.id ||
                user.userId;

            if (currentId) {

                return currentId.toString();

            }

        }


        const token =
            localStorage.getItem("token");


        if (!token) {

            return null;

        }


        try {

            const payload =
                JSON.parse(
                    atob(
                        token.split(".")[1]
                    )
                );


            const currentId =
                payload.id ||
                payload._id ||
                payload.userId ||
                payload.user?.id;


            if (currentId) {

                return currentId.toString();

            }


            return null;

        } catch (error) {

            console.error(
                "Unable to read token:",
                error
            );

            return null;

        }

    };


    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response = await fetch(
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


            } finally {

                setLoading(false);

            }

        };


        fetchProducts();

    }, []);



    const product =
        products.find(
            (item) =>
                item._id === id
        );



    useEffect(() => {

        // Product is not loaded yet
        if (!product) {

            return;

        }


        const currentUserId =
            getCurrentUserId();


        // User is not logged in
        if (!currentUserId) {

            setSelectedRating(0);

            setRatingSubmitted(false);

            setHoverRating(0);

            return;

        }


        const savedRating =
            product.ratings?.find(
                (item) => {

                    if (!item.user) {

                        return false;

                    }


                    let ratingUserId;


                    // If user is populated object
                    if (
                        typeof item.user ===
                        "object"
                    ) {

                        ratingUserId =
                            item.user._id ||
                            item.user.id;

                    }

                    // If user is ObjectId/string
                    else {

                        ratingUserId =
                            item.user;

                    }


                    if (!ratingUserId) {

                        return false;

                    }


                    return (
                        ratingUserId.toString() ===
                        currentUserId.toString()
                    );

                }
            );


        if (savedRating) {

            const savedValue =
                Number(
                    savedRating.rating
                );


            setSelectedRating(
                savedValue
            );


            setRatingSubmitted(true);

            setHoverRating(0);


            // Keep a frontend backup too
            localStorage.setItem(
                `rating_${id}_${currentUserId}`,
                savedValue.toString()
            );


            return;

        }



        const localRating =
            localStorage.getItem(
                `rating_${id}_${currentUserId}`
            );


        if (localRating) {

            setSelectedRating(
                Number(localRating)
            );

            setRatingSubmitted(true);

        } else {

            setSelectedRating(0);

            setRatingSubmitted(false);

        }


        setHoverRating(0);


    }, [product, user, id]);


    const getProductImage = (image) => {

        if (!image) {

            return "";

        }


        if (
            image.startsWith("/uploads")
        ) {

            return (
                `http://localhost:5000${image}`
            );

        }


        return image;

    };


    if (loading) {

        return (

            <main className="product-not-found">

                <h2>
                    Loading product...
                </h2>

            </main>

        );

    }

    if (!product) {

        return (

            <main className="product-not-found">

                <h2>
                    Product Not Found
                </h2>


                <button
                    onClick={() =>
                        navigate("/shop")
                    }
                >
                    Back to Shop
                </button>

            </main>

        );

    }

    const displayedRating =
        Number(product.rating) || 0;


    const displayedReviews =
        Number(product.reviews) || 0;


    const hasReviews =
        displayedReviews > 0;


    const handleRating = async (rating) => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            showToast(
                "Please login to rate this product.",
                "error"
            );

            navigate("/login");

            return;

        }


        if (ratingSubmitted) {

            return;

        }


        const numericRating =
            Number(rating);


        setSelectedRating(
            numericRating
        );


        try {

            const response =
                await fetch(

                    `http://localhost:5000/products/${product._id}/rating`,

                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            rating:
                                numericRating

                        })

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to submit rating"
                );

            }


            setSelectedRating(
                numericRating
            );


            setRatingSubmitted(
                true
            );


            setHoverRating(0);


            const currentUserId =
                getCurrentUserId();


            if (currentUserId) {

                localStorage.setItem(

                    `rating_${id}_${currentUserId}`,

                    numericRating.toString()

                );

            }

            setProducts(
                (currentProducts) =>

                    currentProducts.map(
                        (item) =>

                            item._id ===
                            product._id

                                ? data.product

                                : item
                    )
            );


            showToast(
                "Rating submitted successfully!",
                "success"
            );


        } catch (error) {

            console.error(
                "Rating error:",
                error
            );


            // Request really failed
            setSelectedRating(0);

            setRatingSubmitted(false);


            showToast(
                error.message,
                "error"
            );

        }

    };


    const getRatingPercentage = (star) => {

        if (
            !product.ratings ||
            product.ratings.length === 0
        ) {

            return 0;

        }


        const totalRatings =
            product.ratings.length;


        const starCount =
            product.ratings.filter(
                (item) =>
                    Number(item.rating) ===
                    star
            ).length;


        return Math.round(
            (starCount / totalRatings) * 100
        );

    };



    const recommendedProducts =
        products
            .filter(
                (item) =>
                    item._id !==
                    product._id
            )
            .sort((a, b) => {

                const aSubcategory =
                    a.subcategory ===
                    product.subcategory
                        ? 1
                        : 0;


                const bSubcategory =
                    b.subcategory ===
                    product.subcategory
                        ? 1
                        : 0;


                if (
                    aSubcategory !==
                    bSubcategory
                ) {

                    return (
                        bSubcategory -
                        aSubcategory
                    );

                }


                const aCategory =
                    a.category ===
                    product.category
                        ? 1
                        : 0;


                const bCategory =
                    b.category ===
                    product.category
                        ? 1
                        : 0;


                return (
                    bCategory -
                    aCategory
                );

            })
            .slice(0, 4);



    return (

        <main className="product-details-page">


            {toast.show && (

                <div
                    className={`product-toast ${toast.type}`}
                >

                    {toast.message}

                </div>

            )}

            <button
                className="product-back-btn"
                onClick={() =>
                    navigate(-1)
                }
            >

                <FiArrowLeft />

                Back to Shop

            </button>

            <section
                className="product-details-main"
            >


                {/* IMAGE */}

                <div
                    className="product-details-image"
                >

                    <img
                        src={getProductImage(
                            product.image
                        )}
                        alt={product.name}
                    />

                </div>


                {/* CONTENT */}

                <div
                    className="product-details-content"
                >

                    <p
                        className="product-details-category"
                    >

                        {product.category}

                        {" · "}

                        {product.subcategory}

                    </p>


                    <h1>
                        {product.name}
                    </h1>


                    {/* PRODUCT RATING */}

                    <div
                        className="product-details-rating"
                    >

                        <span>
                            ★
                        </span>


                        <strong>
                            {displayedRating.toFixed(1)}
                        </strong>


                        <small>
                            ({displayedReviews} reviews)
                        </small>

                    </div>


                    {/* PRICE */}

                    <h2>

                        ₹
                        {Number(
                            product.price
                        ).toLocaleString(
                            "en-IN"
                        )}

                    </h2>


                    {/* DESCRIPTION */}

                    <p
                        className="product-details-description"
                    >

                        {product.description}

                    </p>


                    {/* STOCK */}

                    <p
                        className="product-details-stock"
                    >

                        {product.stock > 0
                            ? `✓ ${product.stock} in stock`
                            : "Out of stock"
                        }

                    </p>


                    {/* ADD TO CART */}

                    <button
                        className="product-details-cart"

                        disabled={
                            product.stock === 0
                        }

                        onClick={() =>
                            addToCart(product)
                        }
                    >

                        <FiShoppingBag />

                        Add to Cart

                    </button>

                </div>

            </section>

            <section
                className="reviews-section"
            >


                {/* HEADING */}

                <div
                    className="reviews-heading"
                >

                    <div>

                        <p
                            className="reviews-label"
                        >
                            CUSTOMER FEEDBACK
                        </p>


                        <h2>

                            What People{" "}

                            <span>
                                Think
                            </span>

                        </h2>

                    </div>

                </div>


                <div
                    className="user-rating-section"
                >

                    <p>
                        Rate this product
                    </p>


                    <div
                        className="user-rating-stars"
                    >

                        {[1, 2, 3, 4, 5].map(
                            (star) => {

                                const isActive =
                                    star <=
                                    (
                                        hoverRating ||
                                        selectedRating
                                    );


                                return (

                                    <button
                                        key={star}

                                        type="button"

                                        className={
                                            isActive
                                                ? "rating-star active"
                                                : "rating-star"
                                        }

                                        onMouseEnter={() => {

                                            if (
                                                !ratingSubmitted
                                            ) {

                                                setHoverRating(
                                                    star
                                                );

                                            }

                                        }}

                                        onMouseLeave={() => {

                                            setHoverRating(
                                                0
                                            );

                                        }}

                                        onClick={() =>
                                            handleRating(
                                                star
                                            )
                                        }

                                        disabled={
                                            ratingSubmitted
                                        }
                                    >

                                        ★

                                    </button>

                                );

                            }
                        )}

                    </div>


                    {/* RATING MESSAGE */}

                    {selectedRating > 0 && (

                        <p
                            className="rating-message"
                        >

                            Thanks! You rated this
                            product{" "}

                            {selectedRating}

                            {selectedRating > 1
                                ? " stars"
                                : " star"
                            }.

                        </p>

                    )}

                </div>


                {hasReviews && (

                    <div
                        className="reviews-summary"
                    >


                        {/* OVERALL RATING */}

                        <div
                            className="overall-rating"
                        >

                            <h3>
                                {displayedRating.toFixed(1)}
                            </h3>


                            <div
                                className="rating-stars"
                            >

                                {[1, 2, 3, 4, 5].map(
                                    (star) => (

                                        <span
                                            key={star}

                                            className={
                                                star <=
                                                Math.round(
                                                    displayedRating
                                                )
                                                    ? "star-filled"
                                                    : "star-empty"
                                            }
                                        >

                                            ★

                                        </span>

                                    )
                                )}

                            </div>


                            <p>

                                Based on{" "}

                                {displayedReviews}

                                {" "}reviews

                            </p>

                        </div>


                        {/* RATING BREAKDOWN */}

                        <div
                            className="rating-breakdown"
                        >

                            {[5, 4, 3, 2, 1].map(
                                (star) => {

                                    const percentage =
                                        getRatingPercentage(
                                            star
                                        );


                                    return (

                                        <div
                                            className="rating-row"
                                            key={star}
                                        >

                                            <span>
                                                {star}
                                            </span>


                                            <span>
                                                ★
                                            </span>


                                            <div
                                                className="rating-bar"
                                            >

                                                <span
                                                    style={{
                                                        width:
                                                            `${percentage}%`
                                                    }}
                                                />

                                            </div>


                                            <small>
                                                {percentage}%
                                            </small>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </div>

                )}

            </section>


            <section
                className="recommended-section"
            >

                <div
                    className="recommended-heading"
                >

                    <div>

                        <p
                            className="recommended-label"
                        >
                            YOU MAY ALSO LIKE
                        </p>


                        <h2>

                            Recommended{" "}

                            <span>
                                For You
                            </span>

                        </h2>

                    </div>

                </div>


                <div
                    className="recommended-grid"
                >

                    {recommendedProducts.map(
                        (item) => (

                            <div
                                className="recommended-card"

                                key={item._id}

                                onClick={() =>
                                    navigate(
                                        `/product/${item._id}`
                                    )
                                }
                            >

                                {/* IMAGE */}

                                <div
                                    className="recommended-image"
                                >

                                    <img
                                        src={getProductImage(
                                            item.image
                                        )}
                                        alt={item.name}
                                    />

                                </div>


                                {/* INFO */}

                                <div
                                    className="recommended-info"
                                >

                                    <p
                                        className="recommended-category"
                                    >

                                        {item.category}

                                    </p>


                                    <div
                                        className="recommended-info-row"
                                    >

                                        <div>

                                            <h3>
                                                {item.name}
                                            </h3>


                                            <p>

                                                ₹
                                                {Number(
                                                    item.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </p>

                                        </div>


                                        <button
                                            className="recommended-arrow"

                                            onClick={(e) => {

                                                e.stopPropagation();

                                                navigate(
                                                    `/product/${item._id}`
                                                );

                                            }}
                                        >

                                            <FiArrowUpRight />

                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>

        </main>

    );

}


export default ProductDetails;