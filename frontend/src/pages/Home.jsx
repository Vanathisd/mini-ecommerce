
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/featuredproducts";
import OfferCarousel from "../components/offer-carousel";
import WhyVelora from "../components/whyvelora";
import FinalCTA from "../components/finalcta";




function Home() {
    return (
        <div>
            <Hero />
            <Categories />
            <FeaturedProducts />
            <OfferCarousel />
            <WhyVelora />
            <FinalCTA />
        </div>
    );
}

export default Home;