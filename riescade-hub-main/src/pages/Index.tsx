import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ScreenshotsSection from "@/components/ScreenshotsSection";
import PricingSection from "@/components/PricingSection";
import ProductSection from "@/components/ProductSection";
import BlogSection from "@/components/BlogSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <ScreenshotsSection />
        <PricingSection />
        <ProductSection />
        <BlogSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
