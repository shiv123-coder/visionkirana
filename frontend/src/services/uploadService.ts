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
  applicationId: number,
  fileCategory: FileCategory,
  specificType: SpecificType
): Promise<UploadResponse> => {
  
  const { data, error } = await uploadEvidenceApiV1UploadPost({
    body: {
      file: file,
      application_id: applicationId.toString(),
      file_category: fileCategory,
      specific_type: specificType
    }
  })

  if (error) {
    throw new Error((error as any)?.detail || "Failed to upload file")
  }

  return data as any as UploadResponse
}
