import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, Plus, AlertCircle, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const initialProducts = [
  { id: "PRD-001", name: "Premium Basmati Rice 5kg", category: "Groceries", stock: 120, price: 450, status: "In Stock" },
  { id: "PRD-002", name: "Sunflower Oil 1L", category: "Groceries", stock: 15, price: 165, status: "Low Stock" },
  { id: "PRD-003", name: "Toor Dal 1kg", category: "Pulses", stock: 45, price: 160, status: "In Stock" },
  { id: "PRD-004", name: "Whole Wheat Atta 10kg", category: "Groceries", stock: 0, price: 380, status: "Out of Stock" },
  { id: "PRD-005", name: "Sugar 1kg", category: "Groceries", stock: 200, price: 45, status: "In Stock" },
  { id: "PRD-006", name: "Tata Salt 1kg", category: "Groceries", stock: 80, price: 25, status: "In Stock" },
  { id: "PRD-007", name: "Maggi Noodles 400g", category: "Snacks", stock: 12, price: 55, status: "Low Stock" },
]

export function InventoryView() {
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState(initialProducts)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200'
      case 'Low Stock': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200'
      case 'Out of Stock': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-sm text-muted-foreground">Track your stock levels, pricing, and product categories.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-4 bg-background border-border">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Products</p>
            <h4 className="text-2xl font-bold text-foreground">1,248</h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-background border-border">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <h4 className="text-2xl font-bold text-foreground">18</h4>
          </div>
        </Card>
      </div>

      <Card className="border-border shadow-sm overflow-hidden bg-background">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-full bg-muted/50 border-transparent focus-visible:border-indigo-500" 
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="h-9 px-3 rounded-md text-sm bg-muted/50 border-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-full sm:w-auto text-foreground">
              <option value="">All Categories</option>
              <option value="Groceries">Groceries</option>
              <option value="Snacks">Snacks</option>
              <option value="Pulses">Pulses</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px]">Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/10">
                  <TableCell className="font-medium text-muted-foreground">{product.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">₹{product.price}</TableCell>
                  <TableCell className="text-right text-foreground font-medium">{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No products found matching "{search}"
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
