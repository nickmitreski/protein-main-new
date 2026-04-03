import Hero from '../../components/Hero';
import StatsBreak from '../../components/StatsBreak';
import AboutSection from '../../components/AboutSection';
import BestSellers from '../../components/BestSellers';
import ProductEducation from '../../components/ProductEducation';
import PerformanceSection from '../../components/PerformanceSection';
import ShopSection from '../../components/ShopSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import LifestyleSection from '../../components/LifestyleSection';
import PromotionsStrip from '../../components/PromotionsStrip';
import EmailCapture from '../../components/EmailCapture';
import FAQSection from '../../components/FAQSection';
import CTAStrip from '../../components/CTAStrip';

export function HomePage() {
  return (
    <>
      <Hero />
      <StatsBreak />
      <AboutSection />
      <BestSellers />
      <ProductEducation />
      <PerformanceSection />
      <ShopSection />
      <TestimonialsSection />
      <LifestyleSection />
      <PromotionsStrip />
      <EmailCapture />
      <FAQSection />
      <CTAStrip />
    </>
  );
}
