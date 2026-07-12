import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Download, Star, MapPin, Phone } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

type Customer = { id: string; name: string; phone: string; location: string; visits: number; spend: number; points: number }
const initialCustomers: Customer[] = []

export function CustomersView() {
  const [search, setSearch] = useState("")
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  )

  const topCustomer = customers.length > 0 ? customers.reduce((prev, current) => (prev.spend > current.spend) ? prev : current) : null

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Relationship</h2>
          <p className="text-sm text-muted-foreground">Manage your customer base and loyalty programs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shadow-sm" onClick={() => alert("Exporting CSV...")}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-none shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-100">Total Customers</p>
              <h3 className="text-3xl font-bold mt-1">{customers.length}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-background border-border shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Top Customer this month</p>
          <h3 className="text-xl font-bold text-foreground">{topCustomer ? topCustomer.name : 'N/A'}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1">₹{topCustomer ? topCustomer.spend.toLocaleString() : '0'} total spend</p>
        </Card>

        <Card className="p-6 bg-background border-border shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Average Visit Frequency</p>
          <h3 className="text-xl font-bold text-foreground">
            {customers.length > 0 ? (customers.reduce((sum, c) => sum + c.visits, 0) / customers.length).toFixed(1) : '0'} times
          </h3>
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

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-md p-6 rounded-xl shadow-xl border border-border">
            <h3 className="text-lg font-bold mb-4">Add Customer</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setCustomers([...customers, {
                id: `CUST-${Date.now().toString().slice(-4)}`,
                name: fd.get('name') as string,
                phone: fd.get('phone') as string,
                location: fd.get('location') as string,
                visits: 0,
                spend: 0,
                points: 0
              }]);
              setIsAddModalOpen(false);
            }} className="space-y-4">
              <div className="space-y-1"><Label>Customer Name</Label><Input name="name" required placeholder="e.g. Rahul Sharma" /></div>
              <div className="space-y-1"><Label>Phone Number</Label><Input name="phone" required placeholder="e.g. +91 9876543210" /></div>
              <div className="space-y-1"><Label>Location</Label><Input name="location" required placeholder="e.g. Andheri West" /></div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Add Customer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
