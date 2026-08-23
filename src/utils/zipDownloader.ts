import JSZip from 'jszip'
import type { ConvertedFile } from '../types'

export async function downloadAsZip(files: ConvertedFile[]): Promise<void> {
  const zip = new JSZip()

  for (const f of files) {
    if (f.convertedBlob) {
      zip.file(f.outputFilename, f.convertedBlob)
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '変換済み画像.zip'
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadSingle(file: ConvertedFile): void {
  if (!file.convertedBlob) return
  const url = URL.createObjectURL(file.convertedBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.outputFilename
  a.click()
  URL.revokeObjectURL(url)
}
