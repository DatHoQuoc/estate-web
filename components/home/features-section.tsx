import { Zap, CheckCircle, Shield } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-zinc-950/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Platform Features</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to manage your real estate operations efficiently and effectively.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-8">
              <div className="p-3 w-fit rounded-2xl bg-blue-500/10 mb-6 shadow-inner">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl mb-2">AI-Powered Validation</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Automated checks for image quality, duplicate detection, and content policy compliance ensuring only the best listings go live.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-8">
              <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 mb-6 shadow-inner">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Streamlined Reviews</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Efficient staff review workflow with integrated checklists, detailed contextual notes, and comprehensive action trackings.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-8">
              <div className="p-3 w-fit rounded-2xl bg-amber-500/10 mb-6 shadow-inner">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Quality Assurance</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Robust multi-step verification safeguards the platform, ensuring only high-quality, verified listings are ever published.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
