import { motion } from "framer-motion"
import { Scan, Mic, Image as ImageIcon } from "lucide-react"

const modules = [
  {
    icon: ImageIcon,
    title: "Computer Vision Analysis",
    description: "Deep learning models analyze shop images to estimate shelf density, brand diversity, and physical inventory value.",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary"
  },
  {
    icon: Scan,
    title: "Financial OCR",
    description: "Extract line items, totals, and vendor details from informal, handwritten bahi-khatas (ledgers) and crumpled invoices.",
    color: "from-secondary/20 to-secondary/5",
    iconColor: "text-secondary"
  },
  {
    icon: Mic,
    title: "Voice-to-Text Underwriting",
    description: "NLP processes the merchant's voice notes in regional languages, assessing sentiment and business confidence.",
    color: "from-warning/20 to-warning/5",
    iconColor: "text-warning"
  }
]

export function IntelligenceModules() {
  return (
    <section id="intelligence" className="py-24 bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16">
          <span className="text-secondary font-semibold tracking-wider uppercase text-sm">Proprietary AI</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2">Intelligence Modules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modules.map((mod, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-8 rounded-2xl border bg-gradient-to-b ${mod.color} backdrop-blur-sm shadow-sm hover:shadow-xl transition-all`}
            >
              <div className="w-14 h-14 bg-background rounded-xl flex items-center justify-center mb-6 shadow-sm border">
                <mod.icon className={`w-7 h-7 ${mod.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-card-foreground">{mod.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{mod.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
