import homeImg from "../assets/home.png";
import { useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();
    return (
        <section className="hero">

            {/* LEFT CONTENT */}

            <div className="hero-content">

                <p className="hero-small-text">
                    NEW COLLECTION
                </p>

                <h1>
                    Style That
                    <br />
                    <span>Moves</span> With You.
                </h1>

                <p className="hero-description">
                    Discover handpicked fashion and lifestyle essentials
                    curated to bring confidence, comfort, and effortless
                    style to your everyday moments.
                </p>


                <div className="hero-buttons">

                    <button
                        type="button"
                        className="shop-btn"
                        onClick={() =>
                            navigate("/shop")
                        }
                    >
                        Shop Best Sellers →
                    </button>

                    <button
                        type="button"
                        className="explore-btn"
                        onClick={() =>
                            navigate("/about")
                        }
                    >
                        Explore Our Story
                    </button>

                </div>


                {/* STATS */}

                <div className="hero-stats">

                    <div className="hero-stat">
                        <h3>4.8/5</h3>
                        <p>12k+ reviews</p>
                    </div>

                    <div className="hero-stat">
                        <h3>48h</h3>
                        <p>Avg. delivery</p>
                    </div>

                    <div className="hero-stat">
                        <h3>10k+</h3>
                        <p>Happy customers</p>
                    </div>

                </div>

            </div>


            {/* CENTER IMAGE */}

            <div className="hero-image">

                <img
                    src={homeImg}
                    alt="Fashion shopping"
                />

            </div>


            <div className="trust-card">

                <div className="trust-stars">
                    ★ ★ ★ ★ ★
                </div>

                <h3>
                    Trusted by 10,000+ shoppers
                </h3>

                <p>
                    Quality fashion, thoughtful curation,
                    and delivery you can count on.
                </p>


                <div className="trust-item">

                    <div className="trust-icon">
                        ✦
                    </div>

                    <span>
                        Carefully curated styles
                    </span>

                </div>


                <div className="trust-item">

                    <div className="trust-icon">
                        ✓
                    </div>

                    <span>
                        Quality assured products
                    </span>

                </div>


                <div className="trust-item">

                    <div className="trust-icon">
                        ↗
                    </div>

                    <span>
                        Fast and reliable delivery
                    </span>

                </div>

            </div>


            {/* BOTTOM INFORMATION */}

            <div className="hero-bottom-line">

                <span>
                    QUALITY ASSURED
                </span>

                <span>
                    EASY RETURNS
                </span>

                <span>
                    SECURE SHOPPING
                </span>

                <span>
                    FAST DELIVERY
                </span>

            </div>

        </section>
    );
}

export default Hero;