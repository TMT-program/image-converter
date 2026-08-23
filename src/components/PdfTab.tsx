import { useState, useRef } from 'react'
import { imagesToPdf, pdfToImages, downloadPdf } from '../utils/pdfConverter'
import { downloadAsZip } from '../utils/zipDownloader'
import { formatBytes } from '../utils/imageConverter'
import type { OutputFormat } from '../types'

type PdfMode = 'imageToPdf' | 'pdfToImage'

const ACCEPTED_IMAGE_EXTS = '.jpg,.jpeg,.png,.webp,.heic,.heif'
const MAX_IMAGES = 20

export function PdfTab() {
  const [mode, setMode] = useState<PdfMode>('imageToPdf')

  // 画像→PDF
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [isConvertingToPdf, setIsConvertingToPdf] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // PDF→画像
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg')
  const [convertedImages, setConvertedImages] = useState<{ blob: Blob; filename: string }[]>([])
  const [isConvertingToImage, setIsConvertingToImage] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)

  // --- 画像→PDF ---
  function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES)
    setImageFiles(files)
    setPdfBlob(null)
    setError(null)
    e.target.value = ''
  }

  async function handleConvertToPdf() {
    if (!imageFiles.length) return
    setIsConvertingToPdf(true)
    setError(null)
    try {
      const blob = await imagesToPdf(imageFiles)
      setPdfBlob(blob)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF変換に失敗しました')
    } finally {
      setIsConvertingToPdf(false)
    }
  }

  function handleDownloadPdf() {
    if (!pdfBlob) return
    const name = imageFiles.length === 1
      ? imageFiles[0].name.replace(/\.[^.]+$/, '') + '.pdf'
      : '変換済み.pdf'
    downloadPdf(pdfBlob, name)
  }

  // --- PDF→画像 ---
  function handlePdfFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return
    setPdfFile(e.target.files[0])
    setConvertedImages([])
    setError(null)
    e.target.value = ''
  }

  async function handleConvertToImage() {
    if (!pdfFile) return
    setIsConvertingToImage(true)
    setError(null)
    setConvertedImages([])
    try {
      const results = await pdfToImages(pdfFile, outputFormat, 0.92, (done, total) => {
        setProgress({ done, total })
      })
      setConvertedImages(results)
    } catch (e) {
      setError(e instanceof Error ? e.message : '画像変換に失敗しました')
    } finally {
      setIsConvertingToImage(false)
    }
  }

  async function handleDownloadImages() {
    if (convertedImages.length === 1) {
      downloadPdf(convertedImages[0].blob, convertedImages[0].filename)
    } else {
      await downloadAsZip(
        convertedImages.map((img, i) => ({
          id: String(i),
          originalFile: new File([], img.filename),
          originalSizeBytes: 0,
          convertedBlob: img.blob,
          convertedSizeBytes: img.blob.size,
          outputFilename: img.filename,
          status: 'done' as const,
          errorMessage: null,
          previewUrl: null,
        }))
      )
    }
  }

  const formats: { value: OutputFormat; label: string }[] = [
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/webp', label: 'WebP' },
  ]

  return (
    <div className="space-y-5">
      {/* モード切り替え */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {([
          { value: 'imageToPdf', label: '画像 → PDF' },
          { value: 'pdfToImage', label: 'PDF → 画像' },
        ] as { value: PdfMode; label: string }[]).map((m) => (
          <button
            key={m.value}
            onClick={() => { setMode(m.value); setError(null) }}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
              mode === m.value
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {m.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 画像→PDF */}
      {mode === 'imageToPdf' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              ① 画像ファイルを選ぶ（最大{MAX_IMAGES}枚・順番通りにまとめます）
            </p>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <p className="text-gray-600 font-medium">クリックして画像を選択</p>
              <p className="text-xs text-gray-400 mt-1">JPEG / PNG / WebP / HEIC</p>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_EXTS}
              multiple
              className="hidden"
              onChange={handleImageFiles}
            />
          </div>

          {imageFiles.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              {imageFiles.map((f, i) => (
                <p key={i} className="text-sm text-gray-600 truncate">
                  {i + 1}. {f.name}
                  <span className="text-gray-400 ml-2">({formatBytes(f.size)})</span>
                </p>
              ))}
            </div>
          )}

          <button
            onClick={handleConvertToPdf}
            disabled={!imageFiles.length || isConvertingToPdf}
            className={[
              'w-full py-3 rounded-xl font-bold text-white transition-colors shadow',
              !imageFiles.length || isConvertingToPdf
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            {isConvertingToPdf ? 'PDF作成中...' : 'PDFに変換する'}
          </button>

          {pdfBlob && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700">変換完了</p>
                <p className="text-xs text-gray-500">サイズ: {formatBytes(pdfBlob.size)}</p>
              </div>
              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
              >
                PDFをダウンロード
              </button>
            </div>
          )}
        </div>
      )}

      {/* PDF→画像 */}
      {mode === 'pdfToImage' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">① PDFファイルを選ぶ</p>
            <button
              onClick={() => pdfInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <p className="text-gray-600 font-medium">クリックしてPDFを選択</p>
              <p className="text-xs text-gray-400 mt-1">.pdf のみ</p>
            </button>
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handlePdfFile}
            />
          </div>

          {pdfFile && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              {pdfFile.name}
              <span className="text-gray-400 ml-2">({formatBytes(pdfFile.size)})</span>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">② 出力形式</p>
            <div className="flex gap-2">
              {formats.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setOutputFormat(f.value)}
                  className={[
                    'px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                    outputFormat === f.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConvertToImage}
            disabled={!pdfFile || isConvertingToImage}
            className={[
              'w-full py-3 rounded-xl font-bold text-white transition-colors shadow',
              !pdfFile || isConvertingToImage
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            {isConvertingToImage
              ? `変換中... (${progress.done}/${progress.total}ページ)`
              : '画像に変換する'}
          </button>

          {convertedImages.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-green-700">
                変換完了 — {convertedImages.length}ページ
              </p>
              <div className="space-y-1">
                {convertedImages.map((img, i) => (
                  <p key={i} className="text-xs text-gray-600">
                    {img.filename}
                    <span className="text-gray-400 ml-2">({formatBytes(img.blob.size)})</span>
                  </p>
                ))}
              </div>
              <button
                onClick={handleDownloadImages}
                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
              >
                {convertedImages.length === 1
                  ? '画像をダウンロード'
                  : `まとめてダウンロード (ZIP) — ${convertedImages.length}枚`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
