import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import {
    FiPackage,
    FiTruck,
    FiCreditCard,
    FiRefreshCw,
    FiHelpCircle,
    FiMail,
    FiArrowRight
} from "react-icons/fi";

import "../styles/support.css";


function Support() {

    const navigate = useNavigate();

    useEffect(() => {

    const hash = window.location.hash;

    if (hash) {

        setTimeout(() => {

            const element =
                document.querySelector(hash);

            if (element) {

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }, 100);

    }

}, []);
    return (

        <main className="support-page">


<section className="support-human">

    <div className="support-human-heading">

        <p className="support-label">
            HERE TO HELP
        </p>

        <h2>
            Support that feels
            <span> human.</span>
        </h2>

        <p>
            Whether you have a question about your order,
            need help with delivery, or simply want to know
            more about a product, we're here to make your
            shopping experience easier.
        </p>

    </div>


    <div className="support-human-grid">


        {/* CUSTOMER SUPPORT */}

        <div className="support-human-item">

            <div className="support-human-icon">
                <FiHelpCircle />
            </div>

            <h3>
                Customer Support
            </h3>

            <p>
                Need help with an order or have a question?
                Our support team is here to help you find
                a quick and simple solution.
            </p>

            <span>
                Available for order and product assistance
            </span>

        </div>


        {/* DELIVERY */}

        <div className="support-human-item">

            <div className="support-human-icon">
                <FiTruck />
            </div>

            <h3>
                Delivery & Tracking
            </h3>

            <p>
                Stay informed about your order from checkout
                to delivery. Orders are expected to arrive
                within 3–5 business days.
            </p>

            <span>
                Delivery updates available for your order
            </span>

        </div>


        {/* PRIVACY */}

        <div className="support-human-item">

            <div className="support-human-icon">
                <FiCreditCard />
            </div>

            <h3>
                Secure Shopping
            </h3>

            <p>
                Your shopping experience matters to us.
                We keep your checkout information protected
                and aim to provide a safe shopping environment.
            </p>

            <span>
                Your information stays protected
            </span>

        </div>


    </div>

</section>


            <section className="support-faq" id="faq">

                <div className="support-section-heading">

                    <p className="support-label">
                        FREQUENTLY ASKED QUESTIONS
                    </p>

                    <h2>
                        Common questions,
                        <span> simple answers.</span>
                    </h2>

                </div>


                <div className="faq-list">


                    <details>

                        <summary>
                            How can I place an order?
                        </summary>

                        <p>
                            Browse the Shop page, select a product,
                            add it to your cart, and continue to
                            Checkout to enter your delivery details
                            and place the order.
                        </p>

                    </details>


                    <details>

                        <summary>
                            How long does delivery take?
                        </summary>

                        <p>
                            Orders are generally expected to arrive
                            within 3-5 business days. Delivery time
                            may vary depending on your location.
                        </p>

                    </details>


                    <details>

                        <summary>
                            What payment methods are available?
                        </summary>

                        <p>
                            Velora currently supports UPI,
                            Credit / Debit Card, and Cash on Delivery
                            as checkout options.
                        </p>

                    </details>


                    <details>

                        <summary>
                            Can I return a product?
                        </summary>

                        <p>
                            Eligible products can be returned according
                            to the applicable return conditions.
                            Contact our support team for assistance.
                        </p>

                    </details>


                    <details>

                        <summary>
                            How can I contact Velora support?
                        </summary>

                        <p>
                            You can reach our support team through
                            the contact details provided below.
                        </p>

                    </details>


                </div>

            </section>


            <section className="support-contact" id="contact">

                <div className="support-contact-icon">
                    <FiHelpCircle />
                </div>

                <p className="support-label">
                    STILL NEED HELP?
                </p>

                <h2>
                    We're here to
                    <span> help.</span>
                </h2>

                <p>
                    Couldn't find what you were looking for?
                    Reach out to our support team and we'll
                    be happy to help.
                </p>


                <div className="support-contact-options">

                    <a href="mailto:support@velora.com">

                        <FiMail />

                        <div>

                            <strong>
                                Email Support
                            </strong>

                            <span>
                                support@velora.com
                            </span>

                        </div>

                    </a>

                </div>

            </section>


        </main>

    );

}


export default Support;