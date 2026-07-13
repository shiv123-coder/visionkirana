import { uploadEvidenceApiV1UploadPost } from "../client"
import "../api-client" // Ensure interceptor is loaded

export type FileCategory = "image" | "document" | "audio"
export type SpecificType = 
  | "shop_front" 
  | "inventory" 
  | "invoice" 
  | "receipt" 
  | "voice_note" 
  | "other"

export interface UploadResponse {
  message: string
  id: number
  url: string
}

export const uploadFile = async (
  file: File,
  applicationId: string,
  fileCategory: FileCategory,
  specificType: SpecificType
): Promise<UploadResponse> => {
  
  const { data, error } = await uploadEvidenceApiV1UploadPost({
    body: {
      file: file,
      application_id: applicationId,
      file_category: fileCategory,
      specific_type: specificType
    }
  })

  if (error) {
    throw new Error((error as any)?.detail || "Failed to upload file")
  }

  return data as any as UploadResponse
}

export const deleteUpload = async (docId: string): Promise<void> => {
  const token = localStorage.getItem("access_token")
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://visionkirana-api.onrender.com"
  
  const res = await fetch(`${apiUrl}/api/v1/upload/${docId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || "Failed to delete file")
  }
}

export interface DocumentMetadata {
  id: string
  category: string
  type: string
  uploaded_at: string
}

export const getApplicationDocuments = async (applicationId: string): Promise<DocumentMetadata[]> => {
  const token = localStorage.getItem("access_token")
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://visionkirana-api.onrender.com"
  
  const res = await fetch(`${apiUrl}/api/v1/documents/application/${applicationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || "Failed to fetch documents")
  }

  const data = await res.json()
  return data.documents as DocumentMetadata[]
}
