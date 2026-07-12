import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeDollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

const salesData = [
  { name: 'Mon', revenue: 4000, profit: 2400 },
  { name: 'Tue', revenue: 3000, profit: 1398 },
  { name: 'Wed', revenue: 2000, profit: 9800 },
  { name: 'Thu', revenue: 2780, profit: 3908 },
  { name: 'Fri', revenue: 1890, profit: 4800 },
  { name: 'Sat', revenue: 2390, profit: 3800 },
  { name: 'Sun', revenue: 3490, profit: 4300 },
]

const recentTransactions = [
  { id: "TRX-101", amount: 1250, date: "Today, 10:45 AM", status: "completed", method: "UPI" },
  { id: "TRX-102", amount: 450, date: "Today, 09:30 AM", status: "completed", method: "Cash" },
  { id: "TRX-103", amount: 3200, date: "Yesterday, 04:15 PM", status: "completed", method: "Card" },
  { id: "TRX-104", amount: 890, date: "Yesterday, 01:20 PM", status: "refunded", method: "UPI" },
  { id: "TRX-105", amount: 2100, date: "Yesterday, 11:10 AM", status: "completed", method: "Card" },
]

export function SalesView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sales & Revenue</h2>
        <p className="text-sm text-muted-foreground">Monitor your financial performance and transactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-indigo-100">Today's Revenue</p>
              <div className="p-2 bg-white/20 rounded-md"><BadgeDollarSign className="w-4 h-4" /></div>
            </div>
            <h3 className="text-3xl font-bold mt-4">₹12,450</h3>
            <p className="text-xs text-indigo-200 mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +14.5% from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
              <div className="p-2 bg-muted rounded-md"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
            </div>
            <h3 className="text-3xl font-bold mt-4 text-foreground">₹84,300</h3>
            <p className="text-xs text-emerald-600 mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +5.2% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
              <div className="p-2 bg-muted rounded-md"><CreditCard className="w-4 h-4 text-indigo-600" /></div>
            </div>
            <h3 className="text-3xl font-bold mt-4 text-foreground">₹450</h3>
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <ArrowDownRight className="w-3 h-3 mr-1" /> -1.2% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Weekly Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs text-muted-foreground" tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((trx, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <BadgeDollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{trx.id}</p>
                      <p className="text-xs text-muted-foreground">{trx.date} • {trx.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{trx.amount.toLocaleString()}</p>
                    <p className={`text-xs capitalize font-medium ${trx.status === 'completed' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {trx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
