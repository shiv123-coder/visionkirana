import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/FileUpload"
import { LiveAudioRecorder } from "@/components/ui/LiveAudioRecorder"
import { uploadFile, deleteUpload, type FileCategory, type SpecificType } from "@/services/uploadService"
import { ArrowLeft, CheckCircle2, Image as ImageIcon, FileText, Mic, Sparkles } from "lucide-react"
import { triggerAnalysisApiV1AnalysisTriggerApplicationIdPost } from "@/client"
import { motion } from "framer-motion"
import "@/api-client"

export function DocumentUploadView() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  
  const [uploadState, setUploadState] = useState<Record<string, { uploading: boolean, success: boolean, error?: string, docId?: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audioMode, setAudioMode] = useState<"upload" | "record">("upload")

  const handleUpload = async (file: File, category: FileCategory, type: SpecificType, key: string) => {
    if (!applicationId) return
    
    setUploadState(prev => ({ ...prev, [key]: { uploading: true, success: false } }))
    
    try {
      const res = await uploadFile(file, parseInt(applicationId), category, type)
      setUploadState(prev => ({ ...prev, [key]: { uploading: false, success: true, docId: res.id.toString() } }))
    } catch (error: any) {
      setUploadState(prev => ({ ...prev, [key]: { uploading: false, success: false, error: error.message } }))
    }
  }

  const handleRemove = async (key: string) => {
    const docId = uploadState[key]?.docId;
    if (docId) {
      try {
        await deleteUpload(docId);
      } catch (err) {
        console.error("Failed to delete upload on server:", err);
      }
    }
    // Clear state regardless of server success to ensure UI updates
    setUploadState(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }

  const getUploadProps = (key: string) => ({
    isUploading: uploadState[key]?.uploading || false,
    isSuccess: uploadState[key]?.success || false,
    onRemove: () => handleRemove(key)
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
    <div className="min-h-screen bg-background pb-20">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Evidence Upload</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Upload required evidence for Application <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md text-sm">#{applicationId}</span>. The AI will analyze this immediately.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Images Section */}
          <motion.div variants={itemVariants} className="md:col-span-8">
            <Card className="h-full border-border/40 bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
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

          {/* Voice Section */}
          <motion.div variants={itemVariants} className="md:col-span-4">
            <Card className="h-full border-border/40 bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border/50 bg-background/40">
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-indigo-500" />
                  <CardTitle className="text-xl">Voice Pitch</CardTitle>
                </div>
                <CardDescription>Explain your loan requirements</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                
                <div className="flex bg-background/50 backdrop-blur-sm p-1 rounded-lg border border-border/50 mb-6 relative">
                  {/* Sliding highlight */}
                  <motion.div 
                    layoutId="audioModeTab"
                    className="absolute top-1 bottom-1 left-1 bg-indigo-500/20 rounded-md border border-indigo-500/30 w-[calc(50%-4px)]"
                    animate={{ x: audioMode === "upload" ? 0 : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                  <button 
                    className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${audioMode === "upload" ? "text-indigo-500" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setAudioMode("upload")}
                  >
                    Upload File
                  </button>
                  <button 
                    className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${audioMode === "record" ? "text-indigo-500" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setAudioMode("record")}
                  >
                    Record Live
                  </button>
                </div>

                <div className="min-h-[220px]">
                  {audioMode === "upload" ? (
                    <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <FileUpload 
                        label="Audio Recording"
                        accept="audio/mpeg, audio/wav, audio/x-m4a, audio/mp4"
                        maxSizeMB={10}
                        onFileSelect={(f) => handleUpload(f, "audio", "voice_note", "audio")}
                        {...getUploadProps("audio")}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="record" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <LiveAudioRecorder 
                        onAudioReady={(f) => handleUpload(f, "audio", "voice_note", "audio")}
                        {...getUploadProps("audio")}
                      />
                    </motion.div>
                  )}
                </div>

                {uploadState["audio"]?.error && <p className="text-xs text-destructive mt-1 font-medium text-center">{uploadState["audio"].error}</p>}
                
                <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-foreground/80">
                  <strong>Tip:</strong> Speak clearly about why you need the loan and how your business is currently performing.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Documents */}
          <motion.div variants={itemVariants} className="md:col-span-12">
            <Card className="border-border/40 bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
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
              className="h-12 px-8 text-base rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all"
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
