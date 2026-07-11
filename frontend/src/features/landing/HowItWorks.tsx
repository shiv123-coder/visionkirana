import { motion } from "framer-motion"
import { Camera, FileText, Cpu, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Camera,
    title: "1. Capture Reality",
    description: "Merchant uploads photos of their shop front, inside shelves, and daily inventory."
  },
  {
    icon: FileText,
    title: "2. Digitize Cash Flow",
    description: "Scan handwritten receipts, vendor invoices, and notebooks."
  },
  {
    icon: Cpu,
    title: "3. AI Processing",
    description: "Vision models assess shelf density. OCR models parse invoices to calculate cash flow."
  },
  {
    icon: CheckCircle,
    title: "4. Credit Decision",
    description: "A comprehensive alternative credit score is generated instantly for the Loan Officer."
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-16">How VisionKirana Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
