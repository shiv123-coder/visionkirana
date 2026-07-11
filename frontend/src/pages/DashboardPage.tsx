import { useAuth } from "@/contexts/AuthContext"
import { AdminDashboard } from "@/features/dashboard/AdminDashboard"
import { LoanOfficerDashboard } from "@/features/dashboard/LoanOfficerDashboard"
import { ShopDashboard } from "@/features/shop/ShopDashboard"
import { Navigate } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"

export function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />
  }

  if (user.role === "loan_officer") {
    return <Navigate to="/officer" replace />
  }

  const renderDashboard = () => {
    return <ShopDashboard />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {renderDashboard()}
    </div>
  )
}
