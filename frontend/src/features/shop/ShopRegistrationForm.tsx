import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useOfflineSync } from "@/contexts/OfflineContext"
import { enqueueRequest } from "@/lib/syncEngine"

const shopRegistrationSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  owner_name: z.string().min(2, "Owner name must be at least 2 characters"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  years_in_business: z.coerce.number().min(0, "Must be a valid number"),
  monthly_sales: z.coerce.number().min(0, "Must be a valid number"),
  requested_loan: z.coerce.number().min(1000, "Minimum loan is 1000"),
  loan_purpose: z.string().min(5, "Purpose is required"),
})

type ShopRegistrationValues = z.infer<typeof shopRegistrationSchema>

export function ShopRegistrationForm() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  
  const { user } = useAuth()
  const { isOnline, refreshQueueCount } = useOfflineSync()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopRegistrationValues>({
    resolver: zodResolver(shopRegistrationSchema) as any,
    defaultValues: {
      category: "Grocery / FMCG",
      years_in_business: 1,
      monthly_sales: 50000,
      requested_loan: 100000,
    }
  })

  const onSubmit = async (data: ShopRegistrationValues) => {
    setIsSubmitting(true)
    setError("")

    
    try {
      const payload = { ...data, owner_id: user?.id || "" }
      const token = localStorage.getItem("access_token")
      
      if (!isOnline) {
        await enqueueRequest("/api/v1/shops/register", "POST", {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }, payload);
        
        await refreshQueueCount();

        reset()
        setError("Saved Locally: You are currently offline. This application will be synced automatically when your connection is restored.")
        return
      }
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://visionkirana-api.onrender.com";
      const response = await fetch(`${apiUrl}/api/v1/shops/register`.replace(/([^:]\/)\/+/g, "$1"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        let errorMsg = "Failed to register shop. Please check your token or login.";
        try {
          const errData = await response.json();
          errorMsg = errData.detail || errorMsg;
        } catch (e) {
          // ignore if response is not JSON
        }
        throw new Error(errorMsg);
      }

      const result = await response.json()
      console.log("Registration successful", result)
      alert("Registration Successful!")
      navigate("/dashboard")
      
    } catch (err: any) {
      console.error("Registration error:", err);
      // If it's a network error (Failed to fetch), clarify it.
      if (err.message === "Failed to fetch") {
        setError("Network Error: Could not connect to the server. If you are running locally, ensure the backend is running. Otherwise, check your internet connection.");
      } else {
        setError(err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/5 rounded-t-lg border-b mb-6">
          <CardTitle className="text-3xl text-primary">Register Your Shop</CardTitle>
          <CardDescription>
            {isOnline ? "Enter your business details to apply for an instant credit limit." : "Offline Mode: Forms submitted now will be safely queued and synchronized later."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && <div className={`p-4 rounded-md ${error.includes('Saved Locally') ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-destructive/10 text-destructive'} text-sm font-medium`}>{error}</div>}
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name *</Label>
                  <Input id="name" {...register("name")} placeholder="Shree Ji Kirana" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input id="owner_name" {...register("owner_name")} placeholder="Rahul Sharma" />
                  {errors.owner_name && <p className="text-sm text-destructive">{errors.owner_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input id="mobile" {...register("mobile")} placeholder="9876543210" />
                  {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" {...register("category")} placeholder="Grocery, Pharmacy, Hardware..." />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Location</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Input id="address" {...register("address")} placeholder="123 Main Market Road" />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register("city")} placeholder="Jaipur" />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" {...register("state")} placeholder="Rajasthan" />
                  {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Financials & Loan Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="years_in_business">Years in Business *</Label>
                  <Input id="years_in_business" type="number" {...register("years_in_business")} />
                  {errors.years_in_business && <p className="text-sm text-destructive">{errors.years_in_business.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_sales">Estimated Monthly Sales (₹) *</Label>
                  <Input id="monthly_sales" type="number" {...register("monthly_sales")} />
                  {errors.monthly_sales && <p className="text-sm text-destructive">{errors.monthly_sales.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requested_loan">Requested Loan Amount (₹) *</Label>
                  <Input id="requested_loan" type="number" {...register("requested_loan")} />
                  {errors.requested_loan && <p className="text-sm text-destructive">{errors.requested_loan.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_purpose">Loan Purpose *</Label>
                  <Input id="loan_purpose" {...register("loan_purpose")} placeholder="Working capital, inventory..." />
                  {errors.loan_purpose && <p className="text-sm text-destructive">{errors.loan_purpose.message}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" variant="premium" className="w-full h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
