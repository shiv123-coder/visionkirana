import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";

export function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-24 bg-card text-card-foreground text-center px-4 border-b">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Whether you're an NBFC looking to scale, or a developer with a question, our team is ready to help.
            </p>
          </div>
        </section>

        <section className="py-20 px-4 container mx-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  We strive to respond to all inquiries within our service level agreement (SLA) of 24 hours. For critical support issues, please use the dedicated support portal.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Email</h4>
                    <p className="text-muted-foreground mt-1">Sales: sales@visionkirana.com</p>
                    <p className="text-muted-foreground">Support: support@visionkirana.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Headquarters</h4>
                    <p className="text-muted-foreground mt-1">
                      Tower B, TechPark Avenue<br />
                      Whitefield, Bangalore, Karnataka<br />
                      India 560066
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Phone</h4>
                    <p className="text-muted-foreground mt-1">+91 (080) 4567-8900</p>
                    <p className="text-sm text-muted-foreground mt-1">Mon-Fri from 9am to 6pm IST.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Send a Message</h3>
              </div>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input type="text" className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input type="text" className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Work Email</label>
                  <input type="email" className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="john@company.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <input type="text" className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Apex Financial" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">How can we help?</label>
                  <textarea rows={4} className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Tell us about your lending operations..."></textarea>
                </div>

                <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors">
                  Submit Request
                </button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  By submitting this form, you agree to our Privacy Policy and Terms of Service.
                </p>
              </form>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
