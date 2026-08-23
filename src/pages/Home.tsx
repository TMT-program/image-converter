import { useState, useCallback, lazy, Suspense } from 'react'
import { DropZone } from '../components/DropZone'
import { PresetButtons } from '../components/PresetButtons'
import { ConversionSettingsPanel } from '../components/ConversionSettings'
import { FileCard } from '../components/FileCard'
import { AdPlaceholder } from '../components/AdPlaceholder'
import { convertImage, buildOutputFilename } from '../utils/imageConverter'
import { downloadAsZip } from '../utils/zipDownloader'
import { PRESETS, MAX_FILES } from '../constants/presets'
import type { ConversionSettings, ConvertedFile } from '../types'

const PdfTab = lazy(() => import('../components/PdfTab').then((m) => ({ default: m.PdfTab })))
const QrTab = lazy(() => import('../components/QrTab').then((m) => ({ default: m.QrTab })))

function TabLoading() {
  return <p className="text-center text-sm text-gray-400 py-8">読み込み中...</p>
}

type AppTab = 'image' | 'pdf' | 'qr'

const DEFAULT_SETTINGS: ConversionSettings = {
  outputFormat: 'image/jpeg',
  quality: 0.85,
  targetSizePreset: null,
  targetSizeKB: null,
  resizeMode: 'none',
  resizeValue: null,
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

export function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('image')
  const [files, setFiles] = useState<ConvertedFile[]>([])
  const [settings, setSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS)
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })

  const handleFiles = useCallback((newFiles: File[]) => {
    const remaining = MAX_FILES - files.length
    const toAdd = newFiles.slice(0, remaining)
    const entries: ConvertedFile[] = toAdd.map((f) => ({
      id: generateId(),
      originalFile: f,
      originalSizeBytes: f.size,
      convertedBlob: null,
      convertedSizeBytes: null,
      outputFilename: buildOutputFilename(f.name, settings.outputFormat),
      status: 'pending',
      errorMessage: null,
      previewUrl: URL.createObjectURL(f),
    }))
    setFiles((prev) => [...prev, ...entries])
  }, [files.length, settings.outputFormat])

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id)
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl)
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  const handlePreset = useCallback((s: ConversionSettings) => {
    setSettings(s)
    const preset = PRESETS.find(
      (p) => p.settings.outputFormat === s.outputFormat && p.settings.targetSizeKB === s.targetSizeKB
    )
    setActivePresetId(preset?.id ?? null)
  }, [])

  const handleSettingsChange = useCallback((s: ConversionSettings) => {
    setSettings(s)
    setActivePresetId(null)
  }, [])

  async function handleConvert() {
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error')
    if (!pending.length) return

    setIsConverting(true)
    setProgress({ done: 0, total: pending.length })

    for (let i = 0; i < pending.length; i++) {
      const entry = pending[i]
      setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'converting' } : f))

      try {
        const blob = await convertImage(entry.originalFile, settings)
        const outputFilename = buildOutputFilename(entry.originalFile.name, settings.outputFormat)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: 'done', convertedBlob: blob, convertedSizeBytes: blob.size, outputFilename }
              : f
          )
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : '変換に失敗しました'
        setFiles((prev) => prev.map((f) => f.id === entry.id ? { ...f, status: 'error', errorMessage: msg } : f))
      }

      setProgress({ done: i + 1, total: pending.length })
    }

    setIsConverting(false)
  }

  const doneFiles = files.filter((f) => f.status === 'done')
  const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* タブ切り替え */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {([
          { value: 'image', label: '🖼️ 画像変換' },
          { value: 'pdf', label: '📄 PDF変換' },
          { value: 'qr', label: '📷 QRコード' },
        ] as { value: AppTab; label: string }[]).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
              activeTab === tab.value
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* プライバシー訴求（スマホ） */}
      <div className="sm:hidden flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
        <span className="text-green-600 text-lg">🔒</span>
        <p className="text-sm text-green-700">
          ファイルはお使いの端末内で処理され、外部に送信されることはありません
        </p>
      </div>

      {activeTab === 'image' && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <span className="text-blue-600 text-lg">🛡️</span>
          <p className="text-sm text-blue-700">
            変換後の画像から位置情報などのExif（撮影情報）は自動的に削除されます
          </p>
        </div>
      )}

      {/* 画像変換タブ */}
      {activeTab === 'image' && (
        <>
          <section>
            <h2 className="text-base font-bold text-gray-700 mb-3">① ファイルを選ぶ</h2>
            <DropZone onFiles={handleFiles} disabled={isConverting} />
            {files.length >= MAX_FILES && (
              <p className="text-xs text-amber-600 mt-2">最大{MAX_FILES}枚まで選択できます</p>
            )}
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-700 mb-3">② 設定を選ぶ</h2>
            <div className="space-y-3">
              <PresetButtons onSelect={handlePreset} activePresetId={activePresetId} />
              <ConversionSettingsPanel settings={settings} onChange={handleSettingsChange} />
            </div>
          </section>

          {files.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleConvert}
                disabled={isConverting || pendingFiles.length === 0}
                className={[
                  'px-8 py-3 rounded-xl font-bold text-white transition-colors text-base shadow',
                  isConverting || pendingFiles.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
                ].join(' ')}
              >
                {isConverting
                  ? `変換中... (${progress.done}/${progress.total})`
                  : `${pendingFiles.length}枚を変換する`}
              </button>
            </div>
          )}

          {files.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-gray-700 mb-3">③ ダウンロード</h2>
              <div className="space-y-2">
                {files.map((f) => (
                  <FileCard key={f.id} file={f} onRemove={handleRemove} />
                ))}
              </div>
              {doneFiles.length > 1 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => downloadAsZip(doneFiles)}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow"
                  >
                    まとめてダウンロード (ZIP) — {doneFiles.length}枚
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {activeTab === 'pdf' && (
        <Suspense fallback={<TabLoading />}>
          <PdfTab />
        </Suspense>
      )}
      {activeTab === 'qr' && (
        <Suspense fallback={<TabLoading />}>
          <QrTab />
        </Suspense>
      )}

      <AdPlaceholder />
    </div>
  )
}
