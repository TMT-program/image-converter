import { useState, useRef, useEffect, useMemo } from 'react'
import QRCode from 'qrcode'

const SIZE_OPTIONS = [
  { label: '小 (256px)', value: 256 },
  { label: '中 (512px)', value: 512 },
  { label: '大 (1024px)', value: 1024 },
]

type QrType = 'text' | 'wifi' | 'vcard'

const QR_TYPES: { value: QrType; label: string }[] = [
  { value: 'text', label: 'テキスト / URL' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'vcard', label: '連絡先' },
]

// WiFi/vCardの値中に含まれる特殊文字をエスケープする
function escapeField(v: string): string {
  return v.replace(/([\\;,:])/g, '\\$1')
}

export function QrTab() {
  const [qrType, setQrType] = useState<QrType>('text')
  const [size, setSize] = useState(512)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // テキスト/URL
  const [text, setText] = useState('')

  // WiFi
  const [wifiSsid, setWifiSsid] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')

  // 連絡先 (vCard)
  const [vcName, setVcName] = useState('')
  const [vcTel, setVcTel] = useState('')
  const [vcEmail, setVcEmail] = useState('')
  const [vcOrg, setVcOrg] = useState('')

  const payload = useMemo(() => {
    if (qrType === 'text') return text.trim()

    if (qrType === 'wifi') {
      if (!wifiSsid.trim()) return ''
      const sec = wifiSecurity === 'nopass' ? 'nopass' : wifiSecurity
      const pass = wifiSecurity === 'nopass' ? '' : `P:${escapeField(wifiPassword)};`
      return `WIFI:T:${sec};S:${escapeField(wifiSsid)};${pass};`
    }

    // vcard
    if (!vcName.trim()) return ''
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:;${escapeField(vcName)};;;`,
      `FN:${escapeField(vcName)}`,
    ]
    if (vcTel.trim()) lines.push(`TEL:${escapeField(vcTel)}`)
    if (vcEmail.trim()) lines.push(`EMAIL:${escapeField(vcEmail)}`)
    if (vcOrg.trim()) lines.push(`ORG:${escapeField(vcOrg)}`)
    lines.push('END:VCARD')
    return lines.join('\n')
  }, [qrType, text, wifiSsid, wifiPassword, wifiSecurity, vcName, vcTel, vcEmail, vcOrg])

  useEffect(() => {
    if (!payload) {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      setError(null)
      return
    }

    QRCode.toCanvas(canvasRef.current!, payload, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(() => setError(null))
      .catch(() => setError('QRコードの生成に失敗しました。入力内容が長すぎる可能性があります。'))
  }, [payload, size])

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas || !payload) return
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

  const hasContent = payload.length > 0 && !error

  const inputClass = 'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400'

  return (
    <div className="space-y-5">

      {/* 種類切り替え */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {QR_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setQrType(t.value)}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
              qrType === t.value
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 入力: テキスト/URL */}
      {qrType === 'text' && (
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
      )}

      {/* 入力: WiFi */}
      {qrType === 'wifi' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">SSID（ネットワーク名）</label>
            <input value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="MyWiFi" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">暗号化方式</label>
            <div className="flex gap-2">
              {(['WPA', 'WEP', 'nopass'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setWifiSecurity(s)}
                  className={[
                    'px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                    wifiSecurity === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
                  ].join(' ')}
                >
                  {s === 'nopass' ? 'なし' : s}
                </button>
              ))}
            </div>
          </div>
          {wifiSecurity !== 'nopass' && (
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">パスワード</label>
              <input value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} className={inputClass} />
            </div>
          )}
        </div>
      )}

      {/* 入力: 連絡先 */}
      {qrType === 'vcard' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">氏名</label>
            <input value={vcName} onChange={(e) => setVcName(e.target.value)} placeholder="山田 太郎" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">電話番号</label>
            <input value={vcTel} onChange={(e) => setVcTel(e.target.value)} placeholder="090-1234-5678" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">メールアドレス</label>
            <input value={vcEmail} onChange={(e) => setVcEmail(e.target.value)} placeholder="example@example.com" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">会社名・組織名</label>
            <input value={vcOrg} onChange={(e) => setVcOrg(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

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
          !payload ? 'opacity-30' : '',
        ].join(' ')}>
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: 240, height: 240 }}
          />
        </div>
        {!payload && (
          <p className="text-sm text-gray-400">入力するとQRコードが表示されます</p>
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
