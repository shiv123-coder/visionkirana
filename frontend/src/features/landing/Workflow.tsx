import { motion } from "framer-motion"

export function Workflow() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">Credit Intelligence Workflow</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">From unstructured real-world data to actionable financial insights in seconds.</p>
        </div>

        <div className="relative max-w-5xl mx-auto">
           {/* Complex workflow visualization using CSS/Framer Motion instead of static images */}
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              
              {/* Input */}
              <motion.div 
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                className="w-full md:w-1/3 p-6 bg-card rounded-2xl border shadow-lg"
              >
                <h4 className="font-bold mb-4 border-b pb-2">Unstructured Input</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Shop Images</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-secondary" /> Handwritten Bills</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning" /> Voice Notes</li>
                </ul>
              </motion.div>

              {/* Processing Engine */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border-4 border-dashed border-primary/50 flex items-center justify-center shrink-0"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">Engine</span>
                </div>
              </motion.div>

              {/* Output */}
              <motion.div 
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                className="w-full md:w-1/3 p-6 bg-card rounded-2xl border shadow-lg"
              >
                <h4 className="font-bold mb-4 border-b pb-2">Structured Output</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Credit Score</span> <span className="font-bold text-success">780</span></div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden"><div className="w-[78%] h-full bg-success" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Est. Revenue</span> <span className="font-bold text-primary">₹1.2L/mo</span></div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden"><div className="w-[60%] h-full bg-primary" /></div>
                  </div>
                </div>
              </motion.div>

           </div>
           
           {/* Decorative background lines */}
           <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent -z-0 hidden md:block" />
        </div>
      </div>
    </section>
  )
}
