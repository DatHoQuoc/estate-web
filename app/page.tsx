import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Building2, Users, ArrowRight, CheckCircle, Shield, Zap, MapPinHouse } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import PageFooter from "@/components/common/page-footer";
import { Navbar } from "@/components/layout/navbar";
import { mockUser } from "@/lib/mock-data";

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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <ScrollingImage />
      <LandingPageHeader />
      <HeroSection />

      {/* Features */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-foreground">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Validation</CardTitle>
                <CardDescription>
                  Automated checks for image quality, duplicate detection, and content policy compliance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-emerald-500/10 mb-2">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Streamlined Reviews</CardTitle>
                <CardDescription>
                  Efficient staff review workflow with checklists, notes, and action tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-amber-500/10 mb-2">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>
                  Multi-step verification ensures only high-quality listings are published.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-foreground">Choose Your Portal</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Seller Portal */}
            <Card className="transition-shadow cursor-pointer group" onClick={() => navigate("/seller")}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Seller Portal</CardTitle>
                    <CardDescription>Property owners and brokers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Create and manage property listings
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Multi-step listing form with validation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Track listing status and views
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    AI feedback and suggested improvements
                  </li>
                </ul>
                <Button className="w-full group-hover:bg-primary/90">
                  Open Seller Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Staff Portal */}
            <Card className="transition-shadow cursor-pointer group" onClick={() => navigate("/staff")}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Staff Portal</CardTitle>
                    <CardDescription>Review team members</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Priority-based review queue
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    AI validation results and confidence scores
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Manual review checklist
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Approve, request edits, or reject listings
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-muted bg-transparent">
                  Open Staff Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}

function ScrollingImage() {
  // const scrollY = useScrollY();

  // return (
  //   <img
  //     src="/cover.jpg"
  //     className="w-screen fixed top-0 -z-10"
  //     style={{
  //       transform: `translateY(-${scrollY * 1.5}px)`,
  //       objectFit: "cover",
  //     }}
  //   />
  // );

  return <></>;
}

function LandingPageHeader() {
  const scrollY = useScrollY();

  return (
    <header className={"mb-8 sticky top-0 z-1 "} style={{ background: `rgba(255,255,255, ${(scrollY - 400) / 400})` }}>
      <div className="px-4 py-2 max-w-[1300px] mx-auto">
        <Navbar user={mockUser} />
      </div>
    </header>
  );
}

function HeroSection() {
  const s = useScrollY();
  const navigate = useNavigate();

  const { innerHeight: h, innerWidth: w } = window;
  const offset = (Math.max(0, s - 100) / h) * Math.max(0, w - 1100);

  return (
    <section className="h-screen overflow-hidden flex justify-center text-white">
      <div
        className="text-center py-32 rounded-3xl bg-cover max-w-screen bg-no-repeat"
        style={{
          width: Math.min(w, 1250 + offset),
          height: 567 + offset,
          backgroundImage: "linear-gradient(to top ,#0006, #0001), url('/cover-2.jpg')",
        }}
      >
        <h1 className="text-4xl md:text-6xl font-bold">
          <div className="bg-linear-to-r from-blue-500 via-purple-700 to-blue-700 p-4 w-fit mx-auto rounded-xl">
            Automated & AI Powered
          </div>
          <div>Real Estate Listing Platform</div>
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto">
          Create, validate, and publish property listings with AI-powered verification and streamlined staff review
          workflows.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" onClick={() => navigate("/seller")}>
            <Building2 className="mr-2 h-5 w-5" />
            Seller Dashboard
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/staff")}>
            <Users className="mr-2 h-5 w-5" />
            Staff Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}
