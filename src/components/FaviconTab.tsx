import { useState, useRef } from 'react'
import JSZip from 'jszip'
import { buildIco } from '../utils/icoBuilder'

const ICO_SIZES = [16, 32, 48]
const PNG_SIZES = [16, 32, 180, 192, 512]

interface GeneratedSet {
  pngs: { size: number; blob: Blob; url: string }[]
  icoBlob: Blob
}

// 中央を正方形にトリミングしてから指定サイズにリサイズする
function renderSquare(img: HTMLImageElement, size: number): Promise<Blob> {
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - side) / 2
  const sy = (img.naturalHeight - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('生成に失敗しました')), 'image/png')
  })
}

export function FaviconTab() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [result, setResult] = useState<GeneratedSet | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    setResult(null)
    setIsGenerating(true)

    const url = URL.createObjectURL(file)
    setSourceUrl(url)

    const img = new Image()
    img.onload = async () => {
      try {
        const pngs = await Promise.all(
          PNG_SIZES.map(async (size) => {
            const blob = await renderSquare(img, size)
            return { size, blob, url: URL.createObjectURL(blob) }
          })
        )
        const icoSources = await Promise.all(
          ICO_SIZES.map(async (size) => ({ size, blob: await renderSquare(img, size) }))
        )
        const icoBlob = await buildIco(icoSources)
        setResult({ pngs, icoBlob })
      } catch {
        setError('Faviconの生成に失敗しました')
      } finally {
        setIsGenerating(false)
      }
    }
    img.onerror = () => {
      setError('画像の読み込みに失敗しました')
      setIsGenerating(false)
    }
    img.src = url
  }

  async function handleDownloadZip() {
    if (!result) return
    const zip = new JSZip()
    zip.file('favicon.ico', result.icoBlob)
    for (const p of result.pngs) {
      const name =
        p.size === 180 ? 'apple-touch-icon.png' :
        p.size === 192 ? 'icon-192.png' :
        p.size === 512 ? 'icon-512.png' :
        `favicon-${p.size}x${p.size}.png`
      zip.file(name, p.blob)
    }
    zip.file(
      'README.txt',
      [
        'faviconファイル一式です。',
        '',
        'favicon.ico をサイトのルートディレクトリに配置し、<head>内に以下を追加してください:',
        '',
        '<link rel="icon" href="/favicon.ico" sizes="any">',
        '<link rel="icon" type="image/png" href="/icon-192.png" sizes="192x192">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
      ].join('\n')
    )
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'favicon-set.zip'
    a.click()
    URL.revokeObjectURL(url)
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
          <p className="text-xs text-gray-400 mt-1">正方形でなければ中央を自動でトリミングします</p>
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

      {sourceUrl && (
        <img src={sourceUrl} alt="" className="max-w-full max-h-48 mx-auto rounded-xl border border-gray-200" />
      )}

      {isGenerating && (
        <p className="text-center text-sm text-gray-400">生成中...</p>
      )}

      {result && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-600">② プレビュー</p>
          <div className="flex flex-wrap items-end gap-4 justify-center bg-gray-50 rounded-xl p-4">
            {result.pngs.filter((p) => p.size <= 192).map((p) => (
              <div key={p.size} className="text-center">
                <img
                  src={p.url}
                  alt=""
                  style={{ width: Math.min(p.size, 64), height: Math.min(p.size, 64) }}
                  className="mx-auto border border-gray-200 rounded bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">{p.size}×{p.size}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleDownloadZip}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow"
          >
            favicon一式をダウンロード (ZIP)
          </button>
        </div>
      )}
    </div>
  )
}
