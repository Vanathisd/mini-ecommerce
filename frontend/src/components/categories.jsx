import { FiArrowUpRight } from "react-icons/fi";
import womenImg from "../assets/women.jpg";
import menImg from "../assets/men.jpg";
import newArrivalsImg from "../assets/new-arrivals.jpg";
import accessoriesImg from "../assets/accessories.jpg";
import { useNavigate } from "react-router-dom";


function Categories() {
    const navigate = useNavigate();
  const categories = [
    {
      title: "Women",
      subtitle: "Elegant looks for every moment",
      image:
        womenImg,
    },
    {
      title: "Men",
      subtitle: "Modern essentials, effortless style",
      image:
        menImg,
    },
    {
      title: "New Arrivals",
      subtitle: "Fresh styles just for you",
      image:
        newArrivalsImg,
    },
    {
      title: "Accessories",
      subtitle: "Complete your look",
      image:
        accessoriesImg,
    },
  ];

  return (
    <section className="categories-section">

      {/* HEADING */}
      <div className="categories-heading">

        <p>EXPLORE THE COLLECTION</p>

        <h2>
          Find Your <span>Everyday Style</span>
        </h2>

        <div className="categories-heading-row">

          <p className="categories-description">
            Curated fashion and lifestyle pieces designed to make
            every look feel effortlessly yours.
          </p>

          <button className="view-all-btn" onClick={() => navigate("/shop")}>
            View All Collection
            <FiArrowUpRight />
          </button>

        </div>
      </div>

      <div className="category-grid">

        {categories.map((category, index) => (

          <div
            className="category-card"
            key={index}
            style={{
              backgroundImage: `url(${category.image})`,
            }}
            onClick={() => {
    if (category.title === "Women") {
      navigate("/shop?category=Women");
    }

    if (category.title === "Men") {
      navigate("/shop?category=Men");
    }

    if (category.title === "Accessories") {
      navigate("/shop?category=Accessories");
    }
    if (category.title === "New Arrivals") {
                navigate("/new-arrivals");
            }
  }}
          >
            <div className="category-overlay"></div>


            <div className="category-content">

              <div>

                <p className="category-number">
                  0{index + 1}
                </p>

                <h3>
                  {category.title}
                </h3>

                <p className="category-subtitle">
                  {category.subtitle}
                </p>

              </div>


              <button className="category-arrow">
                <FiArrowUpRight />
              </button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Categories;