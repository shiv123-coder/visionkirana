import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAdminShops } from "@/services/adminService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Store, ChevronLeft, ChevronRight } from "lucide-react"

export function AdminShopsList() {
  const [page, setPage] = useState(0)
  const limit = 50

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminShops', page],
    queryFn: () => fetchAdminShops(page * limit, limit),
    refetchInterval: 5000
  })
  const shops = (data as any[]) || []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-destructive">
        Failed to load shops.
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Store className="w-8 h-8 mr-3 text-primary" />
          Registered Shops
        </h1>
        <p className="text-muted-foreground mt-2">Manage all registered shops on the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shops Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {shops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shops registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Monthly Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop: any) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.shop_name || shop.name}</TableCell>
                      <TableCell>{shop.owner_name}</TableCell>
                      <TableCell>{shop.category}</TableCell>
                      <TableCell>{shop.city}</TableCell>
                      <TableCell className="text-right">₹{shop.monthly_sales?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!shops || shops.length < limit}
              className="flex items-center px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
