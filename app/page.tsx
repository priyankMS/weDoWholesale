import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ValueStrip } from "@/components/landing/ValueStrip";
import { WhoSection } from "@/components/landing/WhoSection";
import { WhySection } from "@/components/landing/WhySection";
import { HowSection } from "@/components/landing/HowSection";
import { ProductsSection } from "@/components/landing/ProductsSection";
import { CertSection } from "@/components/landing/CertSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { StickyMobileCta } from "@/components/landing/StickyMobileCta";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="pb-18 lg:pb-0">
        <Hero />
        <ValueStrip />
        <WhoSection />
        <WhySection />
        <HowSection />
        <ProductsSection />
        <CertSection />
        <TestimonialsSection />
        <PricingSection />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
