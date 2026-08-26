import { FiHeart, FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import dressImg from "../assets/dress.jpg";
import shirtImg from "../assets/shirt.jpg";
import bagImg from "../assets/bag.jpg";
import watchImg from "../assets/watch.jpg";


function FeaturedProducts() {

  const navigate = useNavigate();


  const products = [
    {
      id: 1,
      name: "Satin Midi Dress",
      category: "Women",
      price: "₹1,299",
      image: dressImg,
    },
    {
      id: 2,
      name: "Classic Linen Shirt",
      category: "Men",
      price: "₹999",
      image: shirtImg,
    },
    {
      id: 3,
      name: "Minimal Shoulder Bag",
      category: "Accessories",
      price: "₹799",
      image: bagImg,
    },
    {
      id: 4,
      name: "Classic Gold Watch",
      category: "Accessories",
      price: "₹1,499",
      image: watchImg,
    },
  ];


  const handleCategoryClick = (category) => {

    navigate(
      `/shop?category=${encodeURIComponent(category)}`
    );

  };


  return (

    <section className="featured-section">


      {/* SECTION HEADING */}

      <div className="featured-heading">

        <div>

          <p className="featured-label">
            CURATED FOR YOU
          </p>

          <h2>
            Trending <span>This Season</span>
          </h2>

        </div>


        <div className="featured-heading-right">

          <p>
            Pieces everyone is talking about.
            Discover styles made for your everyday look.
          </p>


          <button
            type="button"
            className="featured-view-btn"
            onClick={() => navigate("/shop")}
          >

            View All Products

            <FiArrowUpRight />

          </button>

        </div>

      </div>


      {/* PRODUCTS */}

      <div className="product-grid">

        {products.map((product) => (

          <div
            className="product-card"
            key={product.id}
          >


            {/* IMAGE */}

            <div className="product-image">

              <img
                src={product.image}
                alt={product.name}
              />


              

            </div>


            {/* PRODUCT DETAILS */}

            <div className="product-details">

              <p className="product-category">
                {product.category}
              </p>


              <div className="product-info-row">

                <div>

                  <h3>
                    {product.name}
                  </h3>

                  <p className="product-price">
                    {product.price}
                  </p>

                </div>


                {/* CATEGORY ARROW */}

                <button
                  type="button"
                  className="product-arrow"
                  onClick={() =>
                    handleCategoryClick(
                      product.category
                    )
                  }
                  aria-label={`View ${product.category} products`}
                >

                  <FiArrowUpRight />

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>


    </section>

  );

}


export default FeaturedProducts;