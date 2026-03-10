import { useNavigate } from "react-router-dom";
import { Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection({ scrollY }: { scrollY: number }) {
  const navigate = useNavigate();

  const { innerHeight: h, innerWidth: w } = window;
  const offset = (Math.max(0, scrollY - 100) / h) * Math.max(0, w - 1100);

  return (
    <section className="h-screen overflow-hidden flex justify-center text-white">
      <div
        className="text-center py-32 rounded-b-[2.5rem] md:rounded-b-[4rem] bg-cover bg-center w-full max-w-screen"
        style={{
          width: Math.min(w, 1250 + offset) || "100%",
          height: 567 + offset || "100%",
          backgroundImage: "linear-gradient(to top ,#0006, #0002), url('/cover-2.jpg')",
          transition: "width 0.1s ease-out, height 0.1s ease-out",
        }}
      >
        <h1 className="text-4xl md:text-6xl font-bold px-4 tracking-tight drop-shadow-md">
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 p-4 w-fit mx-auto rounded-xl shadow-lg border border-white/10 backdrop-blur-sm mb-4">
            Automated & AI Powered
          </div>
          <div>Real Estate Listing Platform</div>
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto px-4 text-emerald-50 drop-shadow-sm font-medium">
          Create, validate, and publish property listings with AI-powered verification and streamlined staff review
          workflows.
        </p>
        <div className="mt-10 flex min-sm:flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <Button size="lg" onClick={() => navigate("/seller")} className="shadow-xl hover:scale-105 transition-transform duration-300">
            <Building2 className="mr-2 h-5 w-5" />
            Seller Dashboard
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/staff")} className="shadow-xl bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white hover:scale-105 transition-all duration-300">
            <Users className="mr-2 h-5 w-5" />
            Staff Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}
