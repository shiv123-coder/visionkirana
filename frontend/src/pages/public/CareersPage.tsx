import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Heart, Laptop, Zap, Globe2 } from "lucide-react";

export function CareersPage() {
  const benefits = [
    { icon: <Laptop className="h-8 w-8 text-primary" />, title: "Remote-First", desc: "Work from anywhere in India with a top-tier home office setup stipend." },
    { icon: <Heart className="h-8 w-8 text-primary" />, title: "Comprehensive Health", desc: "Premium medical, dental, and vision coverage for you and your dependents." },
    { icon: <Zap className="h-8 w-8 text-primary" />, title: "Unlimited PTO", desc: "Take the time you need to recharge. We focus on output, not hours logged." },
    { icon: <Globe2 className="h-8 w-8 text-primary" />, title: "Learning Budget", desc: "$1,500 annual stipend for courses, conferences, and professional development." }
  ];

  const positions = [
    { title: "Senior Machine Learning Engineer", department: "Engineering", location: "Remote, India", type: "Full-time" },
    { title: "Frontend Developer (React/Vite)", department: "Engineering", location: "Remote, India", type: "Full-time" },
    { title: "Credit Risk Analyst", department: "Data & Risk", location: "Mumbai / Remote", type: "Full-time" },
    { title: "Enterprise Account Executive", department: "Sales", location: "Bangalore / Remote", type: "Full-time" }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-24 bg-card text-card-foreground text-center px-4 border-b">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Build the Future of <span className="text-primary">Financial Inclusion</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Join a team of builders, researchers, and finance veterans dedicated to unlocking credit for the next hundred million merchants.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-4 container mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Why VisionKirana?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20 bg-muted/30 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-10">Open Roles</h2>
            <div className="space-y-4">
              {positions.map((job, index) => (
                <div key={index} className="bg-card border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="bg-secondary px-2 py-1 rounded">{job.department}</span>
                      <span className="flex items-center">{job.location}</span>
                      <span className="flex items-center">{job.type}</span>
                    </div>
                  </div>
                  <button className="bg-primary/10 text-primary font-medium px-6 py-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center bg-card p-8 rounded-2xl border border-dashed">
              <h4 className="text-lg font-semibold mb-2">Don't see a fit?</h4>
              <p className="text-muted-foreground mb-4">We are always looking for exceptional talent. Send your resume to <a href="mailto:careers@visionkirana.com" className="text-primary hover:underline">careers@visionkirana.com</a></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
