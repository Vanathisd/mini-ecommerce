import { useState, useEffect } from "react";

import {
    FiArrowUpRight
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import "../styles/new-arrivals.css";


function NewArrivals() {

    const navigate = useNavigate();


    const [newArrivals, setNewArrivals] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchNewArrivals = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await fetch(
                        "https://mini-ecommerce-backend-yxii.onrender.com/products/new-arrivals"
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to fetch new arrivals"
                    );

                }


                setNewArrivals(data);


            } catch (error) {

                console.error(
                    "Fetch new arrivals error:",
                    error
                );


                setError(
                    "Unable to load new arrivals."
                );


            } finally {

                setLoading(false);

            }

        };


        fetchNewArrivals();

    }, []);


    if (loading) {

        return (

            <main className="new-arrivals-page">

                <section className="new-arrivals-intro">

                    <p className="new-arrivals-label">
                        JUST LANDED
                    </p>

                    <h1>
                        New <span>Arrivals</span>
                    </h1>

                    <p>
                        Discover the latest styles and fresh
                        additions to the Velora collection.
                    </p>

                </section>


                <section className="new-arrivals-products">

                    <p>
                        Loading new arrivals...
                    </p>

                </section>

            </main>

        );

    }



    if (error) {

        return (

            <main className="new-arrivals-page">

                <section className="new-arrivals-intro">

                    <p className="new-arrivals-label">
                        JUST LANDED
                    </p>

                    <h1>
                        New <span>Arrivals</span>
                    </h1>

                    <p>
                        Discover the latest styles and fresh
                        additions to the Velora collection.
                    </p>

                </section>


                <section className="new-arrivals-products">

                    <p>
                        {error}
                    </p>

                </section>

            </main>

        );

    }


    return (

        <main className="new-arrivals-page">


            <section className="new-arrivals-intro">

                <p className="new-arrivals-label">
                    JUST LANDED
                </p>


                <h1>
                    New <span>Arrivals</span>
                </h1>


                <p>
                    Discover the latest styles and fresh
                    additions to the Velora collection.
                </p>

            </section>


            <section className="new-arrivals-products">

                {newArrivals.length === 0 ? (

                    <p>
                        No new arrivals available.
                    </p>

                ) : (

                    <div className="new-arrivals-grid">

                        {newArrivals.map((product) => (

                            <div
                                className="new-arrival-card"
                                key={product._id}
                            >

                                {/* IMAGE */}

                                <div className="new-arrival-image">

                                    <img
                                        src={
                                            product.image &&
                                            product.image.startsWith("/uploads")
                                                ? `https://mini-ecommerce-backend-yxii.onrender.com${product.image}`
                                                : product.image
                                        }
                                        alt={product.name}
                                        onError={() => console.log("IMAGE FAILED:", product.image)}
                                    />


                                    <span className="new-arrival-badge">
                                        New
                                    </span>

                                </div>


                                {/* CONTENT */}

                                <div className="new-arrival-content">

                                    <p className="new-arrival-category">
                                        {product.category}
                                    </p>


                                    <h3>
                                        {product.name}
                                    </h3>


                                    <div className="new-arrival-bottom">

                                        <strong>
                                            ₹
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>


                                        <span>
                                            ★{" "}
                                            {product.rating || 0}
                                        </span>

                                    </div>


                                    <button
                                        className="new-arrival-view-btn"
                                        onClick={() =>
                                            navigate(
                                                `/product/${product._id}`
                                            )
                                        }
                                    >

                                        View Product

                                        <FiArrowUpRight />

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </main>

    );

}


export default NewArrivals;