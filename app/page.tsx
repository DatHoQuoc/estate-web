"use client"

import { useRouter } from "next/navigation"
import { Building2, Users, ArrowRight, CheckCircle, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">PL</span>
            </div>
            <span className="text-xl font-semibold text-foreground">PropList</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/seller")}>
              Seller Portal
            </Button>
            <Button variant="ghost" onClick={() => router.push("/staff")}>
              Staff Portal
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Smart Real Estate Listing Platform
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Create, validate, and publish property listings with AI-powered verification 
            and streamlined staff review workflows.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push("/seller")}>
              <Building2 className="mr-2 h-5 w-5" />
              Seller Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/staff")}>
              <Users className="mr-2 h-5 w-5" />
              Staff Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-foreground">
            Platform Features
          </h2>
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
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-foreground">
            Choose Your Portal
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Seller Portal */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push("/seller")}>
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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push("/staff")}>
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

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>PropList - Smart Real Estate Listing Platform</p>
          <p className="mt-1">Powered by AI validation and streamlined review workflows</p>
        </div>
      </footer>
    </div>
  )
}
