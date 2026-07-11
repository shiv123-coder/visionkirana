import { motion } from "framer-motion"

export function ProblemStatement() {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              The $300B Credit Gap
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Millions of informal merchants, Kirana stores, and rural retailers are excluded from formal credit. Why? They lack formal financial statements, CIBIL scores, and digital footprints.
            </p>
            <p className="text-lg text-muted-foreground">
              Traditional underwriting models fail them. Banks see them as "unscorable." VisionKirana changes the paradigm by analyzing what they *do* have: inventory, daily cash flows, and physical shop presence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-background border rounded-2xl p-6 shadow-sm">
              <div className="text-4xl font-bold text-destructive mb-2">90%</div>
              <p className="text-sm font-medium">of Kirana stores lack formal accounting software.</p>
            </div>
            <div className="bg-background border rounded-2xl p-6 shadow-sm translate-y-8">
              <div className="text-4xl font-bold text-warning mb-2">$300B</div>
              <p className="text-sm font-medium">Estimated MSME credit gap in emerging markets.</p>
            </div>
            <div className="bg-background border rounded-2xl p-6 shadow-sm">
              <div className="text-4xl font-bold text-muted-foreground mb-2">0</div>
              <p className="text-sm font-medium">Credit history for most first-time borrowers.</p>
            </div>
            <div className="bg-background border rounded-2xl p-6 shadow-sm translate-y-8">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-sm font-medium">Physical inventory & shelf data ignored by banks.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
