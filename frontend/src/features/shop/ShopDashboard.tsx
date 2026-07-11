import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Edit, Store, Activity, IndianRupee, TrendingUp, TrendingDown, User, X, Sparkles, ChevronRight, Zap, AlertCircle, Trash2, Search, Upload } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [shopToDelete, setShopToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [isApplyLoanOpen, setIsApplyLoanOpen] = useState<number | null>(null)
  const [applyAmount, setApplyAmount] = useState("")
  const [applyPurpose, setApplyPurpose] = useState("")
  const [isApplying, setIsApplying] = useState(false)

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
  }, [])

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save logic
    setIsProfileOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center">
          <AlertCircle className="w-6 h-6 mr-2" />
          {error}
        </div>
      </div>
    )
  }

  const activeApplications = shops.flatMap(s => s.applications || [])
  const totalSales = shops.reduce((acc, shop) => acc + (shop.monthly_sales || 0), 0)
  const healthScore = shops.length > 0 ? 85 : 0 

  // Dynamic Chart Data mapping (Simulated trend based on total sales for demo purposes)
  const chartData = [
    { month: 'Jan', sales: totalSales * 0.6, score: 65 },
    { month: 'Feb', sales: totalSales * 0.75, score: 68 },
    { month: 'Mar', sales: totalSales * 0.8, score: 74 },
    { month: 'Apr', sales: totalSales * 0.9, score: 79 },
    { month: 'May', sales: totalSales || 50000, score: 85 },
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 relative">
      {/* Header Area */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
            Welcome back, {profile.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsProfileOpen(true)} variant="outline" className="border-primary/20 hover:bg-primary/5 transition-all">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button onClick={() => navigate("/register")} className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Shop
          </Button>
        </div>
      </motion.div>

      {shops.length === 0 ? (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-indigo-500/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-primary to-indigo-500 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Digitize Your Kirana Business</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Register your shop to access AI-driven insights, track your growth, and unlock instant micro-loans tailored to your sales performance.
            </p>
            <Button size="lg" onClick={() => navigate("/register")} className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all group">
              Get Started Now
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Main Dashboard */
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-24 h-24 text-emerald-500" /></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Business Health</CardTitle>
                  <div className="p-2 bg-emerald-500/10 rounded-full"><Activity className="h-4 w-4 text-emerald-500" /></div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-emerald-500">{healthScore}/100</div>
                  <div className="flex items-center mt-2 text-sm text-emerald-500 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5.2% from last month
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Store className="w-24 h-24 text-blue-500" /></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
                  <div className="p-2 bg-blue-500/10 rounded-full"><Store className="h-4 w-4 text-blue-500" /></div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{activeApplications.length}</div>
                  {activeApplications.length > 0 ? (
                    <div className="flex flex-col gap-1 mt-2">
                      {activeApplications.slice(0,2).map((app, idx) => (
                         <div key={idx} className="flex items-center text-xs bg-muted/50 p-1.5 rounded-md">
                           {app.status === 'processing' ? (
                             <span className="flex items-center text-orange-500 font-medium"><div className="animate-spin w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full mr-1.5"></div> Analyzing...</span>
                           ) : app.status === 'completed' ? (
                             <span className="text-emerald-500 font-medium">Ready</span>
                           ) : (
                             <span className="text-muted-foreground capitalize">{app.status.replace("_", " ")}</span>
                           )}
                         </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">No active loans processing</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee className="w-24 h-24 text-indigo-500" /></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Est. Monthly Sales</CardTitle>
                  <div className="p-2 bg-indigo-500/10 rounded-full"><IndianRupee className="h-4 w-4 text-indigo-500" /></div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{totalSales === 0 ? '₹0' : `₹${(totalSales / 1000).toFixed(1)}k`}</div>
                  <div className="flex items-center mt-2 text-sm text-indigo-500 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3 mr-1" />
                    AI Optimized
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Chart Area */}
            <motion.div variants={itemVariants} className="col-span-1">
              <Card className="border-border/50 bg-background/50 backdrop-blur-xl h-full">
                <CardHeader>
                  <CardTitle>Sales & Growth Trend</CardTitle>
                  <CardDescription>Your aggregated performance over the last 5 months.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" dy={10} />
                        <YAxis tickLine={false} axisLine={false} className="text-xs text-muted-foreground" tickFormatter={(val) => val === 0 ? '₹0' : `₹${val/1000}k`} />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: '1px solid hsl(var(--border))', 
                            backgroundColor: 'hsl(var(--background)/0.8)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                          }} 
                        />
                        <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Shop Management Section */}
          <motion.div variants={itemVariants} className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Manage Locations</h2>
                <p className="text-muted-foreground text-sm">View, update, or remove your registered shops.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search shops..." 
                  className="pl-9 bg-background/50 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/50 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {shops.filter(s => s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase())).map(shop => (
                  <motion.div 
                    key={shop.id} 
                    layout 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="group overflow-hidden border-white/10 dark:border-white/5 bg-background/30 dark:bg-background/10 backdrop-blur-3xl shadow-xl hover:shadow-[0_0_2.5rem_-0.5rem_rgba(79,70,229,0.3)] transition-all duration-500 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="pb-3 relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{shop.shop_name}</CardTitle>
                            <CardDescription className="flex items-center mt-1.5 text-foreground/60 group-hover:text-foreground/80 transition-colors duration-300">
                              <Store className="w-3.5 h-3.5 mr-1.5" />
                              {shop.category}
                            </CardDescription>
                          </div>
                          <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm backdrop-blur-md">
                            {shop.city}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 relative z-10">
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground font-medium">Monthly Sales</span>
                            <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-sm">₹{(shop.monthly_sales / 1000).toFixed(1)}k</span>
                          </div>
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground font-medium">Business Age</span>
                            <span className="font-semibold text-foreground/90">{shop.years_in_business} Years</span>
                          </div>
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground font-medium">Active Loans</span>
                            <span className="font-semibold text-foreground/90 bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">{shop.applications?.length || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0 flex gap-2 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity border-t border-border/50 mt-4 bg-muted/10 flex-wrap">
                        {(() => {
                            const pendingApp = shop.applications?.find(a => a.status === 'pending_documents' || a.status === 'draft');
                            const activeApp = shop.applications?.find(a => a.status === 'processing' || a.status === 'under_review');
                            
                            if (pendingApp) {
                                return (
                                    <Button 
                                      key={`upload-${pendingApp.id}`}
                                      variant="default" 
                                      className="flex-1 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all basis-full mb-2" 
                                      onClick={() => navigate(`/applications/${pendingApp.id}/documents`)}
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Evidence (Action Required)
                                    </Button>
                                );
                            } else if (activeApp) {
                                return (
                                    <Button 
                                      key={`active-${activeApp.id}`}
                                      variant="secondary" 
                                      disabled
                                      className="flex-1 w-full opacity-80 basis-full mb-2" 
                                    >
                                      <Activity className="w-4 h-4 mr-2" />
                                      Application Processing
                                    </Button>
                                );
                            } else {
                                return (
                                    <Button 
                                      key={`apply-${shop.id}`}
                                      variant="default" 
                                      className="flex-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all basis-full mb-2" 
                                      onClick={() => setIsApplyLoanOpen(shop.id)}
                                    >
                                      <IndianRupee className="w-4 h-4 mr-2" />
                                      Apply for Loan
                                    </Button>
                                );
                            }
                        })()}
                        <Button variant="secondary" className="flex-1 hover:bg-primary hover:text-primary-foreground shadow-sm transition-all" onClick={() => navigate(`/shops/${shop.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" className="flex-none bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all" onClick={() => setShopToDelete(shop.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {shops.filter(s => s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-xl bg-background/50 backdrop-blur-sm">
                  <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No shops found</h3>
                  <p className="text-muted-foreground mt-1">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Profile Edit Slide-out (Custom Sheet) */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div>
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">Update your personal details here.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsProfileOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <form id="profile-form" onSubmit={handleProfileSave} className="space-y-6">
                  
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center justify-center mb-6">
                    <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center border border-primary/20 relative group cursor-pointer hover:border-primary transition-all shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                      <User className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-xs font-semibold text-primary tracking-wider uppercase">Change</span>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                      Personal Info
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                  </div>

                  <hr className="border-border/50 my-6" />

                  {/* Preferences Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                      Preferences & Role
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="role">Business Role</Label>
                      <Input 
                        id="role" 
                        value={profile.role}
                        onChange={(e) => setProfile({...profile, role: e.target.value})}
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Preferred Language</Label>
                      <Input 
                        id="language" 
                        value={profile.language}
                        onChange={(e) => setProfile({...profile, language: e.target.value})}
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                  </div>

                  <hr className="border-border/50 my-6" />

                  {/* Security Section */}
                  <div className="space-y-4 pb-4">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                      Security
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-border/50 bg-muted/20">
                <Button type="submit" form="profile-form" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all">
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Apply Loan Modal */}
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
                  className="bg-card w-full max-w-md p-6 rounded-xl shadow-2xl border border-border"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold">Apply for a New Loan</h3>
                            <p className="text-sm text-muted-foreground mt-1">Provide basic details to start a new application.</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsApplyLoanOpen(null)}>
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
                            />
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsApplyLoanOpen(null)}>Cancel</Button>
                            <Button type="submit" variant="default" className="bg-emerald-600 hover:bg-emerald-700" disabled={isApplying}>
                                {isApplying ? "Starting..." : "Continue to Evidence"}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {shopToDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isDeleting && setShopToDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 bg-background border border-border shadow-2xl rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Shop?</h3>
              <p className="text-muted-foreground mb-6">Are you sure you want to permanently delete this shop? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" disabled={isDeleting} onClick={() => setShopToDelete(null)}>Cancel</Button>
                <Button variant="destructive" disabled={isDeleting} onClick={() => handleDeleteShop(shopToDelete)}>
                  {isDeleting ? "Deleting..." : "Delete Shop"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
