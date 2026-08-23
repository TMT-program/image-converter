import { PDFDocument } from 'pdf-lib'
import type { OutputFormat } from '../types'

// 画像ファイル群を1つのPDFにまとめる
export async function imagesToPdf(files: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const mimeType = file.type || guessMime(file.name)

    let embeddedImage
    if (mimeType === 'image/jpeg') {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer)
    } else if (mimeType === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer)
    } else {
      // WebP・HEICは一旦Canvasで JPEG に変換してから embed
      const blob = await convertToJpegBlob(file)
      const buf = await blob.arrayBuffer()
      embeddedImage = await pdfDoc.embedJpg(buf)
    }

    const { width, height } = embeddedImage
    const page = pdfDoc.addPage([width, height])
    page.drawImage(embeddedImage, { x: 0, y: 0, width, height })
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
}

function guessMime(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

async function convertToJpegBlob(file: File): Promise<Blob> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')

  let sourceBlob: Blob = file
  if (isHeic) {
    const heic2any = (await import('heic2any')).default
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
    sourceBlob = Array.isArray(converted) ? converted[0] : converted
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(sourceBlob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('変換失敗')), 'image/jpeg', 0.92)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('読み込み失敗')) }
    img.src = url
  })
}

// PDFの各ページを画像に変換する
export async function pdfToImages(
  file: File,
  format: OutputFormat,
  quality: number,
  onProgress?: (done: number, total: number) => void,
): Promise<{ blob: Blob; filename: string }[]> {
  const pdfjsLib = await import('pdfjs-dist')
  // workerをCDNから読み込む（バンドルサイズ対策）
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const total = pdf.numPages
  const results: { blob: Blob; filename: string }[] = []
  const base = file.name.replace(/\.pdf$/i, '')
  const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp'

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 }) // 2x = 高解像度

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!

    await page.render({ canvasContext: ctx, canvas, viewport }).promise

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('ページ変換失敗')),
        format,
        format === 'image/png' ? undefined : quality,
      )
    })

    const filename = total === 1 ? `${base}.${ext}` : `${base}_p${String(i).padStart(2, '0')}.${ext}`
    results.push({ blob, filename })
    onProgress?.(i, total)
  }

  return results
}

// PDFの各ページをラスタライズして再構築することでファイルサイズを圧縮する
export async function compressPdf(
  file: File,
  quality: number,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const total = pdf.numPages

  const outDoc = await PDFDocument.create()

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, canvas, viewport }).promise

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('圧縮に失敗しました')), 'image/jpeg', quality)
    })
    const buf = await blob.arrayBuffer()
    const embedded = await outDoc.embedJpg(buf)
    const outPage = outDoc.addPage([viewport.width, viewport.height])
    outPage.drawImage(embedded, { x: 0, y: 0, width: viewport.width, height: viewport.height })

    onProgress?.(i, total)
  }

  const pdfBytes = await outDoc.save()
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
}

// 複数のPDFを1つに結合する
export async function mergePdfs(files: File[]): Promise<Blob> {
  const outDoc = await PDFDocument.create()

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const srcDoc = await PDFDocument.load(arrayBuffer)
    const pages = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices())
    pages.forEach((p) => outDoc.addPage(p))
  }

  const pdfBytes = await outDoc.save()
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
}

// PDFをページごとに分割し、1ページ1PDFのリストを返す
export async function splitPdf(file: File): Promise<{ blob: Blob; filename: string }[]> {
  const arrayBuffer = await file.arrayBuffer()
  const srcDoc = await PDFDocument.load(arrayBuffer)
  const total = srcDoc.getPageCount()
  const base = file.name.replace(/\.pdf$/i, '')
  const results: { blob: Blob; filename: string }[] = []

  for (let i = 0; i < total; i++) {
    const outDoc = await PDFDocument.create()
    const [page] = await outDoc.copyPages(srcDoc, [i])
    outDoc.addPage(page)
    const pdfBytes = await outDoc.save()
    results.push({
      blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
      filename: `${base}_p${String(i + 1).padStart(2, '0')}.pdf`,
    })
  }

  return results
}

export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
