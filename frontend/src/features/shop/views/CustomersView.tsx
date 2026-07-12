import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Download, Star, MapPin, Phone } from "lucide-react"

const initialCustomers = [
  { id: "CUST-001", name: "Rahul Sharma", phone: "+91 9876543210", location: "Andheri West", visits: 45, spend: 12500, points: 450 },
  { id: "CUST-002", name: "Priya Patel", phone: "+91 9876543211", location: "Bandra East", visits: 12, spend: 3400, points: 120 },
  { id: "CUST-003", name: "Amit Kumar", phone: "+91 9876543212", location: "Andheri West", visits: 89, spend: 45600, points: 1200 },
  { id: "CUST-004", name: "Sneha Desai", phone: "+91 9876543213", location: "Juhu", visits: 3, spend: 850, points: 30 },
  { id: "CUST-005", name: "Vikram Singh", phone: "+91 9876543214", location: "Colaba", visits: 24, spend: 8900, points: 240 },
]

export function CustomersView() {
  const [search, setSearch] = useState("")

  const filteredCustomers = initialCustomers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  )

  const topCustomer = initialCustomers.reduce((prev, current) => (prev.spend > current.spend) ? prev : current)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Relationship</h2>
          <p className="text-sm text-muted-foreground">Manage your customer base and loyalty programs.</p>
        </div>
        <Button variant="outline" className="shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-none shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-100">Total Customers</p>
              <h3 className="text-3xl font-bold mt-1">1,432</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-background border-border shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Top Customer this month</p>
          <h3 className="text-xl font-bold text-foreground">{topCustomer.name}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1">₹{topCustomer.spend.toLocaleString()} total spend</p>
        </Card>

        <Card className="p-6 bg-background border-border shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Average Visit Frequency</p>
          <h3 className="text-xl font-bold text-foreground">4.2 times</h3>
          <p className="text-xs text-muted-foreground mt-1">per month per customer</p>
        </Card>
      </div>

      <Card className="border-border shadow-sm overflow-hidden bg-background">
        <div className="p-4 border-b border-border">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, phone, or location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full bg-muted/50 border-transparent focus-visible:border-indigo-500 rounded-lg" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Customer Info</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Total Visits</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Loyalty Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/10">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                          <Phone className="w-3 h-3 mr-1" /> {customer.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-1" /> {customer.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-foreground font-medium">{customer.visits}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">₹{customer.spend.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/50">
                      <Star className="w-3.5 h-3.5 mr-1 fill-amber-500" /> {customer.points}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No customers found matching "{search}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
