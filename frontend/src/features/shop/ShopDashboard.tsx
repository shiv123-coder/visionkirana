import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ViewDocumentsModal } from "@/components/ui/ViewDocumentsModal"
import { PlusCircle, Edit, Store, IndianRupee, TrendingUp, User, X, Sparkles, ChevronRight, Zap, AlertCircle, Trash2, Search, Upload, FileText, MapPin, Clock, BarChart3, Shield, ArrowUpRight, Briefcase } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getUserShopsApiV1ShopsGet } from "@/client"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import "@/api-client"

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
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: "Kirana Owner",
    email: "owner@visionkirana.com",
    phone: "+91 9876543210",
    language: "English",
    role: "Store Owner"
  })
  
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [shopToDelete, setShopToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [isApplyLoanOpen, setIsApplyLoanOpen] = useState<number | null>(null)
  const [applyAmount, setApplyAmount] = useState("")
  const [applyPurpose, setApplyPurpose] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [viewingDocsAppId, setViewingDocsAppId] = useState<string | null>(null)

  const handleDeleteShop = async (shopId: number) => {
    setIsDeleting(true)
    try {
      const token = localStorage.getItem("access_token")
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://visionkirana-api.onrender.com"
      const res = await fetch(`${apiUrl}/api/v1/shops/${shopId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to delete shop")
      setShops(prev => prev.filter(s => s.id !== shopId))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDeleting(false)
      setShopToDelete(null)
    }
  }

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
      
      // Close modal and navigate to document upload
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

        setShops(data as any as Shop[])
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

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save logic
    setIsProfileOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-[#fbfbfe]">
        <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm font-medium tracking-wide">Loading your workspace...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-[#fbfbfe]">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-lg text-slate-900">Unable to load data</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const activeApplications = shops.flatMap(s => s.applications || [])
  const totalSales = shops.reduce((acc, shop) => acc + (shop.monthly_sales || 0), 0)
  const healthScore = shops.length > 0 ? 85 : 0 
  const totalYears = shops.reduce((acc, s) => acc + s.years_in_business, 0)
  const avgYears = shops.length > 0 ? Math.round(totalYears / shops.length) : 0

  // Dynamic Chart Data
  const chartData = [
    { month: 'Jan', sales: totalSales * 0.6 },
    { month: 'Feb', sales: totalSales * 0.75 },
    { month: 'Mar', sales: totalSales * 0.8 },
    { month: 'Apr', sales: totalSales * 0.9 },
    { month: 'May', sales: totalSales || 50000 },
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; dot: string }> = {
      processing: { label: "AI Analyzing", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50", dot: "bg-amber-500" },
      under_review: { label: "Under Review", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50", dot: "bg-blue-500" },
      completed: { label: "Completed", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50", dot: "bg-emerald-500" },
      approved: { label: "Approved", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50", dot: "bg-emerald-500" },
      rejected: { label: "Rejected", color: "text-red-700 dark:text-red-400", bg: "bg-red-50", dot: "bg-red-500" },
      pending_documents: { label: "Docs Needed", color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50", dot: "bg-violet-500" },
      draft: { label: "Draft", color: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400" }
    }
    return configs[status] || { label: status.replace(/_/g, " "), color: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400" }
  }

  return (
    <div className="min-h-screen bg-[#fbfbfe] text-slate-900 pb-20 font-sans selection:bg-primary/20">
      
      {/* ─── Minimal Header ─── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg">
              V
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-800">VisionKirana</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsProfileOpen(true)} 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-9 px-3 rounded-md transition-colors"
            >
              <User className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Account</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
        
        {/* ─── Hero Section ─── */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {getGreeting()}, {profile.name.split(' ')[0]}
            </h1>
            <p className="text-slate-500 text-sm">
              Here is what's happening with your business today.
            </p>
          </div>
          {shops.length > 0 && (
            <Button 
              onClick={() => navigate("/register")} 
              className="h-10 px-5 rounded-md bg-primary hover:bg-primary/90 text-white shadow-sm transition-all font-medium"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Register New Shop
            </Button>
          )}
        </motion.div>

        {shops.length === 0 ? (
          /* ─── Empty State ─── */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex flex-col items-center max-w-lg mx-auto py-24 px-6 text-center">
              <div className="w-16 h-16 mb-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Store className="w-7 h-7 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-900">No shops registered yet</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Add your first Kirana store to access AI-driven insights, credit scoring, and instant micro-loans tailored to your sales performance.
              </p>
              <Button 
                onClick={() => navigate("/register")} 
                className="h-10 px-6 text-sm rounded-md bg-primary hover:bg-primary/90 shadow-sm transition-all font-medium"
              >
                Register Your Shop
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ─── Main Dashboard ─── */
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            
            {/* ─── KPI Stats Row ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariants}>
                <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:border-slate-300 transition-colors">
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1 flex justify-between items-center">
                      Business Health
                      <Shield className="w-4 h-4 text-emerald-500 opacity-70" />
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-slate-900">{healthScore}</p>
                      <span className="text-sm text-slate-500">/ 100</span>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Healthy
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:border-slate-300 transition-colors">
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1 flex justify-between items-center">
                      Total Sales Volume
                      <IndianRupee className="w-4 h-4 text-primary opacity-70" />
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-slate-900">{totalSales === 0 ? '₹0' : `₹${(totalSales / 1000).toFixed(0)}k`}</p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                      <Zap className="w-3 h-3 mr-1" />
                      AI Estimated
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:border-slate-300 transition-colors">
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1 flex justify-between items-center">
                      Active Loans
                      <FileText className="w-4 h-4 text-blue-500 opacity-70" />
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-slate-900">{activeApplications.length}</p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">
                      Across {shops.length} shops
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden group hover:border-slate-300 transition-colors">
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1 flex justify-between items-center">
                      Avg. Business Age
                      <Clock className="w-4 h-4 text-amber-500 opacity-70" />
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-slate-900">{avgYears}</p>
                      <span className="text-sm text-slate-500">years</span>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit">
                      Established
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ─── Chart Section ─── */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">Revenue Overview</CardTitle>
                  </div>
                  <div className="flex items-center text-xs font-medium text-slate-500">
                    <BarChart3 className="w-4 h-4 mr-1.5" />
                    Last 5 Months
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs text-slate-500" dy={10} />
                        <YAxis tickLine={false} axisLine={false} className="text-xs text-slate-500" tickFormatter={(val) => val === 0 ? '₹0' : `₹${val/1000}k`} />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0', 
                            backgroundColor: '#ffffff',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#0f172a'
                          }}
                          itemStyle={{ color: 'hsl(var(--primary))' }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                        />
                        {/* Smooth elegant line with soft fill */}
                        <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(var(--primary))" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Shops List ─── */}
            <motion.div variants={itemVariants} className="pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Your Locations</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search shops..." 
                    className="pl-9 h-9 text-sm rounded-md bg-white border-slate-200 focus-visible:ring-primary/20 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {shops.filter(s => s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase())).map(shop => {
                      const pendingApp = shop.applications?.find(a => a.status === 'pending_documents' || a.status === 'draft');
                      const activeApp = shop.applications?.find(a => a.status === 'processing' || a.status === 'under_review');
                      const completedApp = shop.applications?.find(a => ['completed', 'approved', 'rejected'].includes(a.status));

                      return (
                        <motion.div 
                          key={shop.id} 
                          layout 
                          initial={{ opacity: 0, scale: 0.98 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        >
                          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all flex flex-col h-full group">
                            
                            <div className="p-5 flex-1">
                              <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{shop.shop_name}</h3>
                                  <div className="flex items-center text-xs text-slate-500">
                                    <Briefcase className="w-3 h-3 mr-1" />
                                    {shop.category}
                                  </div>
                                </div>
                                <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                  <MapPin className="w-3 h-3 mr-1 opacity-70" />
                                  {shop.city}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 py-3 border-y border-slate-100 mb-4">
                                <div className="flex-1">
                                  <p className="text-xs text-slate-500 font-medium mb-0.5">Est. Sales</p>
                                  <p className="font-semibold text-slate-900 text-sm">₹{(shop.monthly_sales / 1000).toFixed(0)}k</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100" />
                                <div className="flex-1 text-center">
                                  <p className="text-xs text-slate-500 font-medium mb-0.5">Age</p>
                                  <p className="font-semibold text-slate-900 text-sm">{shop.years_in_business}y</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100" />
                                <div className="flex-1 text-right">
                                  <p className="text-xs text-slate-500 font-medium mb-0.5">Loans</p>
                                  <p className="font-semibold text-slate-900 text-sm">{shop.applications?.length || 0}</p>
                                </div>
                              </div>

                              {/* Application status badges */}
                              {shop.applications && shop.applications.length > 0 && (
                                <div className="space-y-2">
                                  {shop.applications.slice(0, 2).map((app, idx) => {
                                    const cfg = getStatusConfig(app.status)
                                    return (
                                      <div key={idx} className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md ${cfg.bg}`}>
                                        <span className={`font-medium ${cfg.color} flex items-center gap-1.5`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${app.status === 'processing' ? 'animate-pulse' : ''}`} />
                                          {cfg.label}
                                        </span>
                                        <span className="font-medium text-slate-600">₹{(app.requested_amount / 1000).toFixed(0)}k</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Actions footer */}
                            <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 mt-auto flex flex-col gap-2">
                                {pendingApp ? (
                                    <Button 
                                      variant="default" 
                                      className="w-full h-9 text-sm rounded-md bg-primary hover:bg-primary/90 text-white shadow-sm transition-all" 
                                      onClick={() => navigate(`/applications/${pendingApp.id}/documents`)}
                                    >
                                      Upload Evidence
                                    </Button>
                                ) : activeApp ? (
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        disabled
                                        className="flex-1 h-9 text-sm rounded-md border-slate-200 bg-white text-slate-500 font-normal" 
                                      >
                                        Processing...
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        className="flex-1 h-9 text-sm rounded-md border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                                        onClick={() => setViewingDocsAppId(activeApp.id.toString())}
                                      >
                                        View Uploads
                                      </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="default" 
                                        className="flex-1 h-9 text-sm rounded-md bg-primary hover:bg-primary/90 text-white shadow-sm transition-all" 
                                        onClick={() => setIsApplyLoanOpen(shop.id)}
                                      >
                                        Apply for Loan
                                      </Button>
                                      {completedApp && (
                                        <Button 
                                          variant="outline" 
                                          className="flex-1 h-9 text-sm rounded-md border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                                          onClick={() => setViewingDocsAppId(completedApp.id.toString())}
                                        >
                                          Past Uploads
                                        </Button>
                                      )}
                                    </div>
                                )}
                              
                              <div className="flex gap-2 mt-1">
                                <Button 
                                  variant="ghost" 
                                  className="flex-1 h-8 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-md transition-colors" 
                                  onClick={() => navigate(`/shops/${shop.id}/edit`)}
                                >
                                  Edit Shop
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  className="h-8 px-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                                  onClick={() => setShopToDelete(shop.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                  })}
                </AnimatePresence>
                
                {shops.filter(s => s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Search className="w-8 h-8 text-slate-300 mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">No shops found</h3>
                    <p className="text-slate-500 text-xs mt-1">Adjust your search to find what you're looking for.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* ─── Profile Slide-out ─── */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsProfileOpen(false)} className="rounded-full h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <form id="profile-form" onSubmit={handleProfileSave} className="space-y-6">
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xl">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{profile.name}</p>
                      <p className="text-sm text-slate-500">{profile.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personal Details</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs text-slate-600">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="h-9 rounded-md bg-white border-slate-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs text-slate-600">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="h-9 rounded-md bg-white border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-4 pb-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs text-slate-600">New Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="••••••••"
                        className="h-9 rounded-md bg-white border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <Button type="submit" form="profile-form" className="w-full h-10 rounded-md bg-primary hover:bg-primary/90 text-white shadow-sm transition-all font-medium">
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Apply Loan Modal ─── */}
      <AnimatePresence>
        {isApplyLoanOpen !== null && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyLoanOpen(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.98, opacity: 0, y: 10 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.98, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl border border-slate-200"
              >
                  <div className="flex justify-between items-start mb-5">
                      <div>
                          <h3 className="text-lg font-semibold text-slate-900">Request Loan</h3>
                          <p className="text-sm text-slate-500 mt-1">Specify amount and purpose.</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsApplyLoanOpen(null)} className="rounded-full h-8 w-8 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                          <X className="w-4 h-4" />
                      </Button>
                  </div>
                  
                  <form onSubmit={handleApplyLoan} className="space-y-5">
                      <div className="space-y-1.5">
                          <Label htmlFor="applyAmount" className="text-sm font-medium text-slate-700">Amount Required (₹)</Label>
                          <Input 
                              id="applyAmount" 
                              type="number" 
                              min="1000" 
                              placeholder="e.g. 50000" 
                              value={applyAmount}
                              onChange={(e) => setApplyAmount(e.target.value)}
                              required
                              className="h-10 rounded-md border-slate-200"
                          />
                      </div>
                      <div className="space-y-1.5">
                          <Label htmlFor="applyPurpose" className="text-sm font-medium text-slate-700">Purpose</Label>
                          <Input 
                              id="applyPurpose" 
                              placeholder="e.g. Inventory restocking" 
                              value={applyPurpose}
                              onChange={(e) => setApplyPurpose(e.target.value)}
                              required
                              className="h-10 rounded-md border-slate-200"
                          />
                      </div>
                      <div className="flex gap-3 justify-end pt-2">
                          <Button type="button" variant="ghost" onClick={() => setIsApplyLoanOpen(null)} className="h-10 px-4 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900">Cancel</Button>
                          <Button type="submit" variant="default" className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 shadow-sm font-medium" disabled={isApplying}>
                              {isApplying ? "Creating..." : "Continue"}
                          </Button>
                      </div>
                  </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation ─── */}
      <AnimatePresence>
        {shopToDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => !isDeleting && setShopToDelete(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: 10 }} 
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative z-10 bg-white border border-slate-200 shadow-xl rounded-xl p-6 max-w-sm w-full"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-600 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Remove Shop?</h3>
                <p className="text-slate-500 mb-6 text-sm">This action cannot be undone. All data will be permanently removed.</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" disabled={isDeleting} onClick={() => setShopToDelete(null)} className="rounded-md px-5 h-9 text-sm border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">Cancel</Button>
                <Button variant="destructive" disabled={isDeleting} onClick={() => handleDeleteShop(shopToDelete)} className="rounded-md px-5 h-9 text-sm bg-red-600 hover:bg-red-700">
                  {isDeleting ? "Removing..." : "Remove"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── View Documents Modal ─── */}
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
