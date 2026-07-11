import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/features/landing/HeroSection"
import { ProblemStatement } from "@/features/landing/ProblemStatement"
import { HowItWorks } from "@/features/landing/HowItWorks"
import { IntelligenceModules } from "@/features/landing/IntelligenceModules"
import { Workflow } from "@/features/landing/Workflow"
import { Features } from "@/features/landing/Features"
import { Testimonials } from "@/features/landing/Testimonials"
import { FAQ } from "@/features/landing/FAQ"
import { Contact } from "@/features/landing/Contact"

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemStatement />
        <HowItWorks />
        <IntelligenceModules />
        <Workflow />
        <Features />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
