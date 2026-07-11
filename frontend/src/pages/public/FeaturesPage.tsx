import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Zap, BarChart3, ScanFace, FileText, Smartphone } from "lucide-react";

export function FeaturesPage() {
  const features = [
    {
      icon: <ScanFace className="h-10 w-10 text-primary" />,
      title: "Facial Recognition Intelligence",
      description: "Our proprietary AI seamlessly verifies identity using enterprise-grade facial mapping against national IDs, ensuring absolute trust in onboarding and loan applications.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Automated Document Processing",
      description: "Vision-based intelligence automatically extracts, categorizes, and validates financial documents, eliminating manual entry and reducing processing time by up to 80%.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Alternative Credit Scoring",
      description: "Go beyond traditional credit scores. We analyze daily transactions, supply chain velocity, and local market dynamics to build a highly accurate risk profile.",
    },
    {
      icon: <Smartphone className="h-10 w-10 text-primary" />,
      title: "Mobile-First Accessibility",
      description: "Designed specifically for the Kirana store environment. Low bandwidth requirements, intuitive vernacular interfaces, and rapid response times.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Bank-Grade Security",
      description: "End-to-end encryption, SOC2 compliance, and zero-trust architecture protect both the merchant's data and the financial institution's capital.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Real-Time Fraud Detection",
      description: "Our neural networks constantly monitor behavioral anomalies and geospatial inconsistencies to flag potential fraud before capital is deployed.",
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-24 bg-card text-card-foreground text-center px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Intelligence that <span className="text-primary">Understands</span> Retail
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover the full suite of computer vision and machine learning tools designed to bridge the gap between formal credit and the informal economy.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-4 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6 bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-24 bg-primary text-primary-foreground text-center px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Underwriting?</h2>
            <p className="text-xl opacity-90 mb-10">
              Join leading financial institutions leveraging VisionKirana to safely deploy capital to millions of informal merchants.
            </p>
            <button className="bg-background text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-opacity-90 transition-opacity">
              Schedule a Demo
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
