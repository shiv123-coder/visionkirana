import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { submitDemoRequest } from "@/services/adminService"

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    
    try {
      await submitDemoRequest(formData)
      setIsSuccess(true)
      
      // Reset form state after a few seconds
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({ first_name: "", last_name: "", email: "", company: "" })
      }, 5000)
    } catch (error) {
      console.error("Failed to submit demo request:", error)
      setErrorMsg("Failed to connect to the server. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto bg-card border rounded-3xl p-8 md:p-16 shadow-2xl relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to Transform Your Underwriting?</h2>
            <p className="text-lg text-muted-foreground">Request a demo or get access to our API documentation.</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Work Email</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="john@bank.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company</label>
              <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Finance Corp" />
            </div>
            
            {errorMsg && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center">
                {errorMsg}
              </div>
            )}
            
            <Button 
              type="submit" 
              variant={isSuccess ? "outline" : "premium"} 
              className={`w-full mt-4 h-12 text-md transition-all ${isSuccess ? 'border-green-500 text-green-500 hover:text-green-600 hover:border-green-600 hover:bg-green-50/10' : ''}`}
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending Request...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Request Received!
                </span>
              ) : (
                "Request Access"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
