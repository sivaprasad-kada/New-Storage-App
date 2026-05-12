import React, { useEffect } from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import TrustedSection from './TrustedSection';
import FeaturesSection from './FeaturesSection';
import ShowcaseSection from './ShowcaseSection';
import WhyChooseSection from './WhyChooseSection';
import PricingSection from './PricingSection';
import CTASection from './CTASection';
import LandingFooter from './LandingFooter';

const LandingPage = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustedSection />
        <FeaturesSection />
        <ShowcaseSection />
        <WhyChooseSection />
        <PricingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
