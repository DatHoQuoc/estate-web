import { useEffect, useState } from "react";

import PageFooter from "@/components/common/page-footer";
import { Navbar } from "@/components/layout/navbar";
import { mockUser } from "@/lib/mock-data";

import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { PortalCardsSection } from "@/components/home/portal-cards-section";

function useScrollY() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

export default function HomePage() {
  const scrollY = useScrollY();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollingImage />
      <LandingPageHeader scrollY={scrollY} />
      <main className="flex-grow">
        <HeroSection scrollY={scrollY} />
        <FeaturesSection />
        <PortalCardsSection />
      </main>
      <PageFooter />
    </div>
  );
}

function ScrollingImage() {
  return <></>;
}

function LandingPageHeader({ scrollY }: { scrollY: number }) {
  return (
    <header className={"mb-8 sticky top-0 z-50 transition-colors duration-300 backdrop-blur-sm"} style={{ background: `rgba(255,255,255, ${Math.min(0.9, Math.max(0, (scrollY - 50) / 200))})` }}>
      <div className="px-4 py-3 max-w-[1300px] mx-auto">
        <Navbar />
      </div>
    </header>
  );
}
