import { useState, useRef } from 'react'

interface Swatch {
  hex: string
  rgb: string
  percent: number
}

const SAMPLE_SIZE = 160 // 解析用に縮小するサイズ(px)
const BUCKET_STEP = 24 // 色を丸めるステップ
const MAX_SWATCHES = 8

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

function extractPalette(imageData: ImageData): Swatch[] {
  const { data } = imageData
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>()
  let totalCounted = 0

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 128) continue // 透明ピクセルは除外

    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const key = [
      Math.round(r / BUCKET_STEP),
      Math.round(g / BUCKET_STEP),
      Math.round(b / BUCKET_STEP),
    ].join(',')

    const bucket = buckets.get(key)
    if (bucket) {
      bucket.r += r
      bucket.g += g
      bucket.b += b
      bucket.count++
    } else {
      buckets.set(key, { r, g, b, count: 1 })
    }
    totalCounted++
  }

  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count)

  return sorted.slice(0, MAX_SWATCHES).map((bucket) => {
    const r = Math.round(bucket.r / bucket.count)
    const g = Math.round(bucket.g / bucket.count)
    const b = Math.round(bucket.b / bucket.count)
    return {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      percent: Math.round((bucket.count / totalCounted) * 100),
    }
  })
}

export function ColorPaletteTab() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [swatches, setSwatches] = useState<Swatch[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    setSwatches([])
    setIsAnalyzing(true)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    const img = new Image()
    img.onload = () => {
      try {
        const scale = Math.min(1, SAMPLE_SIZE / Math.max(img.naturalWidth, img.naturalHeight))
        const w = Math.max(1, Math.round(img.naturalWidth * scale))
        const h = Math.max(1, Math.round(img.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!
        ctx.drawImage(img, 0, 0, w, h)
        const imageData = ctx.getImageData(0, 0, w, h)
        setSwatches(extractPalette(imageData))
      } catch {
        setError('カラーパレットの抽出に失敗しました')
      } finally {
        setIsAnalyzing(false)
      }
    }
    img.onerror = () => {
      setError('画像の読み込みに失敗しました')
      setIsAnalyzing(false)
    }
    img.src = url
  }

  async function handleCopy(hex: string) {
    await navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1500)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">① 画像ファイルを選ぶ</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
        >
          <p className="text-gray-600 font-medium">クリックして画像を選択</p>
          <p className="text-xs text-gray-400 mt-1">よく使われている色を自動抽出します</p>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {previewUrl && (
        <img src={previewUrl} alt="" className="max-w-full max-h-56 mx-auto rounded-xl border border-gray-200" />
      )}

      {isAnalyzing && (
        <p className="text-center text-sm text-gray-400">解析中...</p>
      )}

      {swatches.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-2">② 抽出されたカラーパレット（クリックでコピー）</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {swatches.map((s) => (
              <button
                key={s.hex}
                onClick={() => handleCopy(s.hex)}
                className="rounded-xl overflow-hidden border border-gray-200 text-left hover:shadow-md transition-shadow"
              >
                <div className="h-16" style={{ backgroundColor: s.hex }} />
                <div className="p-2 bg-white">
                  <p className="text-xs font-mono font-semibold text-gray-700">
                    {copiedHex === s.hex ? 'コピーしました' : s.hex}
                  </p>
                  <p className="text-[10px] text-gray-400">{s.percent}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
