import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ViewDocumentsModal } from "@/components/ui/ViewDocumentsModal"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NotificationsDropdown } from "@/features/notifications/NotificationsDropdown"
import { 
  PlusCircle, LayoutDashboard, BadgeDollarSign, Package, Users, Megaphone, 
  BarChart2, Settings, Search, ShoppingCart, 
  Wallet, X, AlertCircle, MapPin, Store, Trash2, Image as ImageIcon, FileText, Mic
} from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { getUserShopsApiV1ShopsGet, getSecureDocumentUrlApiV1DocumentsDocumentIdUrlGet } from "@/client"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { InventoryView } from "./views/InventoryView"
import { CustomersView } from "./views/CustomersView"
import { ReportsView } from "./views/ReportsView"
import { getApplicationDocuments } from "@/services/uploadService"
import "@/api-client"

// Interfaces
interface Application {
  id: number
  status: string
  requested_amount: number
  purpose: string | null
}

interface Shop {
  id: number
  shop_name: string
  owner_name: string
  mobile: string
  address: string
  city: string
  state: string
  category: string
  years_in_business: number
  monthly_sales: number
  applications?: Application[]
}

interface UserProfile {
  name: string
  email: string
  phone: string
  language: string
  role: string
}



export function ShopDashboard() {
  const { logout } = useAuth()
  const [shops, setShops] = useState<Shop[]>([])
  const [shopImages, setShopImages] = useState<Record<number, string>>({})
  const [shopEvidenceCounts, setShopEvidenceCounts] = useState<Record<number, {images: number, docs: number, audio: number}>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [profile, setProfile] = useState<UserProfile>({
    name: "Kirana Owner",
    email: "owner@visionkirana.com",
    phone: "+91 9876543210",
    language: "English",
    role: "Store Owner"
  })
  
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isApplyLoanOpen, setIsApplyLoanOpen] = useState<number | null>(null)
  const [applyAmount, setApplyAmount] = useState("")
  const [applyPurpose, setApplyPurpose] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [viewingDocsAppId, setViewingDocsAppId] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [shopToDelete, setShopToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { auth } = await import("@/config/firebase");
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            setError("Authentication required.");
            setLoading(false);
            return;
        }

        setProfile(prev => ({
          ...prev,
          name: currentUser.displayName || prev.name,
          email: currentUser.email || prev.email,
          phone: currentUser.phoneNumber || prev.phone
        }))

        const { data, error } = await getUserShopsApiV1ShopsGet();

        if (error) {
          throw new Error("Failed to load shops")
        }

        const shopsData = data as any as Shop[];
        setShops(shopsData)
        
        // Fetch evidence for each shop's latest app
        const newShopImages: Record<number, string> = {}
        const newEvidenceCounts: Record<number, {images: number, docs: number, audio: number}> = {}
        
        for (const shop of shopsData) {
          const latestApp = shop.applications && shop.applications.length > 0 ? shop.applications[shop.applications.length - 1] : null;
          if (latestApp) {
             try {
                const docs = await getApplicationDocuments(latestApp.id.toString());
                let imgs = 0, documents = 0, audios = 0;
                
                for (const doc of docs) {
                  if (doc.category === 'image') imgs++;
                  else if (doc.category === 'document') documents++;
                  else if (doc.category === 'audio') audios++;
                  
                  // Use first shop_front image as avatar
                  if (doc.type === 'shop_front' && !newShopImages[shop.id]) {
                     const urlData = await getSecureDocumentUrlApiV1DocumentsDocumentIdUrlGet({ path: { document_id: doc.id }});
                     if (urlData.data && (urlData.data as any).url) {
                        newShopImages[shop.id] = (urlData.data as any).url;
                     }
                  }
                }
                newEvidenceCounts[shop.id] = { images: imgs, docs: documents, audio: audios };
             } catch(e) {
                console.error("Failed to fetch docs for shop", shop.id, e);
             }
          }
        }
        
        setShopImages(prev => ({...prev, ...newShopImages}))
        setShopEvidenceCounts(prev => ({...prev, ...newEvidenceCounts}))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
    
    const pollInterval = setInterval(() => {
        setShops(currentShops => {
            const isProcessing = currentShops.some(s => s.applications?.some(a => a.status === 'processing'));
            if (isProcessing) {
                fetchShops();
            }
            return currentShops;
        })
    }, 3000);
    
    return () => {
        if (pollInterval) clearInterval(pollInterval);
    }
  }, [location.key])

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isApplyLoanOpen || !applyAmount || !applyPurpose) return
    
    setIsApplying(true)
    try {
      const token = localStorage.getItem("access_token")
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://visionkirana-api.onrender.com"
      
      const res = await fetch(`${apiUrl}/api/v1/shops/${isApplyLoanOpen}/applications`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
            requested_amount: parseFloat(applyAmount),
            purpose: applyPurpose
        })
      })
      
      if (!res.ok) throw new Error("Failed to create application")
      
      const data = await res.json()
      
      setIsApplyLoanOpen(null)
      setApplyAmount("")
      setApplyPurpose("")
      navigate(`/applications/${data.application_id}/documents`)
      
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsApplying(false)
    }
  };

  const handleDeleteShop = async () => {
    if (!shopToDelete) return
    setIsDeleting(true)
    try {
      const token = localStorage.getItem("access_token")
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://visionkirana-api.onrender.com"
      
      const res = await fetch(`${apiUrl}/api/v1/shops/${shopToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error("Failed to delete shop")
      
      setShops(shops.filter(s => s.id !== shopToDelete))
      setIsDeleteOpen(false)
      setShopToDelete(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (['processing', 'under_review'].includes(status)) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
    if (['completed', 'approved'].includes(status)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
    if (status === 'rejected') return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' // active shop
  }

  const getStatusText = (shop: Shop) => {
    const activeApp = shop.applications?.find(a => ['processing', 'under_review', 'pending_documents', 'draft'].includes(a.status))
    if (activeApp) return activeApp.status.replace(/_/g, ' ')
    return 'active'
  }

  if (loading) {
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
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-2">Error loading dashboard</p>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    )
  }

  const totalSales = shops.reduce((acc, shop) => acc + (shop.monthly_sales || 0), 0)
  const totalOrders = Math.floor(totalSales / 20)

  const totalCustomers = Math.floor(totalOrders * 0.6)
  
  const totalDisbursed = shops.reduce((acc, shop) => {
    const approvedApps = shop.applications?.filter(a => a.status === 'approved') || []
    const shopDisbursed = approvedApps.reduce((sum, app) => sum + (app.requested_amount || 0), 0)
    return acc + shopDisbursed
  }, 0)

  const sparklineData1 = totalDisbursed > 0 ? [{v: 10},{v: 15},{v: 12},{v: 25},{v: 18},{v: 30},{v: 28}] : [{v:0},{v:0}]
  const sparklineData2 = totalSales > 0 ? [{v: 5},{v: 10},{v: 8},{v: 15},{v: 12},{v: 20},{v: 25}] : [{v:0},{v:0}]
  const sparklineData3 = totalOrders > 0 ? [{v: 20},{v: 18},{v: 22},{v: 15},{v: 25},{v: 22},{v: 28}] : [{v:0},{v:0}]
  const sparklineData4 = totalCustomers > 0 ? [{v: 30},{v: 25},{v: 35},{v: 40},{v: 38},{v: 45},{v: 50}] : [{v:0},{v:0}]

  const mainChartData = [
    { name: 'Week 1', value: totalSales * 0.1 },
    { name: 'Week 2', value: totalSales * 0.25 },
    { name: 'Week 3', value: totalSales * 0.2 },
    { name: 'Week 4', value: totalSales * 0.45 },
  ]

  const renderShopsTable = (limit?: number) => (
    <Card className="bg-background border-border shadow-sm rounded-xl overflow-hidden">
      <div className="p-5 flex justify-between items-center border-b border-border">
        <h3 className="text-base font-semibold text-foreground">{limit ? "Recent Shop Locations" : "Shop Locations"}</h3>
        {limit && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs rounded-md shadow-sm" onClick={() => setActiveTab("shops")}>
            View all shops
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Location Name</th>
              <th className="px-6 py-4 font-medium">Address</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium">Evidence</th>
              <th className="px-6 py-4 font-medium">Total Sales</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shops
              .filter(s => s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, limit || undefined)
              .map((shop) => {
              const statusText = getStatusText(shop)
              const pendingApp = shop.applications?.find(a => a.status === 'pending_documents' || a.status === 'draft')
              const activeApp = shop.applications?.find(a => a.status === 'processing' || a.status === 'under_review')
              const approvedApp = shop.applications?.find(a => a.status === 'approved')
              const latestApp = shop.applications && shop.applications.length > 0 ? shop.applications[shop.applications.length - 1] : null
              
              return (
                <tr key={shop.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {shopImages[shop.id] ? (
                          <img src={shopImages[shop.id]} alt={shop.shop_name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-foreground line-clamp-1">{shop.shop_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{shop.city}, {shop.state}</td>
                  <td className="px-6 py-4 text-muted-foreground">{shop.owner_name}</td>
                  <td className="px-6 py-4">
                    {shopEvidenceCounts[shop.id] ? (
                      <div className="flex flex-col gap-1 text-xs whitespace-nowrap">
                        {shopEvidenceCounts[shop.id].images > 0 && <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><ImageIcon className="w-3 h-3"/> {shopEvidenceCounts[shop.id].images} Visuals</span>}
                        {shopEvidenceCounts[shop.id].docs > 0 && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><FileText className="w-3 h-3"/> {shopEvidenceCounts[shop.id].docs} Docs</span>}
                        {shopEvidenceCounts[shop.id].audio > 0 && <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400"><Mic className="w-3 h-3"/> {shopEvidenceCounts[shop.id].audio} Audio</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">₹{(shop.monthly_sales).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${getStatusColor(statusText)} uppercase tracking-wider`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {latestApp && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setViewingDocsAppId(latestApp.id.toString())}>
                          View Docs
                        </Button>
                      )}
                      {approvedApp ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400" onClick={() => navigate(`/verify-loan/${approvedApp.id}`)}>
                          PDF
                        </Button>
                      ) : pendingApp ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400" onClick={() => navigate(`/applications/${pendingApp.id}/documents`)}>
                          Upload
                        </Button>
                      ) : !activeApp ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsApplyLoanOpen(shop.id)}>
                          Apply
                        </Button>
                      ) : null}
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(`/shops/${shop.id}/edit`)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => { setShopToDelete(shop.id); setIsDeleteOpen(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {shops.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  No locations added yet. Click "Add Shop" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen flex bg-muted/30">
      
      {/* ─── Sidebar ─── */}
      <aside className="w-[240px] bg-background border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              V
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">VisionKirana</span>
          </div>
        </div>
        <div className="px-4 py-2 flex-1">
          <nav className="space-y-1">
            <Button 
              variant={activeTab === "dashboard" ? "secondary" : "ghost"} 
              className={`w-full justify-start h-10 font-medium ${activeTab === "dashboard" ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
            </Button>
            <Button 
              variant={activeTab === "shops" ? "secondary" : "ghost"} 
              className={`w-full justify-start h-10 font-medium ${activeTab === "shops" ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("shops")}
            >
              <Store className="w-4 h-4 mr-3" /> Shops
            </Button>

            <Button 
              variant={activeTab === "inventory" ? "secondary" : "ghost"} 
              className={`w-full justify-start h-10 font-medium ${activeTab === "inventory" ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("inventory")}
            >
              <Package className="w-4 h-4 mr-3" /> Inventory
            </Button>
            <Button 
              variant={activeTab === "customers" ? "secondary" : "ghost"} 
              className={`w-full justify-start h-10 font-medium ${activeTab === "customers" ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("customers")}
            >
              <Users className="w-4 h-4 mr-3" /> Customers
            </Button>

            <Button 
              variant={activeTab === "reports" ? "secondary" : "ghost"} 
              className={`w-full justify-start h-10 font-medium ${activeTab === "reports" ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("reports")}
            >
              <BarChart2 className="w-4 h-4 mr-3" /> Reports
            </Button>
            <Button 
              variant={activeTab === "settings" ? "secondary" : "ghost"} 
              className={`w-full justify-start h-10 font-medium mt-4 ${activeTab === "settings" ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-4 h-4 mr-3" /> Settings
            </Button>
          </nav>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search shops..." 
                className="w-64 pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-indigo-500 rounded-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ThemeToggle />
            <NotificationsDropdown />
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <span className="text-sm font-medium text-foreground hidden sm:block">Hello, {profile.name.split(' ')[0]}</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-sm font-semibold">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {activeTab === "dashboard" ? (
            <>
              <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md h-9 shadow-sm" onClick={() => navigate('/register')}>
              <PlusCircle className="w-4 h-4 mr-2" /> Add Shop
            </Button>
          </div>

          {/* ─── KPI Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Disbursed Funds", val: `₹${totalDisbursed.toLocaleString()}`, icon: BadgeDollarSign, sparkline: sparklineData1, change: "+100%", isHighlight: true },
              { title: "Total Sales", val: `₹${(totalSales).toLocaleString()}`, icon: Wallet, sparkline: sparklineData2, change: "+12.4%", isHighlight: false },
              { title: "Orders", val: totalOrders.toLocaleString(), icon: ShoppingCart, sparkline: sparklineData3, change: "+8.2%", isHighlight: false },
              { title: "Active Customers", val: totalCustomers.toLocaleString(), icon: Users, sparkline: sparklineData4, change: "+5.7%", isHighlight: false },
            ].map((kpi, i) => (
              <Card key={i} className={`border-border shadow-sm rounded-xl overflow-hidden ${kpi.isHighlight ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-indigo-600 shadow-indigo-200/50 dark:shadow-none dark:from-indigo-900/50 dark:to-indigo-800/30' : 'bg-background'}`}>
                <CardContent className="p-5 relative pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className={`text-sm font-medium ${kpi.isHighlight ? 'text-indigo-100' : 'text-foreground'}`}>{kpi.title}</p>
                    <div className={`p-1.5 rounded-md ${kpi.isHighlight ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <kpi.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${kpi.isHighlight ? 'text-white' : 'text-foreground'}`}>{kpi.val}</h3>
                  <div className={`text-xs font-medium mb-4 ${kpi.isHighlight ? 'text-indigo-200' : 'text-emerald-600'}`}>
                    {kpi.change} <span className={`font-normal ${kpi.isHighlight ? 'text-indigo-200/70' : 'text-muted-foreground'}`}>vs last month</span>
                  </div>
                  <div className="h-12 w-full absolute bottom-0 left-0 right-0 opacity-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpi.sparkline}>
                        <Line type="monotone" dataKey="v" stroke={kpi.isHighlight ? "#ffffff" : "#4f46e5"} strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ─── Chart & Side Panel ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart */}
            <Card className="lg:col-span-2 bg-background border-border shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Sales Overview (Last 30 Days)</CardTitle>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border border-border">
                  <Button variant="ghost" size="sm" className="h-7 text-xs bg-white dark:bg-slate-800 shadow-sm rounded">Area Chart</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" dy={10} />
                      <YAxis tickLine={false} axisLine={false} className="text-xs text-muted-foreground" tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Products side panel */}
            <Card className="bg-background border-border shadow-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Top Performing Shops</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 mt-2">
                {shops.slice(0, 4).map((shop) => (
                  <div key={shop.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                      <Store className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{shop.shop_name}</p>
                      <p className="text-xs text-muted-foreground">{shop.category}</p>
                    </div>
                  </div>
                ))}
                {shops.length === 0 && (
                  <div className="text-center py-6">
                    <Store className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No shops added yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── Data Table ─── */}
          {renderShopsTable(3)}
            </>
          ) : activeTab === "shops" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Shops & Documents</h2>
                  <p className="text-sm text-muted-foreground">Manage all your registered shops and their respective applications/documents here.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md h-9 shadow-sm" onClick={() => navigate('/register')}>
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Shop
                </Button>
              </div>
              {renderShopsTable()}
            </div>
          ) : activeTab === "settings" ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={profile.email} disabled className="bg-muted/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Preferred Language</Label>
                        <select
                          id="language"
                          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={profile.language}
                          onChange={(e) => setProfile({...profile, language: e.target.value})}
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Marathi">Marathi</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => alert("Profile updated successfully!")}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Account Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h4 className="font-medium text-sm">Sign Out</h4>
                        <p className="text-xs text-muted-foreground mt-1">Sign out of your account on this device.</p>
                      </div>
                      <Button variant="outline" onClick={logout}>Sign Out</Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <h4 className="font-medium text-sm text-destructive">Delete Account</h4>
                        <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data.</p>
                      </div>
                      <Button variant="destructive" onClick={async () => {
                        if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
                          try {
                            const token = localStorage.getItem("access_token")
                            const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://visionkirana-api.onrender.com"
                            
                            const res = await fetch(`${apiUrl}/api/v1/users/me`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            })
                            
                            if (!res.ok) {
                              const errorData = await res.json().catch(() => ({}));
                              throw new Error(errorData.detail || "Failed to delete account");
                            }
                            
                            alert("Account successfully deleted.");
                            logout();
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }
                      }}>Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : activeTab === "inventory" ? (
            <InventoryView />
          ) : activeTab === "customers" ? (
            <CustomersView />
          ) : activeTab === "reports" ? (
            <ReportsView />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-background rounded-xl border border-border shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-5 dark:bg-indigo-500/10 dark:text-indigo-400">
                {activeTab === "inventory" && <Package className="w-8 h-8" />}
                {activeTab === "customers" && <Users className="w-8 h-8" />}
                {activeTab === "reports" && <BarChart2 className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl font-bold text-foreground capitalize mb-2">{activeTab}</h2>
              <p className="text-muted-foreground max-w-sm">
                The {activeTab} section is currently under development. Check back later for updates.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Modals ─── */}
      <AnimatePresence>
        {isApplyLoanOpen !== null && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background w-full max-w-md p-6 rounded-xl shadow-xl border border-border"
            >
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Request Loan</h3>
                        <p className="text-sm text-muted-foreground mt-1">Specify amount and purpose.</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsApplyLoanOpen(null)} className="rounded-full h-8 w-8 text-muted-foreground">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                
                <form onSubmit={handleApplyLoan} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="applyAmount" className="text-sm text-foreground">Amount Required (₹)</Label>
                        <Input id="applyAmount" type="number" min="1000" placeholder="e.g. 50000" value={applyAmount} onChange={(e) => setApplyAmount(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="applyPurpose" className="text-sm text-foreground">Purpose</Label>
                        <Input id="applyPurpose" placeholder="e.g. Inventory restocking" value={applyPurpose} onChange={(e) => setApplyPurpose(e.target.value)} required />
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsApplyLoanOpen(null)}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isApplying}>
                            {isApplying ? "Processing..." : "Continue"}
                        </Button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}

        {isDeleteOpen && shopToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background w-full max-w-sm p-6 rounded-xl shadow-xl border border-border text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Delete Shop</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this shop? This action cannot be undone and will remove all associated applications.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => { setIsDeleteOpen(false); setShopToDelete(null); }}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteShop} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Shop"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {viewingDocsAppId && (
        <ViewDocumentsModal 
          applicationId={viewingDocsAppId} 
          isOpen={!!viewingDocsAppId} 
          onClose={() => setViewingDocsAppId(null)} 
        />
      )}
    </div>
  )
}
