import Hero from "../components/landing/Hero";
import WhyUs from "../components/landing/WhyUs";
import FeaturedProduct from "../components/landing/FeaturedProduct";
import MeetPharmacist from "../components/landing/MeetPharmacist";
import Support from "../components/landing/Support";
import Services from "../components/landing/Services";
import Footer from "../components/landing/Footer";
import "../index.css";

export default function LandingBuyer() {
    return (
        <div className="landing-wrapper">
            <Hero />
            <WhyUs />
            <FeaturedProduct />
            <MeetPharmacist />
            <Support />
            <Services />
            <Footer />
        </div>
    );
}
