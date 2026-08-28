
import Hero from "../components/Hero";
import Categories from "../components/categories";
import FeaturedProducts from "../components/featuredproducts";
import OfferCarousel from "../components/offer-carousel";
import WhyVelora from "../components/whyvelora";
import FinalCTA from "../components/finalcta";
import ShoppingAssistant from "../components/shoppingassistant";



function Home() {
    return (
        <div>
            <Hero />
            <Categories />
            <FeaturedProducts />
            <OfferCarousel />
            <WhyVelora />
            <FinalCTA />
            <ShoppingAssistant />
        </div>
    );
}

export default Home;