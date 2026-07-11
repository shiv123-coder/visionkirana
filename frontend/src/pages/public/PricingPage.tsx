import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, HelpCircle } from "lucide-react";

export function PricingPage() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for emerging NBFCs testing alternative credit models.",
      price: "$499",
      period: "/month",
      features: [
        "Up to 1,000 merchant profiles/mo",
        "Basic alternative credit scoring",
        "Standard document OCR (KYC)",
        "Email support (24h SLA)",
      ],
      isPopular: false,
    },
    {
      name: "Growth",
      description: "For scaling fintechs deploying capital aggressively.",
      price: "$1,499",
      period: "/month",
      features: [
        "Up to 10,000 merchant profiles/mo",
        "Advanced predictive scoring models",
        "Full document processing (KYC & Financials)",
        "Real-time fraud detection",
        "API access & Webhooks",
        "Priority support (4h SLA)",
      ],
      isPopular: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for tier-1 banks and large institutions.",
      price: "Custom",
      period: "",
      features: [
        "Unlimited merchant profiles",
        "Custom scoring model training",
        "On-premise deployment options",
        "Dedicated account manager",
        "Custom integrations (LMS, LOS)",
        "24/7 Phone & Email support",
      ],
      isPopular: false,
    }
  ];

  const faqs = [
    {
      q: "How does the pricing scale?",
      a: "Our pricing is tiered based on the volume of merchant profiles processed per month. As your volume grows, your per-profile cost decreases."
    },
    {
      q: "Do you charge setup fees?",
      a: "There are no setup fees for the Starter and Growth plans. Enterprise plans may incur setup fees depending on custom integration requirements."
    },
    {
      q: "Can we switch plans later?",
      a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be pro-rated for the current billing cycle."
    },
    {
      q: "What forms of payment do you accept?",
      a: "We accept all major credit cards, ACH transfers, and wire transfers for annual contracts."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-24 bg-card text-card-foreground text-center px-4">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Predictable costs that scale with your lending volume. No hidden fees or surprise charges.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-4 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-card rounded-2xl border p-8 flex flex-col ${plan.isPopular ? 'border-primary shadow-lg ring-1 ring-primary' : 'shadow-sm'}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-3 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.isPopular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border'}`}>
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-card/50 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div key={index} className="flex gap-4">
                  <HelpCircle className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h4 className="text-lg font-bold mb-2">{faq.q}</h4>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
