import { useState, useRef } from 'react'
import { formatBytes } from '../utils/imageConverter'

type Mode = 'encode' | 'decode'

export function Base64Tab() {
  const [mode, setMode] = useState<Mode>('encode')
  const [error, setError] = useState<string | null>(null)

  // エンコード
  const [encodedResult, setEncodedResult] = useState<string | null>(null)
  const [encodedFileInfo, setEncodedFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const encodeInputRef = useRef<HTMLInputElement>(null)

  // デコード
  const [decodeInput, setDecodeInput] = useState('')
  const [decodedPreview, setDecodedPreview] = useState<{ url: string; blob: Blob } | null>(null)

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
  }

  function handleEncodeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setEncodedResult(null)
    const reader = new FileReader()
    reader.onload = () => {
      setEncodedResult(reader.result as string)
      setEncodedFileInfo({ name: file.name, size: file.size })
    }
    reader.onerror = () => setError('ファイルの読み込みに失敗しました')
    reader.readAsDataURL(file)
  }

  async function handleCopy() {
    if (!encodedResult) return
    await navigator.clipboard.writeText(encodedResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadText() {
    if (!encodedResult) return
    const blob = new Blob([encodedResult], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${encodedFileInfo?.name ?? 'image'}.base64.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDecode() {
    setError(null)
    setDecodedPreview(null)
    const raw = decodeInput.trim()
    if (!raw) return

    try {
      let mimeType = 'image/png'
      let base64 = raw

      const dataUrlMatch = raw.match(/^data:([^;]+);base64,(.*)$/s)
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1]
        base64 = dataUrlMatch[2]
      }

      const binary = atob(base64.replace(/\s/g, ''))
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: mimeType })
      const url = URL.createObjectURL(blob)
      setDecodedPreview({ url, blob })
    } catch {
      setError('デコードに失敗しました。正しいBase64文字列か確認してください。')
    }
  }

  function handleDownloadDecoded() {
    if (!decodedPreview) return
    const ext = decodedPreview.blob.type.split('/')[1]?.split('+')[0] || 'png'
    const a = document.createElement('a')
    a.href = decodedPreview.url
    a.download = `decoded.${ext}`
    a.click()
  }

  return (
    <div className="space-y-5">
      {/* モード切り替え */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {([
          { value: 'encode', label: '画像 → Base64' },
          { value: 'decode', label: 'Base64 → 画像' },
        ] as { value: Mode; label: string }[]).map((m) => (
          <button
            key={m.value}
            onClick={() => switchMode(m.value)}
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

      {/* エンコード */}
      {mode === 'encode' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">① 画像ファイルを選ぶ</p>
            <button
              onClick={() => encodeInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <p className="text-gray-600 font-medium">クリックして画像を選択</p>
            </button>
            <input
              ref={encodeInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleEncodeFile}
            />
          </div>

          {encodedResult && encodedFileInfo && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                {encodedFileInfo.name}（元: {formatBytes(encodedFileInfo.size)} → Base64: {formatBytes(encodedResult.length)}）
              </p>
              <textarea
                readOnly
                value={encodedResult}
                rows={8}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono resize-none bg-gray-50"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  {copied ? 'コピーしました' : 'コピー'}
                </button>
                <button
                  onClick={handleDownloadText}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  テキストで保存
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* デコード */}
      {mode === 'decode' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              ① Base64文字列を貼り付け（data:image/...;base64, で始まっても可）
            </p>
            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              rows={8}
              placeholder="data:image/png;base64,iVBORw0KGgo..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleDecode}
            disabled={!decodeInput.trim()}
            className={[
              'w-full py-3 rounded-xl font-bold text-white transition-colors shadow',
              !decodeInput.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            画像に変換する
          </button>

          {decodedPreview && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-green-700">変換完了</p>
              <img src={decodedPreview.url} alt="" className="max-w-full max-h-64 mx-auto rounded-lg border border-gray-200" />
              <button
                onClick={handleDownloadDecoded}
                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
              >
                画像をダウンロード
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
