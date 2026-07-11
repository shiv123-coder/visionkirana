import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/FileUpload"
import { uploadFile, type FileCategory, type SpecificType } from "@/services/uploadService"
import { ArrowLeft, CheckCircle2, Image as ImageIcon, FileText, Mic, Sparkles } from "lucide-react"
import { triggerAnalysisApiV1AnalysisTriggerApplicationIdPost } from "@/client"
import { motion } from "framer-motion"
import "@/api-client"

export function DocumentUploadView() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  
  const [uploadState, setUploadState] = useState<Record<string, { uploading: boolean, success: boolean, error?: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpload = async (file: File, category: FileCategory, type: SpecificType, key: string) => {
    if (!applicationId) return
    
    setUploadState(prev => ({ ...prev, [key]: { uploading: true, success: false } }))
    
    try {
      await uploadFile(file, parseInt(applicationId), category, type)
      setUploadState(prev => ({ ...prev, [key]: { uploading: false, success: true } }))
    } catch (error: any) {
      setUploadState(prev => ({ ...prev, [key]: { uploading: false, success: false, error: error.message } }))
    }
  }

  const getUploadProps = (key: string) => ({
    isUploading: uploadState[key]?.uploading || false,
    isSuccess: uploadState[key]?.success || false,
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex flex-col items-start"
        >
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 hover:bg-background/50 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Evidence Upload</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Please upload the required evidence for Application <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">#{applicationId}</span>. The AI will analyze this immediately.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Images Section (Bento Grid Item 1 - spans 8 cols) */}
          <motion.div variants={itemVariants} className="md:col-span-8">
            <Card className="h-full border-primary/10 bg-card/60 backdrop-blur-xl shadow-xl hover:border-primary/30 transition-colors duration-500 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="border-b border-border/50 bg-background/40">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <CardTitle className="text-xl">Shop Visuals</CardTitle>
                </div>
                <CardDescription>Upload clear photos of your business (Max 5MB each)</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <FileUpload 
                      label="Shop Front"
                      accept="image/jpeg, image/png, image/webp"
                      maxSizeMB={5}
                      onFileSelect={(f) => handleUpload(f, "image", "shop_front", "shop_front")}
                      {...getUploadProps("shop_front")}
                    />
                    {uploadState["shop_front"]?.error && <p className="text-xs text-destructive mt-1 font-medium">{uploadState["shop_front"].error}</p>}
                  </div>
                  <div>
                    <FileUpload 
                      label="Shelf Images"
                      accept="image/jpeg, image/png, image/webp"
                      maxSizeMB={5}
                      onFileSelect={(f) => handleUpload(f, "image", "inventory", "shelves")}
                      {...getUploadProps("shelves")}
                    />
                    {uploadState["shelves"]?.error && <p className="text-xs text-destructive mt-1 font-medium">{uploadState["shelves"].error}</p>}
                  </div>
                  <div>
                    <FileUpload 
                      label="Inventory / Stock"
                      accept="image/jpeg, image/png, image/webp"
                      maxSizeMB={5}
                      onFileSelect={(f) => handleUpload(f, "image", "inventory", "stock")}
                      {...getUploadProps("stock")}
                    />
                    {uploadState["stock"]?.error && <p className="text-xs text-destructive mt-1 font-medium">{uploadState["stock"].error}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Voice Section (Bento Grid Item 2 - spans 4 cols) */}
          <motion.div variants={itemVariants} className="md:col-span-4">
            <Card className="h-full border-indigo-500/10 bg-card/60 backdrop-blur-xl shadow-xl hover:border-indigo-500/30 transition-colors duration-500 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="border-b border-border/50 bg-background/40">
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-indigo-500" />
                  <CardTitle className="text-xl">Voice Pitch</CardTitle>
                </div>
                <CardDescription>Explain your loan requirements</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <FileUpload 
                  label="Audio Recording"
                  accept="audio/mpeg, audio/wav, audio/x-m4a, audio/mp4"
                  maxSizeMB={10}
                  onFileSelect={(f) => handleUpload(f, "audio", "voice_note", "audio")}
                  {...getUploadProps("audio")}
                />
                {uploadState["audio"]?.error && <p className="text-xs text-destructive mt-1 font-medium">{uploadState["audio"].error}</p>}
                
                <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-foreground/80">
                  <strong>Tip:</strong> Speak clearly about why you need the loan and how your business is currently performing.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Documents (Bento Grid Item 3 - spans 12 cols) */}
          <motion.div variants={itemVariants} className="md:col-span-12">
            <Card className="border-emerald-500/10 bg-card/60 backdrop-blur-xl shadow-xl hover:border-emerald-500/30 transition-colors duration-500 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="border-b border-border/50 bg-background/40">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <CardTitle className="text-xl">Financial Documents</CardTitle>
                </div>
                <CardDescription>Upload PDF invoices or receipts to verify your volume (Max 10MB each)</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <FileUpload 
                      label="Distributor Invoices"
                      accept="application/pdf"
                      maxSizeMB={10}
                      onFileSelect={(f) => handleUpload(f, "document", "invoice", "invoice")}
                      {...getUploadProps("invoice")}
                    />
                    {uploadState["invoice"]?.error && <p className="text-xs text-destructive mt-1 font-medium">{uploadState["invoice"].error}</p>}
                  </div>
                  <div>
                    <FileUpload 
                      label="Payment Receipts"
                      accept="application/pdf"
                      maxSizeMB={10}
                      onFileSelect={(f) => handleUpload(f, "document", "receipt", "receipt")}
                      {...getUploadProps("receipt")}
                    />
                    {uploadState["receipt"]?.error && <p className="text-xs text-destructive mt-1 font-medium">{uploadState["receipt"].error}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Action */}
          <motion.div variants={itemVariants} className="md:col-span-12 flex justify-end pt-6">
            <Button 
              variant="premium" 
              size="lg" 
              className="h-14 px-8 text-lg rounded-2xl shadow-[0_0_2rem_-0.5rem_#10b981] hover:shadow-[0_0_3rem_-0.5rem_#10b981] transition-all duration-300"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  const { error } = await triggerAnalysisApiV1AnalysisTriggerApplicationIdPost({
                    path: { application_id: applicationId! }
                  });
                  if (error) {
                    throw new Error("Analysis trigger failed");
                  }
                  navigate("/dashboard");
                } catch (error) {
                  console.error("Failed to trigger analysis", error);
                  navigate("/dashboard");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Submitting...
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Finish & Submit Application
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
