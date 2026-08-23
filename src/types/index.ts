export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp'

export type TargetSizePreset = '2MB' | '1MB' | '500KB' | 'custom' | null

export type ResizeMode = 'none' | 'width' | 'height' | 'longEdge'

export interface ConversionSettings {
  outputFormat: OutputFormat
  quality: number // 0.1 ~ 1.0
  targetSizePreset: TargetSizePreset
  targetSizeKB: number | null // null = quality slider mode
  resizeMode: ResizeMode
  resizeValue: number | null // px, null when resizeMode is 'none'
}

export type FileStatus = 'pending' | 'converting' | 'done' | 'error'

export interface ConvertedFile {
  id: string
  originalFile: File
  originalSizeBytes: number
  convertedBlob: Blob | null
  convertedSizeBytes: number | null
  outputFilename: string
  status: FileStatus
  errorMessage: string | null
  previewUrl: string | null
}
