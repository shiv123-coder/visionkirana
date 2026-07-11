import { motion } from "framer-motion"
import { Check, Users, CreditCard, Activity, TrendingUp } from "lucide-react"

const features = [
  "Offline-first PWA Support",
  "Role-Based Access Control",
  "Bank-Grade Encryption",
  "Regional Language Support",
  "Automated Document Validation",
  "Customizable Scoring Models",
  "Real-time Dashboard Analytics",
  "API Integrations for NBFCs"
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-card border-y">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for Scale & Security</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you are a microfinance institution deploying loan officers to remote villages, or an NBFC integrating via API, VisionKirana provides the enterprise-grade foundation you need.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Mock Dashboard Representation */}
            <div className="aspect-[4/3] rounded-2xl bg-background border shadow-2xl p-4 overflow-hidden relative flex flex-col">
              {/* Window Controls */}
              <div className="w-full border-b pb-3 flex items-center justify-between mb-4 shrink-0">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-warning/80" />
                  <div className="w-3 h-3 rounded-full bg-success/80" />
                </div>
                <div className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded-md">VisionKirana Admin</div>
              </div>
              
              {/* Top Stat Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 shrink-0">
                <div className="bg-card border rounded-lg p-2 sm:p-3 flex flex-col justify-center">
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center justify-between">
                    Total Loans
                    <Users className="w-3 h-3 text-primary hidden sm:block" />
                  </div>
                  <div className="text-sm sm:text-lg font-bold">1,248</div>
                  <div className="text-[8px] sm:text-[10px] text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" /> +12%
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-2 sm:p-3 flex flex-col justify-center">
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center justify-between">
                    Active Portfolio
                    <CreditCard className="w-3 h-3 text-primary hidden sm:block" />
                  </div>
                  <div className="text-sm sm:text-lg font-bold">₹4.2 Cr</div>
                  <div className="text-[8px] sm:text-[10px] text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" /> +8%
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-2 sm:p-3 flex flex-col justify-center">
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center justify-between">
                    Risk Score
                    <Activity className="w-3 h-3 text-warning hidden sm:block" />
                  </div>
                  <div className="text-sm sm:text-lg font-bold">Low</div>
                  <div className="text-[8px] sm:text-[10px] text-muted-foreground mt-1 truncate">
                    System healthy
                  </div>
                </div>
              </div>
              
              {/* Main Chart Area */}
              <div className="flex-1 bg-card border rounded-lg w-full relative overflow-hidden flex flex-col p-3 sm:p-4">
                 <div className="text-xs font-semibold mb-2 sm:mb-4">Disbursement Trends</div>
                 {/* Fake bars for a chart */}
                 <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 pt-2 sm:pt-4">
                    {[40, 60, 30, 80, 50, 90, 70].map((height, i) => (
                      <div key={i} className="w-full bg-primary/10 rounded-t-sm relative group h-full flex items-end">
                        <motion.div 
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className="w-full bg-primary rounded-t-sm"
                        />
                      </div>
                    ))}
                 </div>
                 {/* Gradient overlay for aesthetics */}
                 <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
