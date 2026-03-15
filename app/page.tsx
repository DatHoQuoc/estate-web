import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageFooter from "@/components/common/page-footer";

import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { PortalCardsSection } from "@/components/home/portal-cards-section";
import { useAuth } from "@/components/auth/AuthContext";

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
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/discover");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollingImage />
      <main className="grow pt-4">
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
