import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Megaphone, MessageSquare, Plus, Percent, Send, Activity } from "lucide-react"

export function MarketingView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketing & Promotions</h2>
          <p className="text-sm text-muted-foreground">Engage with your customers and drive more sales.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border shadow-sm flex flex-col h-full bg-background hover:border-indigo-300 transition-colors cursor-pointer group">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <CardTitle>SMS Campaigns</CardTitle>
            <CardDescription>Send targeted promotional text messages to your loyalty members.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">2 Active</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                Manage <ArrowRightIcon className="w-4 h-4 ml-1" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm flex flex-col h-full bg-background hover:border-emerald-300 transition-colors cursor-pointer group">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Percent className="w-6 h-6" />
            </div>
            <CardTitle>Discount Codes</CardTitle>
            <CardDescription>Create and track custom promo codes for checkout and billing.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">5 Active</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                Manage <ArrowRightIcon className="w-4 h-4 ml-1" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm flex flex-col h-full bg-background hover:border-amber-300 transition-colors cursor-pointer group">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <CardTitle>Store Announcements</CardTitle>
            <CardDescription>Publish updates about new stock, holiday timings, and events.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">1 Draft</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center">
                Manage <ArrowRightIcon className="w-4 h-4 ml-1" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Campaign Performance</h3>
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {[
              { name: "Diwali Mega Sale 2026", type: "SMS", sent: 1200, clicks: 340, conversions: 45, status: "completed" },
              { name: "Weekend Special - Groceries 10% Off", type: "Promo Code", sent: "-", clicks: 120, conversions: 89, status: "active" },
              { name: "New Arrival Alerts", type: "SMS", sent: 450, clicks: 12, conversions: 2, status: "active" }
            ].map((camp, i) => (
              <div key={i} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground">{camp.name}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${camp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {camp.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center">
                    <Activity className="w-3.5 h-3.5 mr-1" /> {camp.type} Campaign
                  </p>
                </div>
                <div className="flex gap-6 text-sm text-center">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">Sent/Views</p>
                    <p className="font-bold text-foreground">{camp.sent}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">Clicks/Uses</p>
                    <p className="font-bold text-foreground">{camp.clicks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">Conversions</p>
                    <p className="font-bold text-emerald-600">{camp.conversions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
