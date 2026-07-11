import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function PrivacyPolicyPage() {
  const lastUpdated = "June 24, 2026";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-24 px-4 container mx-auto">
          <div className="max-w-4xl mx-auto bg-card border rounded-3xl p-8 md:p-16 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-12">Last Updated: {lastUpdated}</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p>
                  VisionKirana ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our alternative credit intelligence platform and APIs (collectively, the "Services").
                </p>
                <p className="mt-4">
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect via the Services includes:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the Services.</li>
                  <li><strong>Financial Data:</strong> Data related to your business operations, including ledger images, transaction history, and inventory photos uploaded through our application or via our partner financial institutions.</li>
                  <li><strong>Biometric Data:</strong> Facial mapping data used strictly for identity verification purposes during the onboarding process, in compliance with applicable local regulations.</li>
                  <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Services, such as your IP address, browser type, and operating system.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Use of Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Services to:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Generate alternative credit scores and risk profiles for lending partners.</li>
                  <li>Verify identity and prevent fraudulent transactions.</li>
                  <li>Train and improve our computer vision and machine learning models (using anonymized and aggregated data only).</li>
                  <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                  <li>Deliver targeted advertising, newsletters, and other information regarding promotions and the Services to you.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Disclosure of Your Information</h2>
                <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                  <li><strong>Partner Financial Institutions:</strong> With your explicit consent, we share generated risk profiles and verified documents with the specific bank or NBFC you are applying for a loan with.</li>
                  <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, and customer service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Security of Your Information</h2>
                <p>
                  We use administrative, technical, and physical security measures to help protect your personal information. We employ bank-grade encryption (AES-256) at rest and in transit (TLS 1.3). While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
                <div className="mt-4 p-4 bg-muted rounded-lg inline-block">
                  <p className="font-medium text-foreground">VisionKirana Privacy Team</p>
                  <p>Tower B, TechPark Avenue</p>
                  <p>Bangalore, Karnataka 560066</p>
                  <p>Email: privacy@visionkirana.com</p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
