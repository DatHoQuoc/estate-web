import { useNavigate } from "react-router-dom";
import { Building2, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PortalCardsSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 bg-white dark:bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Choose Your Portal</h2>
          <p className="text-muted-foreground w-full max-w-lg mx-auto">Access the specialized tools tailored perfectly to your role.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Seller Portal */}
          <Card 
            className="group cursor-pointer border shadow-sm hover:shadow-2xl transition-all duration-400 overflow-hidden relative" 
            onClick={() => navigate("/seller")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Seller Portal</CardTitle>
                  <CardDescription className="text-base mt-1">Property owners and brokers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Create and manage property listings with ease</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Multi-step, intuitive listing form with instant validation</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Track detailed listing status and viewer engagement</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Receive continuous AI feedback and suggested dynamic improvements</span>
                </li>
              </ul>
              <Button size="lg" className="w-full text-md shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
                Open Seller Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Staff Portal */}
          <Card 
            className="group cursor-pointer border shadow-sm hover:shadow-2xl transition-all duration-400 overflow-hidden relative" 
            onClick={() => navigate("/staff")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-blue-500/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Staff Portal</CardTitle>
                  <CardDescription className="text-base mt-1">Review team members</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Manage priority-based, intelligent review queues</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Access robust AI validation results and confident scoring</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Interactive and detailed manual review checklist tools</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Seamlessly approve, request critical edits, or outright reject listings</span>
                </li>
              </ul>
              <Button size="lg" variant="outline" className="w-full text-md bg-transparent group-hover:bg-muted shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5 border-blue-200 hover:border-blue-300 hover:text-blue-900">
                Open Staff Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
