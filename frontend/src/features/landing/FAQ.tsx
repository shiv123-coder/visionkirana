import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How accurate is the Image Analysis?",
    answer: "Our proprietary models are trained on over 500,000 images of Indian Kirana stores. They estimate shelf density and brand diversity with over 88% accuracy compared to manual human audits."
  },
  {
    question: "Do we need an internet connection at the shop?",
    answer: "No. The VisionKirana field app works offline-first as a PWA. Loan officers can capture images, voice notes, and data offline. The app automatically syncs and processes the data once a connection is established."
  },
  {
    question: "Can it read handwritten notebooks?",
    answer: "Yes, our Financial OCR module is specifically tuned for regional handwriting and non-standard ledger formats (bahi-khatas), extracting key financial figures to reconstruct a cash flow statement."
  },
  {
    question: "How do you ensure data privacy?",
    answer: "All data is encrypted in transit and at rest. We employ enterprise-grade Role-Based Access Control (RBAC). Images and voice notes are processed temporarily and can be anonymized based on your institution's compliance needs."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-xl bg-background overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-foreground">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
