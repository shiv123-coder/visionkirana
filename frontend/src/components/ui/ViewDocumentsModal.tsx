import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, Image as ImageIcon, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getApplicationDocuments } from "@/services/uploadService"
import type { DocumentMetadata } from "@/services/uploadService"
import { getSecureDocumentUrlApiV1DocumentsDocumentIdUrlGet } from "@/client"

interface ViewDocumentsModalProps {
  applicationId: string
  isOpen: boolean
  onClose: () => void
}

export function ViewDocumentsModal({ applicationId, isOpen, onClose }: ViewDocumentsModalProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (isOpen) {
      const fetchDocs = async () => {
        setLoading(true)
        setError(null)
        try {
          const docs = await getApplicationDocuments(applicationId)
          setDocuments(docs)
        } catch (err: any) {
          setError(err.message || "Failed to load documents")
        } finally {
          setLoading(false)
        }
      }
      fetchDocs()
    }
  }, [isOpen, applicationId])

  const handleOpenDocument = async (docId: string) => {
    try {
      const { data, error } = await getSecureDocumentUrlApiV1DocumentsDocumentIdUrlGet({
        path: { document_id: docId }
      })
      if (error) throw new Error("Failed to secure URL")
      const responseData = data as any;
      if (responseData?.url) {
        window.open(responseData.url, "_blank")
      }
    } catch (err) {
      alert("Failed to open document. It may have been deleted or expired.")
    }
  }

  const getIcon = (category: string) => {
    if (category === "voice") return <Mic className="w-5 h-5 text-indigo-500" />
    if (category === "image") return <ImageIcon className="w-5 h-5 text-blue-500" />
    return <FileText className="w-5 h-5 text-emerald-500" />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.98, y: 10 }} 
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-2xl bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Application Documents</h3>
                <p className="text-sm text-slate-500 mt-1">Files uploaded for application #{applicationId.substring(0, 8)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-sm text-slate-500 font-medium tracking-wide">Loading documents...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg p-4 font-medium text-sm">
                  {error}
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-slate-900">No documents found</h4>
                  <p className="text-xs text-slate-500 mt-1">This application doesn't have any uploaded files yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map(doc => (
                    <div 
                      key={doc.id} 
                      className="group flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => handleOpenDocument(doc.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-slate-100 group-hover:bg-white transition-colors shadow-sm">
                          {getIcon(doc.category)}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {doc.category}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm text-slate-900 capitalize line-clamp-1">{doc.type.replace(/_/g, " ")}</h4>
                        <p className="text-xs font-medium text-slate-500">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                        View Secure File &rarr;
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button onClick={onClose} variant="outline" className="h-9 px-4 text-sm rounded-md border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900">Close Window</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
