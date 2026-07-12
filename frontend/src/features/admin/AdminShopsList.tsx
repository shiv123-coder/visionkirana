import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { fetchAdminShops } from "@/services/adminService"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MapPin, ChevronLeft, ChevronRight, XCircle, FileSearch, Search
} from "lucide-react"
import { ViewDocumentsModal } from "@/components/ui/ViewDocumentsModal"

export function AdminShopsList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewingDocsAppId, setViewingDocsAppId] = useState<string | null>(null)
  const limit = 50

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminShops', page],
    queryFn: () => fetchAdminShops(page * limit, limit),
    refetchInterval: 5000
  })
  const shops = (data as any[]) || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-2">Error loading shops</p>
        <p className="text-muted-foreground text-sm">Failed to load the directory.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto w-full p-6">
        <Card className="bg-background border-border shadow-sm rounded-xl overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-border">
            <h3 className="text-base font-semibold text-foreground">Registered Shops</h3>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search shops..."
                className="pl-9 bg-muted/50 border-transparent focus-visible:border-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>GPS Location</TableHead>
                  <TableHead className="text-right">Monthly Sales</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {shops.filter((s: any) => (s.shop_name || s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.owner_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.city || "").toLowerCase().includes(searchQuery.toLowerCase())).map((shop: any) => (
                  <TableRow key={shop.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-medium text-foreground">{shop.shop_name || shop.name}</TableCell>
                    <TableCell className="text-muted-foreground">{shop.owner_name}</TableCell>
                    <TableCell className="text-muted-foreground">{shop.category}</TableCell>
                    <TableCell className="text-muted-foreground">{shop.city}</TableCell>
                    <TableCell>
                      {shop.latitude && shop.longitude ? (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-500 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50 w-max">
                          <MapPin className="w-3 h-3 mr-1" />
                          {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground text-xs font-medium bg-muted px-2 py-1 rounded-md w-max">
                          <MapPin className="w-3 h-3 mr-1 opacity-50" />
                          No Data
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">₹{shop.monthly_sales?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {shop.applications && shop.applications.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setViewingDocsAppId(shop.applications[shop.applications.length - 1].id.toString())}
                        >
                          <FileSearch className="w-4 h-4 mr-2" /> View Docs
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {shops.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No shops registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!shops || shops.length < limit}
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>

      <ViewDocumentsModal 
        applicationId={viewingDocsAppId} 
        isOpen={!!viewingDocsAppId} 
        onClose={() => setViewingDocsAppId(null)} 
      />
    </>
  )
}
