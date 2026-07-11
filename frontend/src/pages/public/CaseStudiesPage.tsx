import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrendingUp, Clock, AlertTriangle } from "lucide-react";

export function CaseStudiesPage() {
  const studies = [
    {
      company: "Apex Financial",
      industry: "NBFC",
      metrics: [
        { label: "Loan Approval Rate", value: "+42%", icon: <TrendingUp className="h-5 w-5 text-green-500" /> },
        { label: "Processing Time", value: "-75%", icon: <Clock className="h-5 w-5 text-blue-500" /> },
        { label: "Default Rate", value: "-1.2%", icon: <AlertTriangle className="h-5 w-5 text-red-500" /> }
      ],
      challenge: "Apex Financial struggled to verify the income and identity of unbanked Kirana store owners, leading to high rejection rates and a manual underwriting process that took 5-7 days per application.",
      solution: "By integrating VisionKirana's facial recognition and document processing APIs, Apex automated KYC and extracted transaction history directly from physical ledger photos.",
      outcome: "Loan processing was reduced to under 24 hours. The alternative credit scoring model allowed Apex to confidently approve 42% more loans while simultaneously reducing their default rate."
    },
    {
      company: "MicroLend India",
      industry: "Microfinance",
      metrics: [
        { label: "Total Disbursements", value: "$12M", icon: <TrendingUp className="h-5 w-5 text-green-500" /> },
        { label: "Fraud Incidents", value: "-90%", icon: <AlertTriangle className="h-5 w-5 text-red-500" /> },
        { label: "Time to Decision", value: "Real-time", icon: <Clock className="h-5 w-5 text-blue-500" /> }
      ],
      challenge: "Rampant identity fraud and fabricated wholesale receipts were causing significant losses in MicroLend's new tier-3 city expansion strategy.",
      solution: "MicroLend deployed VisionKirana's mobile SDK to their field agents. Agents now snap photos of applicants and their shop inventory for instant AI verification.",
      outcome: "Fraud incidents plummeted by 90% in the first quarter. The real-time decision engine enabled agents to disburse micro-loans on the spot, expanding their portfolio safely to $12M."
    },
    {
      company: "Bharat Supply Chain",
      industry: "B2B E-commerce",
      metrics: [
        { label: "Merchant Onboarding", value: "3 mins", icon: <Clock className="h-5 w-5 text-blue-500" /> },
        { label: "Credit Line Usage", value: "+60%", icon: <TrendingUp className="h-5 w-5 text-green-500" /> },
        { label: "NPA Rate", value: "0.8%", icon: <AlertTriangle className="h-5 w-5 text-red-500" /> }
      ],
      challenge: "Bharat Supply Chain wanted to offer 'Buy Now, Pay Later' (BNPL) to their retail partners but lacked the underwriting infrastructure to assess the creditworthiness of small mom-and-pop shops.",
      solution: "VisionKirana's API was directly integrated into their B2B app. The model analyzed purchase velocity and payment history on the platform combined with external alternative data.",
      outcome: "Merchant onboarding dropped to just 3 minutes. The dynamic credit lines resulted in a 60% increase in platform GMV with an industry-leading non-performing asset (NPA) rate of just 0.8%."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-24 bg-card text-card-foreground text-center px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Proven <span className="text-primary">Impact</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              See how leading financial institutions are using VisionKirana to scale their lending operations and drive financial inclusion.
            </p>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20 px-4 container mx-auto">
          <div className="space-y-24 max-w-5xl mx-auto">
            {studies.map((study, index) => (
              <div key={index} className="bg-card border rounded-3xl p-8 md:p-12 shadow-sm flex flex-col lg:flex-row gap-12">
                
                {/* Left Column: Context & Metrics */}
                <div className="lg:w-1/3">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">{study.company}</h2>
                    <span className="text-primary font-medium tracking-wide uppercase text-sm">{study.industry}</span>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Impact Metrics</h4>
                    {study.metrics.map((metric, mIndex) => (
                      <div key={mIndex} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex items-center gap-3">
                          {metric.icon}
                          <span className="font-medium">{metric.label}</span>
                        </div>
                        <span className="text-xl font-bold">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Story */}
                <div className="lg:w-2/3 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">1</div>
                      The Challenge
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">2</div>
                      The Solution
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{study.solution}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">3</div>
                      The Outcome
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{study.outcome}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
