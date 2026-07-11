import { motion } from "framer-motion"

const testimonials = [
  {
    quote: "VisionKirana allowed us to underwrite 500 new rural merchants in a month. The image analysis of their inventory was the game changer.",
    author: "Rahul Sharma",
    role: "Credit Risk Head, MicroFin India"
  },
  {
    quote: "Our loan officers simply take a picture of the shop and the bahi-khata. The app does the rest. It's incredibly fast.",
    author: "Anita Desai",
    role: "Operations Manager, RuralCredit"
  },
  {
    quote: "Before this, we had to reject informal stores because we couldn't verify their income. Now, the AI estimates revenue with 85% accuracy.",
    author: "Vikram Singh",
    role: "CEO, CapitalTrust"
  }
]

export function Testimonials() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Trusted by Leading NBFCs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-8 rounded-2xl bg-card border shadow-sm flex flex-col justify-between"
            >
              <div className="mb-6">
                {/* SVG Quote Icon */}
                <svg className="w-8 h-8 text-primary/40 mb-4" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-foreground text-lg leading-relaxed">{t.quote}</p>
              </div>
              <div>
                <p className="font-bold text-foreground">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
