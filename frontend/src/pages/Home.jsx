
import Hero from "../components/Hero";
import Categories from "../components/categories";
import FeaturedProducts from "../components/featuredproducts";
import OfferCarousel from "../components/offer-carousel";
import WhyVelora from "../components/whyvelora";
import FinalCTA from "../components/finalcta";
import ShoppingAgent from "../components/shoppingagent";



function Home() {
    return (
        <div>
            <Hero />
            <Categories />
            <FeaturedProducts />
            <OfferCarousel />
            <WhyVelora />
            <FinalCTA />
            <ShoppingAgent />
        </div>
    );
}

export default Home;