import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAdminShops } from "@/services/adminService"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MapPin, ChevronLeft, ChevronRight, XCircle, FileSearch, Search, Store, Image as ImageIcon, FileText, Mic
} from "lucide-react"
import { ViewDocumentsModal } from "@/components/ui/ViewDocumentsModal"
import { getApplicationDocuments } from "@/services/uploadService"
import { getSecureDocumentUrlApiV1DocumentsDocumentIdUrlGet } from "@/client"

export function AdminShopsList() {
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

  const [shopImages, setShopImages] = useState<Record<number, string>>({})
  const [shopEvidenceCounts, setShopEvidenceCounts] = useState<Record<number, {images: number, docs: number, audio: number}>>({})

  useEffect(() => {
    if (!shops || shops.length === 0) return;
    const fetchDocs = async () => {
      const newShopImages: Record<number, string> = {}
      const newEvidenceCounts: Record<number, {images: number, docs: number, audio: number}> = {}
      
      for (const shop of shops) {
        const applications = shop.applications || []
        const latestApp = applications.length > 0 ? applications[applications.length - 1] : null;
        if (latestApp && !shopEvidenceCounts[shop.id]) {
          try {
            const docs = await getApplicationDocuments(latestApp.id.toString());
            let imgs = 0, documents = 0, audios = 0;
            
            for (const doc of docs) {
              if (doc.category === 'image') imgs++;
              else if (doc.category === 'document') documents++;
              else if (doc.category === 'audio') audios++;
              
              if (doc.type === 'shop_front' && !newShopImages[shop.id]) {
                 const urlData = await getSecureDocumentUrlApiV1DocumentsDocumentIdUrlGet({ path: { document_id: doc.id }});
                 if (urlData.data && (urlData.data as any).url) {
                    newShopImages[shop.id] = (urlData.data as any).url;
                 }
              }
            }
            newEvidenceCounts[shop.id] = { images: imgs, docs: documents, audio: audios };
          } catch(e) {}
        }
      }
      if (Object.keys(newEvidenceCounts).length > 0) {
        setShopImages(prev => ({...prev, ...newShopImages}))
        setShopEvidenceCounts(prev => ({...prev, ...newEvidenceCounts}))
      }
    }
    fetchDocs()
  }, [shops])

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
                  <TableHead>Location Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>GPS Location</TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead className="text-right">Monthly Sales</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {shops.filter((s: any) => (s.shop_name || s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.owner_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (s.city || "").toLowerCase().includes(searchQuery.toLowerCase())).map((shop: any) => (
                  <TableRow key={shop.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {shopImages[shop.id] ? (
                            <img src={shopImages[shop.id]} alt={shop.shop_name || shop.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium text-foreground line-clamp-1">{shop.shop_name || shop.name}</span>
                      </div>
                    </TableCell>
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
                    <TableCell>
                      <div className="flex flex-col gap-2 items-start">
                        {shopEvidenceCounts[shop.id] ? (
                          <div className="flex flex-col gap-1 text-xs whitespace-nowrap">
                            {shopEvidenceCounts[shop.id].images > 0 && <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><ImageIcon className="w-3 h-3"/> {shopEvidenceCounts[shop.id].images} Visuals</span>}
                            {shopEvidenceCounts[shop.id].docs > 0 && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><FileText className="w-3 h-3"/> {shopEvidenceCounts[shop.id].docs} Docs</span>}
                            {shopEvidenceCounts[shop.id].audio > 0 && <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400"><Mic className="w-3 h-3"/> {shopEvidenceCounts[shop.id].audio} Audio</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                        
                        {shop.applications && shop.applications.length > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-[10px] px-2 py-0 mt-1"
                            onClick={() => setViewingDocsAppId(shop.applications[shop.applications.length - 1].id.toString())}
                          >
                            <FileSearch className="w-3 h-3 mr-1" /> View Docs
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">₹{shop.monthly_sales?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                       <span className="text-muted-foreground text-xs">-</span>
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
