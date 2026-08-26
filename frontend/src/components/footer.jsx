import {
    FiInstagram,
    FiFacebook,
    FiTwitter,
    FiMail,
    FiArrowUpRight
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

function Footer() {

    const navigate = useNavigate();

    return (
        <footer className="footer">

            {/* TOP FOOTER */}

            <div className="footer-main">

                {/* BRAND */}

                <div className="footer-brand">

                    <h2>VELORA</h2>

                    <p className="footer-tagline">
                        Your Style, Your Story
                    </p>

                    <p className="footer-description">
                        Thoughtfully curated fashion and lifestyle
                        pieces designed to make every day feel
                        effortlessly yours.
                    </p>


                    {/* SOCIAL */}

                    <div className="footer-socials">

                        <a
                            href="https://www.instagram.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-social"
                        >
                            <FiInstagram />
                        </a>

                        <a
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-social"
                        >
                            <FiFacebook />
                        </a>

                        <a
                            href="https://twitter.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-social"
                        >
                            <FiTwitter />
                        </a>

                        <a
                            href="mailto:support@velora.com"
                            className="footer-social"
                        >
                            <FiMail />
                        </a>

                    </div>

                </div>


                {/* SHOP */}

                <div className="footer-column">

                    <h3>Shop</h3>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/shop?category=Women");
                        }}
                    >
                        Women
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/shop?category=Men");
                        }}
                    >
                        Men
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/new-arrivals");
                        }}
                    >
                        New Arrivals
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/shop?category=Accessories");
                        }}
                    >
                        Accessories
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/shop?category=Sale");
                        }}
                    >
                        Sale
                    </a>

                </div>


                {/* CUSTOMER CARE */}

                <div className="footer-column">

                    <h3>Customer Care</h3>

                   <a
                        href="/support#contact"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/support#contact");
                        }}
                    >
                        Contact Us
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/support");
                        }}
                    >
                        Shipping & Delivery
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/support");
                        }}
                    >
                        Returns & Exchanges
                    </a>

                   <a
                        href="/support#faq"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/support#faq");
                        }}
                    >
                        FAQs
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/support");
                        }}
                    >
                        Support
                    </a>

                </div>


                {/* ABOUT */}

                <div className="footer-column">

                    <h3>About Velora</h3>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/about");
                        }}
                    >
                        Our Story
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/shop");
                        }}
                    >
                        Our Collections
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/about");
                        }}
                    >
                        Careers
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/privacypolicy");
                        }}
                    >
                        Privacy Policy
                    </a>

                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/terms");
                        }}
                    >
                        Terms & Conditions
                    </a>

                </div>

            </div>


            {/* NEWSLETTER */}

            <div className="footer-newsletter">

                <div>

                    <p className="newsletter-label">
                        STAY IN THE LOOP
                    </p>

                    <h3>
                        Get style updates
                        <span> in your inbox.</span>
                    </h3>

                </div>


                <div className="newsletter-form">

                    <input
                        type="email"
                        placeholder="Enter your email address"
                    />

                    <button>
                        Subscribe
                        <FiArrowUpRight />
                    </button>

                </div>

            </div>


            {/* BOTTOM */}

            <div className="footer-bottom">

                <p>
                    © 2026 VELORA. All rights reserved.
                </p>

                <p>
                    Designed for everyday style.
                </p>

            </div>

        </footer>
    );
}

export default Footer;