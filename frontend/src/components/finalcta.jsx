import { FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="final-cta">

      <div className="final-cta-content">

        <p className="final-cta-label">
          YOUR STYLE. YOUR STORY.
        </p>

        <h2>
          Your Style
          <br />
          <span>Starts Here.</span>
        </h2>

        <p className="final-cta-description">
          Discover fashion and lifestyle pieces made to
          become part of your everyday story.
        </p>

        <button
    className="final-cta-btn"
    onClick={() => navigate("/shop")}
>
    Shop the Collection
    <FiArrowUpRight />
</button>

      </div>


      <div className="final-cta-decoration">

        <span>VELORA</span>

      </div>

    </section>
  );
}

export default FinalCTA;