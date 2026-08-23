import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'

const SIZE_OPTIONS = [
  { label: '小 (256px)', value: 256 },
  { label: '中 (512px)', value: 512 },
  { label: '大 (1024px)', value: 1024 },
]

export function QrTab() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(512)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!text.trim()) {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      setError(null)
      return
    }

    QRCode.toCanvas(canvasRef.current!, text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(() => setError(null))
      .catch(() => setError('QRコードの生成に失敗しました。テキストが長すぎる可能性があります。'))
  }, [text, size])

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qrcode.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const hasContent = text.trim().length > 0 && !error

  return (
    <div className="space-y-5">

      {/* 入力 */}
      <div>
        <label className="text-sm font-semibold text-gray-600 mb-2 block">
          URLまたはテキストを入力
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{text.length} 文字</p>
      </div>

      {/* サイズ */}
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">ダウンロードサイズ</p>
        <div className="flex gap-2">
          {SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSize(opt.value)}
              className={[
                'px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                size === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* プレビュー */}
      <div className="flex flex-col items-center gap-4">
        <div className={[
          'border border-gray-200 rounded-xl overflow-hidden bg-white',
          !text.trim() ? 'opacity-30' : '',
        ].join(' ')}>
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: 240, height: 240 }}
          />
        </div>
        {!text.trim() && (
          <p className="text-sm text-gray-400">テキストを入力するとQRコードが表示されます</p>
        )}
      </div>

      {/* ダウンロード */}
      <button
        onClick={handleDownload}
        disabled={!hasContent}
        className={[
          'w-full py-3 rounded-xl font-bold text-white transition-colors shadow',
          hasContent
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-300 cursor-not-allowed',
        ].join(' ')}
      >
        PNG でダウンロード
      </button>

      <p className="text-xs text-gray-400 text-center">
        生成されたQRコードはすべてブラウザ内で処理され、外部に送信されません
      </p>
    </div>
  )
}
