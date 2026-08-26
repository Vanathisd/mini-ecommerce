import {
  FiTruck,
  FiRefreshCcw,
  FiShield,
  FiHeadphones
} from "react-icons/fi";

function WhyVelora() {
  const benefits = [
    {
      icon: <FiTruck />,
      title: "Free Shipping",
      text: "Enjoy free delivery on orders above ₹999.",
    },
    {
      icon: <FiRefreshCcw />,
      title: "Easy Returns",
      text: "Simple and hassle-free returns within 7 days.",
    },
    {
      icon: <FiShield />,
      title: "Secure Payment",
      text: "Your payments and personal details stay protected.",
    },
    {
      icon: <FiHeadphones />,
      title: "24/7 Support",
      text: "We're always here whenever you need us.",
    },
  ];

  return (
    <section className="why-section">

      {/* HEADING */}

      <div className="why-heading">

        <p className="why-label">
          WHY VELORA
        </p>

        <h2>
          More Than <span>Just Fashion</span>
        </h2>

        <p className="why-description">
          We make every part of your shopping experience
          simple, comfortable, and effortless.
        </p>

      </div>


      {/* BENEFITS */}

      <div className="benefits-grid">

        {benefits.map((benefit, index) => (

          <div
            className="benefit-card"
            key={index}
          >

            <div className="benefit-icon">
              {benefit.icon}
            </div>

            <p className="benefit-number">
              0{index + 1}
            </p>

            <h3>
              {benefit.title}
            </h3>

            <p className="benefit-text">
              {benefit.text}
            </p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default WhyVelora;