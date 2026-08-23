import { useState, useRef } from 'react'
import { imagesToPdf, pdfToImages, downloadPdf, compressPdf, mergePdfs, splitPdf } from '../utils/pdfConverter'
import { downloadAsZip } from '../utils/zipDownloader'
import { formatBytes, reductionPercent } from '../utils/imageConverter'
import type { OutputFormat } from '../types'

type PdfMode = 'imageToPdf' | 'pdfToImage' | 'compress' | 'merge' | 'split'

const ACCEPTED_IMAGE_EXTS = '.jpg,.jpeg,.png,.webp,.heic,.heif'
const MAX_IMAGES = 20

const MODES: { value: PdfMode; label: string }[] = [
  { value: 'imageToPdf', label: '画像 → PDF' },
  { value: 'pdfToImage', label: 'PDF → 画像' },
  { value: 'compress', label: 'PDF圧縮' },
  { value: 'merge', label: 'PDF結合' },
  { value: 'split', label: 'PDF分割' },
]

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

  // PDF圧縮
  const [compressFile, setCompressFile] = useState<File | null>(null)
  const [compressQuality, setCompressQuality] = useState(0.6)
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressProgress, setCompressProgress] = useState({ done: 0, total: 0 })
  const compressInputRef = useRef<HTMLInputElement>(null)

  // PDF結合
  const [mergeFiles, setMergeFiles] = useState<File[]>([])
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null)
  const [isMerging, setIsMerging] = useState(false)
  const mergeInputRef = useRef<HTMLInputElement>(null)

  // PDF分割
  const [splitFile, setSplitFile] = useState<File | null>(null)
  const [splitResults, setSplitResults] = useState<{ blob: Blob; filename: string }[]>([])
  const [isSplitting, setIsSplitting] = useState(false)
  const splitInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)

  function switchMode(m: PdfMode) {
    setMode(m)
    setError(null)
  }

  // --- 画像→PDF ---
  function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES)
    setImageFiles((prev) => [...prev, ...files].slice(0, MAX_IMAGES))
    setPdfBlob(null)
    setError(null)
    e.target.value = ''
  }

  function moveImage(i: number, dir: -1 | 1) {
    setImageFiles((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
    setPdfBlob(null)
  }

  function removeImage(i: number) {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i))
    setPdfBlob(null)
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

  // --- PDF圧縮 ---
  function handleCompressFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return
    setCompressFile(e.target.files[0])
    setCompressedBlob(null)
    setError(null)
    e.target.value = ''
  }

  async function handleCompress() {
    if (!compressFile) return
    setIsCompressing(true)
    setError(null)
    setCompressedBlob(null)
    try {
      const blob = await compressPdf(compressFile, compressQuality, (done, total) => {
        setCompressProgress({ done, total })
      })
      setCompressedBlob(blob)
    } catch (e) {
      setError(e instanceof Error ? e.message : '圧縮に失敗しました')
    } finally {
      setIsCompressing(false)
    }
  }

  function handleDownloadCompressed() {
    if (!compressedBlob || !compressFile) return
    const name = compressFile.name.replace(/\.pdf$/i, '') + '_圧縮.pdf'
    downloadPdf(compressedBlob, name)
  }

  // --- PDF結合 ---
  function handleMergeFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    setMergeFiles((prev) => [...prev, ...files])
    setMergedBlob(null)
    setError(null)
    e.target.value = ''
  }

  function moveMergeFile(i: number, dir: -1 | 1) {
    setMergeFiles((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
    setMergedBlob(null)
  }

  function removeMergeFile(i: number) {
    setMergeFiles((prev) => prev.filter((_, idx) => idx !== i))
    setMergedBlob(null)
  }

  async function handleMerge() {
    if (mergeFiles.length < 2) return
    setIsMerging(true)
    setError(null)
    try {
      const blob = await mergePdfs(mergeFiles)
      setMergedBlob(blob)
    } catch (e) {
      setError(e instanceof Error ? e.message : '結合に失敗しました')
    } finally {
      setIsMerging(false)
    }
  }

  function handleDownloadMerged() {
    if (!mergedBlob) return
    downloadPdf(mergedBlob, '結合済み.pdf')
  }

  // --- PDF分割 ---
  function handleSplitFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return
    setSplitFile(e.target.files[0])
    setSplitResults([])
    setError(null)
    e.target.value = ''
  }

  async function handleSplit() {
    if (!splitFile) return
    setIsSplitting(true)
    setError(null)
    setSplitResults([])
    try {
      const results = await splitPdf(splitFile)
      setSplitResults(results)
    } catch (e) {
      setError(e instanceof Error ? e.message : '分割に失敗しました')
    } finally {
      setIsSplitting(false)
    }
  }

  async function handleDownloadSplit() {
    await downloadAsZip(
      splitResults.map((r, i) => ({
        id: String(i),
        originalFile: new File([], r.filename),
        originalSizeBytes: 0,
        convertedBlob: r.blob,
        convertedSizeBytes: r.blob.size,
        outputFilename: r.filename,
        status: 'done' as const,
        errorMessage: null,
        previewUrl: null,
      }))
    )
  }

  const formats: { value: OutputFormat; label: string }[] = [
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/webp', label: 'WebP' },
  ]

  const compressQualityLabel =
    compressQuality >= 0.75 ? '高品質・低圧縮' :
    compressQuality >= 0.5 ? '標準' : '低品質・高圧縮'

  return (
    <div className="space-y-5">
      {/* モード切り替え */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => switchMode(m.value)}
            className={[
              'flex-1 min-w-[30%] py-2 rounded-lg text-sm font-semibold transition-colors',
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
              ① 画像ファイルを選ぶ（最大{MAX_IMAGES}枚・矢印で順番を変更できます）
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
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-5 text-gray-400 text-xs">{i + 1}.</span>
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-gray-400 text-xs shrink-0">({formatBytes(f.size)})</span>
                  <button
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-gray-400 px-1"
                    aria-label="上に移動"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveImage(i, 1)}
                    disabled={i === imageFiles.length - 1}
                    className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-gray-400 px-1"
                    aria-label="下に移動"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeImage(i)}
                    className="text-gray-400 hover:text-red-600 px-1"
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </div>
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

      {/* PDF圧縮 */}
      {mode === 'compress' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">① PDFファイルを選ぶ</p>
            <button
              onClick={() => compressInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <p className="text-gray-600 font-medium">クリックしてPDFを選択</p>
              <p className="text-xs text-gray-400 mt-1">.pdf のみ・ページを画像化して再構築します</p>
            </button>
            <input
              ref={compressInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleCompressFile}
            />
          </div>

          {compressFile && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              {compressFile.name}
              <span className="text-gray-400 ml-2">({formatBytes(compressFile.size)})</span>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">② 圧縮レベル</p>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>高圧縮</span>
              <span className="font-medium text-gray-700">{compressQualityLabel}</span>
              <span>高品質</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              value={Math.round(compressQuality * 100)}
              onChange={(e) => setCompressQuality(Number(e.target.value) / 100)}
              className="w-full accent-blue-600"
            />
          </div>

          <button
            onClick={handleCompress}
            disabled={!compressFile || isCompressing}
            className={[
              'w-full py-3 rounded-xl font-bold text-white transition-colors shadow',
              !compressFile || isCompressing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            {isCompressing
              ? `圧縮中... (${compressProgress.done}/${compressProgress.total}ページ)`
              : 'PDFを圧縮する'}
          </button>

          {compressedBlob && compressFile && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-green-700">
                圧縮完了 — {reductionPercent(compressFile.size, compressedBlob.size)}%削減
              </p>
              <p className="text-xs text-gray-500">
                {formatBytes(compressFile.size)} → {formatBytes(compressedBlob.size)}
              </p>
              <button
                onClick={handleDownloadCompressed}
                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
              >
                圧縮済みPDFをダウンロード
              </button>
            </div>
          )}
        </div>
      )}

      {/* PDF結合 */}
      {mode === 'merge' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              ① 結合するPDFを選ぶ（2つ以上・矢印で順番を変更できます）
            </p>
            <button
              onClick={() => mergeInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <p className="text-gray-600 font-medium">クリックしてPDFを選択（複数可）</p>
              <p className="text-xs text-gray-400 mt-1">.pdf のみ</p>
            </button>
            <input
              ref={mergeInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleMergeFiles}
            />
          </div>

          {mergeFiles.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              {mergeFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-5 text-gray-400 text-xs">{i + 1}.</span>
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-gray-400 text-xs shrink-0">({formatBytes(f.size)})</span>
                  <button
                    onClick={() => moveMergeFile(i, -1)}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-gray-400 px-1"
                    aria-label="上に移動"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveMergeFile(i, 1)}
                    disabled={i === mergeFiles.length - 1}
                    className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:hover:text-gray-400 px-1"
                    aria-label="下に移動"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeMergeFile(i)}
                    className="text-gray-400 hover:text-red-600 px-1"
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleMerge}
            disabled={mergeFiles.length < 2 || isMerging}
            className={[
              'w-full py-3 rounded-xl font-bold text-white transition-colors shadow',
              mergeFiles.length < 2 || isMerging
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            {isMerging ? '結合中...' : `${mergeFiles.length}件のPDFを結合する`}
          </button>

          {mergedBlob && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700">結合完了</p>
                <p className="text-xs text-gray-500">サイズ: {formatBytes(mergedBlob.size)}</p>
              </div>
              <button
                onClick={handleDownloadMerged}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
              >
                PDFをダウンロード
              </button>
            </div>
          )}
        </div>
      )}

      {/* PDF分割 */}
      {mode === 'split' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">① 分割するPDFを選ぶ</p>
            <button
              onClick={() => splitInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <p className="text-gray-600 font-medium">クリックしてPDFを選択</p>
              <p className="text-xs text-gray-400 mt-1">1ページごとにPDFを分けてZIPでまとめます</p>
            </button>
            <input
              ref={splitInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleSplitFile}
            />
          </div>

          {splitFile && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              {splitFile.name}
              <span className="text-gray-400 ml-2">({formatBytes(splitFile.size)})</span>
            </div>
          )}

          <button
            onClick={handleSplit}
            disabled={!splitFile || isSplitting}
            className={[
              'w-full py-3 rounded-xl font-bold text-white transition-colors shadow',
              !splitFile || isSplitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            {isSplitting ? '分割中...' : 'PDFを分割する'}
          </button>

          {splitResults.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-green-700">
                分割完了 — {splitResults.length}ページ
              </p>
              <button
                onClick={handleDownloadSplit}
                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
              >
                まとめてダウンロード (ZIP) — {splitResults.length}件
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
