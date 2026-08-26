import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
} from "react-icons/fi";

import saleImg from "../assets/sale.jpg";
import newSeasonImg from "../assets/new-season.jpg";
import weekendImg from "../assets/weekend-offer.jpg";
import accessoriesImg from "../assets/accessories-offer.jpg";

function OfferCarousel() {
  const navigate = useNavigate();
  

  const offers = [
    {
      smallText: "LIMITED TIME",
      title: "Season Sale",
      highlight: "Up to 50% Off",
      description:
        "Refresh your wardrobe with timeless pieces at special prices.",
      button: "Shop Sale",
      image: saleImg,
      link: "/shop",
    },
    {
      smallText: "JUST DROPPED",
      title: "New Season",
      highlight: "Fresh Styles",
      description:
        "Discover the latest looks designed for your everyday story.",
      button: "Explore New",
      image: newSeasonImg,
      link: "/new-arrivals",
    },
    {
      smallText: "WEEKEND SPECIAL",
      title: "Extra 20% Off",
      highlight: "Your Favorites",
      description:
        "Make the most of your weekend with an exclusive shopping offer.",
      button: "Shop Now",
      image: weekendImg,
      link: "/shop",
    },
    {
      smallText: "THE ACCESSORIES EDIT",
      title: "Complete Your",
      highlight: "Look",
      description:
        "Elevate every outfit with carefully selected accessories.",
      button: "Explore Accessories",
      image: accessoriesImg,
      link: "/shop?category=Accessories",
    },
  ];

  const [current, setCurrent] = useState(0);


  /* AUTO SLIDE */

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrent((prev) =>
        (prev + 1) % offers.length
      );

    }, 5000);

    return () => clearInterval(interval);

  }, [offers.length]);


  /* NEXT */

  const nextSlide = () => {

    setCurrent((prev) =>
      (prev + 1) % offers.length
    );

  };


  /* PREVIOUS */

  const previousSlide = () => {

    setCurrent((prev) =>
      (prev - 1 + offers.length) % offers.length
    );

  };


  const offer = offers[current];


  return (
    
    <section className="offer-section">

      <div className="offer-carousel">

        {/* IMAGE */}

        <div
          className="offer-image"
          style={{
            backgroundImage: `url(${offer.image})`,
          }}
        >

          <div className="offer-image-overlay"></div>

        </div>


        {/* CONTENT */}

        <div className="offer-content">

          <p className="offer-small-text">
            {offer.smallText}
          </p>

          <h2>
            {offer.title}
            <br />
            <span>{offer.highlight}</span>
          </h2>

          <p className="offer-description">
            {offer.description}
          </p>
          <button
    className="offer-button"
    onClick={() => navigate(offer.link)}
>
    {offer.button}
    <FiArrowUpRight />
</button>

        </div>


        {/* CONTROLS */}

        <div className="offer-controls">

          <button
            className="offer-control-btn"
            onClick={previousSlide}
          >
            <FiArrowLeft />
          </button>


          <div className="offer-dots">

            {offers.map((_, index) => (

              <button
                key={index}
                className={`offer-dot ${
                  current === index ? "active" : ""
                }`}
                onClick={() => setCurrent(index)}
              />

            ))}

          </div>


          <button
            className="offer-control-btn"
            onClick={nextSlide}
          >
            <FiArrowRight />
          </button>

        </div>


        {/* SLIDE NUMBER */}

        <div className="offer-counter">
          <span>
            0{current + 1}
          </span>

          <div className="counter-line"></div>

          <span>
            0{offers.length}
          </span>
        </div>

      </div>

    </section>
  );
}

export default OfferCarousel;