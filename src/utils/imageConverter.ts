import type { ConversionSettings, OutputFormat } from '../types'

function getOutputExtension(format: OutputFormat): string {
  switch (format) {
    case 'image/jpeg': return 'jpg'
    case 'image/png': return 'png'
    case 'image/webp': return 'webp'
  }
}

export function buildOutputFilename(originalName: string, format: OutputFormat): string {
  const dot = originalName.lastIndexOf('.')
  const base = dot >= 0 ? originalName.slice(0, dot) : originalName
  return `${base}.${getOutputExtension(format)}`
}

async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像の読み込みに失敗しました'))
    }
    img.src = url
  })
}

function drawToCanvas(img: HTMLImageElement, scale = 1): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('変換に失敗しました'))
      },
      format,
      format === 'image/png' ? undefined : quality,
    )
  })
}

// Binary search on quality to reach target size
async function convertWithTargetSize(
  img: HTMLImageElement,
  format: OutputFormat,
  targetBytes: number,
): Promise<Blob> {
  // First try with full resolution
  let scale = 1
  let lo = 0.1
  let hi = 1.0
  let best: Blob | null = null

  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2
    const canvas = drawToCanvas(img, scale)
    const blob = await canvasToBlob(canvas, format, mid)
    if (blob.size <= targetBytes) {
      best = blob
      lo = mid
    } else {
      hi = mid
    }
  }

  if (best && best.size <= targetBytes) return best

  // Quality bottomed out — try scaling down resolution
  for (scale = 0.9; scale >= 0.2; scale -= 0.1) {
    lo = 0.1; hi = 1.0
    for (let i = 0; i < 6; i++) {
      const mid = (lo + hi) / 2
      const canvas = drawToCanvas(img, scale)
      const blob = await canvasToBlob(canvas, format, mid)
      if (blob.size <= targetBytes) {
        best = blob
        lo = mid
      } else {
        hi = mid
      }
    }
    if (best && best.size <= targetBytes) return best
  }

  // Return best effort even if target not met
  const canvas = drawToCanvas(img, 0.2)
  return canvasToBlob(canvas, format, 0.5)
}

export async function convertImage(
  file: File,
  settings: ConversionSettings,
): Promise<Blob> {
  let sourceBlob: Blob = file

  // HEIC conversion
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')

  if (isHeic) {
    const heic2any = (await import('heic2any')).default
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
    sourceBlob = Array.isArray(converted) ? converted[0] : converted
  }

  const img = await loadImageFromBlob(sourceBlob)

  if (settings.targetSizeKB !== null) {
    return convertWithTargetSize(img, settings.outputFormat, settings.targetSizeKB * 1024)
  }

  const canvas = drawToCanvas(img)
  return canvasToBlob(canvas, settings.outputFormat, settings.quality)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function reductionPercent(before: number, after: number): number {
  return Math.round((1 - after / before) * 100)
}
