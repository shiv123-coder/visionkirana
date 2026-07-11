import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { getShopApiV1ShopsShopIdGet, updateShopApiV1ShopsShopIdPut } from "@/client"
import "@/api-client"

const shopUpdateSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  owner_name: z.string().min(2, "Owner name must be at least 2 characters"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  years_in_business: z.coerce.number().min(0, "Must be a valid number"),
  monthly_sales: z.coerce.number().min(0, "Must be a valid number"),
  // Optional application fields if there's a draft
  requested_loan: z.coerce.number().min(1000, "Minimum loan is 1000").optional(),
  loan_purpose: z.string().min(5, "Purpose is required").optional(),
})

type ShopUpdateValues = z.infer<typeof shopUpdateSchema>

export function ShopEditForm() {
  const navigate = useNavigate()
  const { shopId } = useParams<{ shopId: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopUpdateValues>({
    resolver: zodResolver(shopUpdateSchema) as any,
  })

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const { data, error } = await getShopApiV1ShopsShopIdGet({ path: { shop_id: shopId! } })

        if (error) {
          throw new Error("Failed to fetch shop details")
        }
        
        let draftApp = null
        if ((data as any).applications && (data as any).applications.length > 0) {
            draftApp = (data as any).applications.find((app: any) => app.status === "draft")
        }

        reset({
          name: (data as any).name || (data as any).shop_name,
          owner_name: (data as any).owner_name,
          mobile: (data as any).mobile,
          address: (data as any).address,
          city: (data as any).city,
          state: (data as any).state,
          category: (data as any).category,
          years_in_business: (data as any).years_in_business,
          monthly_sales: (data as any).monthly_sales,
          requested_loan: draftApp ? draftApp.requested_amount : undefined,
          loan_purpose: draftApp ? draftApp.purpose : undefined,
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (shopId) {
      fetchShopDetails()
    }
  }, [shopId, reset])

  const onSubmit = async (data: ShopUpdateValues) => {
    setIsSubmitting(true)
    setError("")
    
    try {
      const { error: apiError } = await updateShopApiV1ShopsShopIdPut({ 
        path: { shop_id: shopId! }, 
        body: data 
      })
      
      if (apiError) {
        throw new Error("Failed to update shop details.")
      }

      alert("Update Successful!")
      navigate("/dashboard")
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading shop details...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-primary/5 rounded-t-lg border-b mb-6">
          <CardTitle className="text-3xl text-primary">Edit Shop Details</CardTitle>
          <CardDescription>
            Update your business information and application details.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium">{error}</div>}
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input id="owner_name" {...register("owner_name")} />
                  {errors.owner_name && <p className="text-sm text-destructive">{errors.owner_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input id="mobile" {...register("mobile")} />
                  {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" {...register("category")} />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Location</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Input id="address" {...register("address")} />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register("city")} />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" {...register("state")} />
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
                
                {/* Only show these if they were populated from a draft application */}
                <div className="space-y-2">
                  <Label htmlFor="requested_loan">Requested Loan Amount (₹) (Draft)</Label>
                  <Input id="requested_loan" type="number" {...register("requested_loan")} />
                  {errors.requested_loan && <p className="text-sm text-destructive">{errors.requested_loan.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_purpose">Loan Purpose (Draft)</Label>
                  <Input id="loan_purpose" {...register("loan_purpose")} />
                  {errors.loan_purpose && <p className="text-sm text-destructive">{errors.loan_purpose.message}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" variant="premium" className="w-full h-12 text-lg" disabled={isSubmitting}>
              {isSubmitting ? "Saving Updates..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
