import { useState, useRef, ChangeEvent, DragEvent } from "react"
import { UploadCloud, File as FileIcon, X, CheckCircle } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface FileUploadProps {
  accept: string
  maxSizeMB: number
  onFileSelect: (file: File) => void
  label?: string
  description?: string
  isUploading?: boolean
  isSuccess?: boolean
  className?: string
  onRemove?: () => void
}

export function FileUpload({
  accept,
  maxSizeMB,
  onFileSelect,
  label = "Upload File",
  description,
  isUploading = false,
  isSuccess = false,
  className,
  onRemove
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    setError(null)
    
    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return false
    }

    // Check type (simplified check based on accept string like "image/*" or "application/pdf")
    const acceptTypes = accept.split(",").map(t => t.trim())
    const fileType = file.type
    
    let isValidType = false
    for (const type of acceptTypes) {
      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0]
        if (fileType.startsWith(`${baseType}/`)) {
          isValidType = true
          break
        }
      } else if (fileType === type || file.name.endsWith(type)) {
        isValidType = true
        break
      }
    }

    if (!isValidType) {
      setError(`Invalid file type. Accepted: ${accept}`)
      return false
    }

    return true
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  const clearFile = () => {
    if (onRemove) {
      onRemove()
    }
    setSelectedFile(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      
      <AnimatePresence mode="wait">
      {!selectedFile || error ? (
        <motion.div 
          key="upload-zone"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 ease-out overflow-hidden cursor-pointer",
            "bg-background/40 backdrop-blur-md shadow-sm",
            dragActive ? "border-primary bg-primary/10 scale-[1.02] shadow-primary/20 shadow-lg" : "border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5",
            error ? "border-destructive bg-destructive/10" : ""
          )}
          onClick={onButtonClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {dragActive && (
            <motion.div 
              layoutId="active-bg"
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" 
            />
          )}
          
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          
          <motion.div
            animate={dragActive ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <UploadCloud className={cn("w-12 h-12 mb-4", error ? "text-destructive" : dragActive ? "text-primary" : "text-muted-foreground")} />
          </motion.div>
          
          <p className="mb-2 text-base text-center font-medium">
            <span className="text-primary group-hover:underline">Click to browse</span> or drag and drop
          </p>
          
          <p className="text-xs text-muted-foreground/80 text-center max-w-[80%] mx-auto">
            {description || `Accepted: ${accept.split(',').map(s=>s.split('/')[1]||s).join(', ')} (Max ${maxSizeMB}MB)`}
          </p>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-4 text-sm text-destructive font-semibold bg-destructive/10 px-3 py-1 rounded-full"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      ) : (
        <motion.div 
          key="file-info"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-border/50 rounded-xl p-4 flex items-center justify-between bg-card/60 backdrop-blur-sm shadow-md"
        >
          <div className="flex items-center space-x-4 overflow-hidden">
            <div className={cn(
              "p-3 rounded-lg shrink-0", 
              isSuccess ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
            )}>
              {isSuccess ? <CheckCircle className="w-6 h-6" /> : <FileIcon className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground/90">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isUploading && (
              <div className="flex items-center space-x-2 text-xs font-semibold text-primary">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span>Uploading...</span>
              </div>
            )}
            
            {isSuccess && (
              <div className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                Complete
              </div>
            )}

            {!isUploading && (
              <Button variant="ghost" size="icon" onClick={clearFile} className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}
