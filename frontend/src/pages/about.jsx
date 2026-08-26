import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import "../styles/about.css";


function About() {

    const navigate = useNavigate();


    return (

        <main className="about-page">


            <section className="about-hero">

                <div className="about-hero-content">

                    <p className="about-label">
                        ABOUT VELORA
                    </p>

                    <h1>
                        Shopping made
                        <span> simple and meaningful.</span>
                    </h1>

                    <p className="about-hero-text">
                        Velora is a thoughtfully curated e-commerce
                        destination built to make everyday shopping
                        easier, more enjoyable, and more personal.
                        We bring together products that combine
                        quality, usefulness, and everyday style.
                    </p>

                </div>

            </section>


            <section className="about-journey">

                <div className="about-section-heading">

                    <p className="about-label">
                        OUR JOURNEY
                    </p>

                    <h2>
                        Growing with our
                        <span> community.</span>
                    </h2>

                    <p>
                        From a simple idea to a growing shopping
                        experience, here's how Velora has evolved.
                    </p>

                </div>


                <div className="journey-timeline">


                    <div className="journey-item">

                        <span className="journey-year">
                            2023
                        </span>

                        <div className="journey-content">

                            <h3>
                                The Beginning
                            </h3>

                            <p>
                                Velora began with a simple idea:
                                create a shopping experience where
                                finding useful and beautiful products
                                feels effortless.
                            </p>

                        </div>

                    </div>


                    <div className="journey-item">

                        <span className="journey-year">
                            2024
                        </span>

                        <div className="journey-content">

                            <h3>
                                Growing Collection
                            </h3>

                            <p>
                                We expanded our product collection
                                across everyday essentials, lifestyle
                                products, and carefully selected
                                customer favourites.
                            </p>

                        </div>

                    </div>


                    <div className="journey-item">

                        <span className="journey-year">
                            2025
                        </span>

                        <div className="journey-content">

                            <h3>
                                Better Shopping
                            </h3>

                            <p>
                                We focused on creating a cleaner,
                                faster, and more convenient online
                                shopping experience for our growing
                                community.
                            </p>

                        </div>

                    </div>


                    <div className="journey-item">

                        <span className="journey-year">
                            2026
                        </span>

                        <div className="journey-content">

                            <h3>
                                The Velora Community
                            </h3>

                            <p>
                                Today, Velora continues to grow with
                                a focus on thoughtful products,
                                reliable service, and customers at
                                the heart of every decision.
                            </p>

                        </div>

                    </div>


                </div>

            </section>



            <section className="about-team">

                <div className="about-team-content">

                    <p className="about-label">
                        THE PEOPLE BEHIND VELORA
                    </p>

                    <h2>
                        A team focused on making
                        <span> shopping effortless.</span>
                    </h2>

                    <p>
                        Our team brings together developers,
                        designers, product thinkers, and customer
                        experience enthusiasts who believe that
                        online shopping should feel simple and
                        enjoyable.
                    </p>

                    <p>
                        We carefully select products, understand
                        what customers need, and continuously improve
                        the experience from discovery to delivery.
                    </p>

                </div>


                <div className="about-stat-grid">

                    <div className="about-stat">

                        <strong>
                            20+
                        </strong>

                        <span>
                            Product Categories
                        </span>

                    </div>


                    <div className="about-stat">

                        <strong>
                            4.5★
                        </strong>

                        <span>
                            Average Customer Rating
                        </span>

                    </div>


                    <div className="about-stat">

                        <strong>
                            10+
                        </strong>

                        <span>
                            Trusted Product Partners
                        </span>

                    </div>

                </div>

            </section>


            <section className="about-beliefs">

                <div className="about-section-heading">

                    <p className="about-label">
                        WHAT WE BELIEVE
                    </p>

                    <h2>
                        The values behind
                        <span> every choice.</span>
                    </h2>

                </div>


                <div className="belief-list">

                    <div className="belief-item">

                        <span>
                            01
                        </span>

                        <p>
                            Shopping should feel simple, warm,
                            and designed around real everyday life.
                        </p>

                    </div>


                    <div className="belief-item">

                        <span>
                            02
                        </span>

                        <p>
                            Transparency matters. We believe
                            customers deserve clear information
                            about the products they choose.
                        </p>

                    </div>


                    <div className="belief-item">

                        <span>
                            03
                        </span>

                        <p>
                            Community comes first. Customer
                            feedback helps us discover better
                            products and improve the experience.
                        </p>

                    </div>

                </div>

            </section>

            <section className="about-cta">

                <p className="about-label">
                    READY TO EXPLORE?
                </p>

                <h2>
                    Find something you'll
                    <span> love.</span>
                </h2>

                <p>
                    Explore our curated collection and discover
                    products made for everyday living.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/shop")}
                >

                    Explore Shop

                    <FiArrowRight />

                </button>

            </section>


        </main>

    );

}


export default About;