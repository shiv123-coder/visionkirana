import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-36 lg:pb-40">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute top-48 -left-24 w-72 h-72 bg-secondary rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Next-Gen Underwriting Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8">
            Credit Intelligence for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Invisible Businesses
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10">
            VisionKirana transforms shop images, shelf data, and informal receipts into bank-grade credit scores. Empowering Kirana stores and rural retail.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button variant="premium" size="lg">Start Underwriting</Button>
            </Link>
            <a href={import.meta.env.VITE_DEMO_VIDEO_URL || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"} target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg">View Demo</Button>
            </a>
          </div>
        </motion.div>

        {/* Abstract Data Ingestion Graphic */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 mx-auto max-w-4xl h-64 md:h-96 rounded-2xl border bg-card/50 backdrop-blur shadow-2xl overflow-hidden relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="flex items-center gap-8 z-10">
             <div className="flex flex-col gap-4">
               <div className="w-32 h-24 bg-card rounded-lg shadow border flex items-center justify-center text-sm font-medium text-muted-foreground">Store Front</div>
               <div className="w-32 h-24 bg-card rounded-lg shadow border flex items-center justify-center text-sm font-medium text-muted-foreground">Invoices</div>
             </div>
             <div className="h-1 bg-gradient-to-r from-border to-primary w-24 relative">
               <motion.div 
                 animate={{ x: ["0%", "100%"] }} 
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="absolute top-0 left-0 w-4 h-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
               />
             </div>
             <div className="w-48 h-48 bg-card rounded-full shadow-xl border-4 border-primary flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">780</span>
                <span className="text-sm text-success font-medium">Low Risk</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
