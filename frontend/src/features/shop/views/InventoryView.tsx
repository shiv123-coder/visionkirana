import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, Plus, AlertCircle, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

type Product = { id: string; name: string; category: string; stock: number; price: number; status: string }
const initialProducts: Product[] = []

export function InventoryView() {
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

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
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={() => setIsAddModalOpen(true)}>
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
            <h4 className="text-2xl font-bold text-foreground">{products.length}</h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-background border-border">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <h4 className="text-2xl font-bold text-foreground">{products.filter(p => p.stock > 0 && p.stock < 20).length}</h4>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" onClick={() => alert("Edit functionality coming soon")}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setProducts(products.filter(p => p.id !== product.id))}>
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

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-md p-6 rounded-xl shadow-xl border border-border">
            <h3 className="text-lg font-bold mb-4">Add Product</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const stock = parseInt(fd.get('stock') as string);
              const status = stock > 50 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock';
              setProducts([...products, {
                id: `PRD-${Date.now().toString().slice(-4)}`,
                name: fd.get('name') as string,
                category: fd.get('category') as string,
                stock: stock,
                price: parseFloat(fd.get('price') as string),
                status
              }]);
              setIsAddModalOpen(false);
            }} className="space-y-4">
              <div className="space-y-1"><Label>Product Name</Label><Input name="name" required placeholder="e.g. Basmati Rice" /></div>
              <div className="space-y-1"><Label>Category</Label><Input name="category" required placeholder="e.g. Groceries" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Price (₹)</Label><Input name="price" type="number" required min="0" /></div>
                <div className="space-y-1"><Label>Initial Stock</Label><Input name="stock" type="number" required min="0" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Add Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
