import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ViewDocumentsModal } from "@/components/ui/ViewDocumentsModal"
import { PlusCircle, Edit, Store, Activity, IndianRupee, TrendingUp, User, X, Sparkles, ChevronRight, Zap, AlertCircle, Trash2, Search, Upload, FileText, MapPin, Clock, BarChart3, Shield, ArrowUpRight, Briefcase } from "lucide-react"
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-foreground font-semibold text-lg">Preparing your dashboard</p>
          <p className="text-muted-foreground text-sm animate-pulse">Loading shops & applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-bold text-lg">Something went wrong</p>
          <p className="text-muted-foreground">{error}</p>
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
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; border: string }> = {
      processing: { label: "AI Analyzing", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      under_review: { label: "Under Review", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      completed: { label: "Completed", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      approved: { label: "Approved", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      rejected: { label: "Rejected", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
      pending_documents: { label: "Docs Needed", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
      draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border" }
    }
    return configs[status] || { label: status.replace(/_/g, " "), color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border" }
  }

  return (
    <div className="min-h-screen">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:to-secondary/10" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--secondary) / 0.06) 0%, transparent 40%)' }} />
        
        <motion.div 
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary tracking-wide uppercase">{getGreeting()}</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {profile.name.split(' ')[0]}'s Dashboard
              </h1>
              <p className="text-muted-foreground max-w-md">
                Monitor your shops, track loan progress, and grow your business with AI-powered insights.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button 
                onClick={() => setIsProfileOpen(true)} 
                variant="outline" 
                className="h-11 px-5 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button 
                onClick={() => navigate("/register")} 
                className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Register Shop
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {shops.length === 0 ? (
          /* ─── Empty State ─── */
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto py-20 px-6 text-center">
              <div className="w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-0.5 shadow-xl shadow-primary/25">
                <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-9 h-9 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">Digitize Your Kirana</h2>
              <p className="text-muted-foreground text-base mb-10 leading-relaxed">
                Register your first shop to access AI-driven insights, credit scoring, and instant micro-loans tailored to your sales performance.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate("/register")} 
                className="h-14 px-10 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all group"
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ─── Main Dashboard ─── */
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">
            
            {/* ─── KPI Stats Row ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <motion.div variants={itemVariants}>
                <Card className="group relative overflow-hidden border-border/40 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +5.2%
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{healthScore}<span className="text-lg text-muted-foreground font-normal">/100</span></p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">Business Health</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="group relative overflow-hidden border-border/40 bg-card hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">{shops.length} active</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{activeApplications.length}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">Applications</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="group relative overflow-hidden border-border/40 bg-card hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <IndianRupee className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex items-center text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Est.
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalSales === 0 ? '₹0' : `₹${(totalSales / 1000).toFixed(0)}k`}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">Monthly Sales</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="group relative overflow-hidden border-border/40 bg-card hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{avgYears}<span className="text-lg text-muted-foreground font-normal"> yrs</span></p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">Avg. Business Age</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ─── Sales Chart ─── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/40 bg-card shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                      <CardDescription className="mt-0.5">Aggregated monthly sales across all shops</CardDescription>
                    </div>
                    <div className="flex items-center text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                      <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                      Last 5 Months
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                          <linearGradient id="shopSalesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" dy={8} />
                        <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(val) => val === 0 ? '₹0' : `₹${val/1000}k`} />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: '1px solid hsl(var(--border))', 
                            backgroundColor: 'hsl(var(--card))',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            fontSize: '13px'
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                        />
                        <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#shopSalesGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Shop Management ─── */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Your Shops</h2>
                  <p className="text-muted-foreground text-sm mt-0.5">Manage, edit, or apply for loans</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search shops..." 
                    className="pl-9 h-10 rounded-xl bg-card border-border/60 focus-visible:ring-primary/30 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {shops.filter(s => s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase())).map(shop => (
                    <motion.div 
                      key={shop.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.95, y: 16 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95, y: -16 }}
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                      <Card className="group overflow-hidden border-border/40 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-400 relative flex flex-col h-full">
                        {/* Subtle top accent line */}
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <CardHeader className="pb-3 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 flex-1 min-w-0">
                              <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors duration-300">{shop.shop_name}</CardTitle>
                              <CardDescription className="flex items-center gap-1.5 text-xs">
                                <Briefcase className="w-3 h-3 shrink-0" />
                                <span className="truncate">{shop.category}</span>
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground shrink-0 ml-3">
                              <MapPin className="w-3 h-3" />
                              {shop.city}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pb-4 flex-1">
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                                <p className="text-sm font-bold text-foreground">₹{(shop.monthly_sales / 1000).toFixed(0)}k</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Sales/mo</p>
                              </div>
                              <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                                <p className="text-sm font-bold text-foreground">{shop.years_in_business}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Years</p>
                              </div>
                              <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                                <p className="text-sm font-bold text-foreground">{shop.applications?.length || 0}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Loans</p>
                              </div>
                            </div>

                            {/* Application status badges */}
                            {shop.applications && shop.applications.length > 0 && (
                              <div className="space-y-1.5">
                                {shop.applications.slice(0, 2).map((app, idx) => {
                                  const cfg = getStatusConfig(app.status)
                                  return (
                                    <div key={idx} className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                                      <span className={`font-semibold ${cfg.color} flex items-center gap-1.5`}>
                                        {app.status === 'processing' && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                                        {cfg.label}
                                      </span>
                                      <span className="text-muted-foreground">₹{(app.requested_amount / 1000).toFixed(0)}k</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </CardContent>

                        {/* Actions footer */}
                        <div className="p-4 pt-0 space-y-2">
                          {/* Primary action */}
                          {(() => {
                              const pendingApp = shop.applications?.find(a => a.status === 'pending_documents' || a.status === 'draft');
                              const activeApp = shop.applications?.find(a => a.status === 'processing' || a.status === 'under_review');
                              
                              if (pendingApp) {
                                  return (
                                      <Button 
                                        key={`upload-${pendingApp.id}`}
                                        variant="default" 
                                        className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15 transition-all" 
                                        onClick={() => navigate(`/applications/${pendingApp.id}/documents`)}
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Evidence
                                        <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-60" />
                                      </Button>
                                  );
                              } else if (activeApp) {
                                  return (
                                      <>
                                        <Button 
                                          key={`active-${activeApp.id}`}
                                          variant="secondary" 
                                          disabled
                                          className="w-full h-10 rounded-xl opacity-70" 
                                        >
                                          <div className="w-3 h-3 border-2 border-primary/60 border-t-primary rounded-full animate-spin mr-2" />
                                          Processing Application
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          className="w-full h-10 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5"
                                          onClick={() => setViewingDocsAppId(activeApp.id.toString())}
                                        >
                                          <FileText className="w-4 h-4 mr-2" />
                                          View Uploads
                                        </Button>
                                      </>
                                  );
                              } else {
                                  return (
                                      <Button 
                                        key={`apply-${shop.id}`}
                                        variant="default" 
                                        className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15 transition-all" 
                                        onClick={() => setIsApplyLoanOpen(shop.id)}
                                      >
                                        <IndianRupee className="w-4 h-4 mr-2" />
                                        Apply for Loan
                                        <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-60" />
                                      </Button>
                                  );
                              }
                          })()}
                          {/* Secondary actions row */}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 h-9 rounded-xl text-xs border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all" 
                              onClick={() => navigate(`/shops/${shop.id}/edit`)}
                            >
                              <Edit className="w-3.5 h-3.5 mr-1.5" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              className="h-9 w-9 rounded-xl p-0 border-border/50 hover:border-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all" 
                              onClick={() => setShopToDelete(shop.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {shops.filter(s => s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="col-span-full py-16 text-center border border-dashed border-border/50 rounded-2xl bg-card/50">
                    <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="text-base font-semibold text-foreground">No shops found</h3>
                    <p className="text-muted-foreground text-sm mt-1">Try adjusting your search criteria.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* ─── Profile Edit Slide-out ─── */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div>
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Update your personal details</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsProfileOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <form id="profile-form" onSubmit={handleProfileSave} className="space-y-6">
                  
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group cursor-pointer hover:bg-primary/15 transition-all">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium mt-3">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      Personal Info
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="h-10 rounded-xl bg-muted/30 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="h-10 rounded-xl bg-muted/30 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="h-10 rounded-xl bg-muted/30 border-border/50"
                      />
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  {/* Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      Preferences
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="role">Business Role</Label>
                      <Input 
                        id="role" 
                        value={profile.role}
                        onChange={(e) => setProfile({...profile, role: e.target.value})}
                        className="h-10 rounded-xl bg-muted/30 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Preferred Language</Label>
                      <Input 
                        id="language" 
                        value={profile.language}
                        onChange={(e) => setProfile({...profile, language: e.target.value})}
                        className="h-10 rounded-xl bg-muted/30 border-border/50"
                      />
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  {/* Security */}
                  <div className="space-y-4 pb-4">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      Security
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="h-10 rounded-xl bg-muted/30 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="h-10 rounded-xl bg-muted/30 border-border/50"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-border/50 bg-muted/10">
                <Button type="submit" form="profile-form" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all">
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
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border"
              >
                  <div className="flex justify-between items-start mb-5">
                      <div>
                          <h3 className="text-xl font-bold">Apply for a Loan</h3>
                          <p className="text-sm text-muted-foreground mt-1">Provide basic details to start your application.</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsApplyLoanOpen(null)} className="rounded-full">
                          <X className="w-4 h-4" />
                      </Button>
                  </div>
                  
                  <form onSubmit={handleApplyLoan} className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="applyAmount">Requested Amount (₹)</Label>
                          <Input 
                              id="applyAmount" 
                              type="number" 
                              min="1000" 
                              placeholder="50000" 
                              value={applyAmount}
                              onChange={(e) => setApplyAmount(e.target.value)}
                              required
                              className="h-10 rounded-xl"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="applyPurpose">Loan Purpose</Label>
                          <Input 
                              id="applyPurpose" 
                              placeholder="e.g. Buying new inventory" 
                              value={applyPurpose}
                              onChange={(e) => setApplyPurpose(e.target.value)}
                              required
                              className="h-10 rounded-xl"
                          />
                      </div>
                      <div className="flex gap-2 justify-end pt-4">
                          <Button type="button" variant="ghost" onClick={() => setIsApplyLoanOpen(null)} className="rounded-xl">Cancel</Button>
                          <Button type="submit" variant="default" className="rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/15" disabled={isApplying}>
                              {isApplying ? "Starting..." : "Continue to Evidence"}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isDeleting && setShopToDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-card border border-border shadow-2xl rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500 mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Delete Shop?</h3>
                <p className="text-muted-foreground mb-6 text-sm">This action is permanent and cannot be undone. All associated data will be removed.</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" disabled={isDeleting} onClick={() => setShopToDelete(null)} className="rounded-xl px-6">Cancel</Button>
                <Button variant="destructive" disabled={isDeleting} onClick={() => handleDeleteShop(shopToDelete)} className="rounded-xl px-6">
                  {isDeleting ? "Deleting..." : "Delete Shop"}
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
