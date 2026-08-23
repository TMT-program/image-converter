import { useState, useRef } from 'react'
import { rotate90, cropToBlob, exportAsIs } from '../utils/cropRotate'
import { formatBytes } from '../utils/imageConverter'

interface Rect { x: number; y: number; w: number; h: number }

export function CropRotateTab() {
  const [workingUrl, setWorkingUrl] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  function resetSelectionAndResult() {
    setRect(null)
    setResult(null)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    resetSelectionAndResult()

    const isHeic =
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif')

    try {
      let blob: Blob = file
      if (isHeic) {
        const heic2any = (await import('heic2any')).default
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
        blob = Array.isArray(converted) ? converted[0] : converted
      }
      setWorkingUrl(URL.createObjectURL(blob))
    } catch {
      setError('画像の読み込みに失敗しました')
    }
  }

  async function handleRotate(clockwise: boolean) {
    if (!workingUrl || isBusy) return
    setIsBusy(true)
    setError(null)
    try {
      const { url } = await rotate90(workingUrl, clockwise)
      setWorkingUrl(url)
      resetSelectionAndResult()
    } catch (e) {
      setError(e instanceof Error ? e.message : '回転に失敗しました')
    } finally {
      setIsBusy(false)
    }
  }

  function relPos(e: React.PointerEvent): { x: number; y: number } {
    const box = containerRef.current!.getBoundingClientRect()
    return {
      x: Math.min(Math.max(e.clientX - box.left, 0), box.width),
      y: Math.min(Math.max(e.clientY - box.top, 0), box.height),
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!workingUrl) return
    ;(e.target as Element).setPointerCapture(e.pointerId)
    const p = relPos(e)
    dragStartRef.current = p
    setRect({ x: p.x, y: p.y, w: 0, h: 0 })
    setResult(null)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragStartRef.current) return
    const p = relPos(e)
    const s = dragStartRef.current
    setRect({
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
    })
  }

  function onPointerUp() {
    dragStartRef.current = null
  }

  async function handleApply() {
    if (!workingUrl) return
    setIsBusy(true)
    setError(null)
    try {
      let blob: Blob
      if (!rect || rect.w < 4 || rect.h < 4 || !naturalSize) {
        blob = await exportAsIs(workingUrl)
      } else {
        const box = containerRef.current!.getBoundingClientRect()
        const scaleX = naturalSize.w / box.width
        const scaleY = naturalSize.h / box.height
        blob = await cropToBlob(workingUrl, {
          x: rect.x * scaleX,
          y: rect.y * scaleY,
          w: rect.w * scaleX,
          h: rect.h * scaleY,
        })
      }
      setResult({ url: URL.createObjectURL(blob), blob })
    } catch (e) {
      setError(e instanceof Error ? e.message : '処理に失敗しました')
    } finally {
      setIsBusy(false)
    }
  }

  function handleDownload() {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = 'cropped.png'
    a.click()
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
          <p className="text-xs text-gray-400 mt-1">JPEG / PNG / WebP / HEIC</p>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {workingUrl && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">
              ② 回転・切り抜き範囲をドラッグで選択
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleRotate(false)}
                disabled={isBusy}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:border-blue-400 disabled:opacity-40"
                aria-label="左に90度回転"
              >
                ⟲ 左
              </button>
              <button
                onClick={() => handleRotate(true)}
                disabled={isBusy}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:border-blue-400 disabled:opacity-40"
                aria-label="右に90度回転"
              >
                ⟳ 右
              </button>
              {rect && (
                <button
                  onClick={() => setRect(null)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-500 hover:border-red-400 hover:text-red-500"
                >
                  選択解除
                </button>
              )}
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative select-none touch-none rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mx-auto"
            style={{ maxWidth: 480 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <img
              src={workingUrl}
              alt=""
              draggable={false}
              className="w-full block pointer-events-none"
              onLoad={(e) => setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            />
            {rect && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/20"
                style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
              />
            )}
          </div>
          <p className="text-xs text-gray-400 text-center">
            範囲を選択しない場合は、回転後の画像全体を書き出します
          </p>

          <button
            onClick={handleApply}
            disabled={isBusy}
            className={[
              'w-full py-3 rounded-xl font-bold text-white transition-colors shadow',
              isBusy ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            {isBusy ? '処理中...' : '適用する'}
          </button>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-green-700">完了 — {formatBytes(result.blob.size)}</p>
          <img src={result.url} alt="" className="max-w-full max-h-64 mx-auto rounded-lg border border-gray-200" />
          <button
            onClick={handleDownload}
            className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
          >
            画像をダウンロード
          </button>
        </div>
      )}
    </div>
  )
}
