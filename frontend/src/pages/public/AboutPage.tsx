import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function AboutPage() {
  const team = [
    { name: "Rahul Sharma", role: "CEO & Co-founder", exp: "Ex-Stripe, 10+ yrs in Fintech" },
    { name: "Priya Patel", role: "CTO & Co-founder", exp: "Ex-Google AI, PhD Computer Vision" },
    { name: "Amit Kumar", role: "Head of Credit Risk", exp: "Ex-HDFC Bank, 15+ yrs underwriting" },
    { name: "Sarah Jones", role: "VP of Engineering", exp: "Ex-Plaid, Scaled distributed systems" }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-24 bg-card text-card-foreground text-center px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Empowering the <span className="text-primary">Informal Economy</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are building the intelligence layer that connects millions of unbanked micro-merchants to the formal financial system.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 px-4 container mx-auto">
          <div className="max-w-3xl mx-auto space-y-8 text-lg text-muted-foreground leading-relaxed">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p>
              In 2023, our founders witnessed a stark reality: despite processing millions in daily transactions, local Kirana stores were routinely rejected for basic working capital loans. The reason wasn't poor financial health, but a lack of formal documentation and traditional credit history.
            </p>
            <p>
              VisionKirana was born out of the belief that technology can bridge this trust deficit. We saw an opportunity to leverage recent advancements in computer vision and machine learning to turn unstructured data—handwritten ledgers, physical store inventory, and informal receipts—into structured, verifiable credit intelligence.
            </p>
            <p>
              Today, we partner with leading banks, NBFCs, and fintechs, providing them with the infrastructure to safely and profitably underwrite the next hundred million merchants.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-primary/5 px-4">
          <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-12">
            <div className="bg-card p-8 rounded-2xl border">
              <h3 className="text-2xl font-bold mb-4 text-primary">Our Mission</h3>
              <p className="text-muted-foreground">
                To democratize access to capital by building the world's most accurate alternative credit intelligence platform for the informal retail sector.
              </p>
            </div>
            <div className="bg-card p-8 rounded-2xl border">
              <h3 className="text-2xl font-bold mb-4 text-primary">Our Vision</h3>
              <p className="text-muted-foreground">
                A world where every merchant, regardless of size or documentation status, has the opportunity to grow their business through fair and accessible financial services.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-24 px-4 container mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Leadership Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="w-40 h-40 mx-auto bg-muted rounded-full mb-6 overflow-hidden border-4 border-background shadow-lg group-hover:border-primary transition-colors flex items-center justify-center">
                     <span className="text-4xl font-bold text-muted-foreground/30">{member.name.charAt(0)}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-1">{member.name}</h4>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.exp}</p>
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
