import { usePageMeta } from '../hooks/usePageMeta'

// メールアドレスを分割して保持し、静的HTML上に平文で出さないようにする
const CONTACT_USER = 'kurinamis'
const CONTACT_DOMAIN = 'gmail.com'

export function Contact() {
  usePageMeta(
    'お問い合わせ | 画像変換・軽量化ツール',
    '画像変換・軽量化ツールへのご質問・ご要望・不具合のご報告はこちらから。'
  )

  function handleClick() {
    const address = `${CONTACT_USER}@${CONTACT_DOMAIN}`
    const subject = encodeURIComponent('画像変換・軽量化ツールについて')
    window.location.href = `mailto:${address}?subject=${subject}`
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mb-6">
          ご質問・ご要望・不具合のご報告はメールでお気軽にどうぞ。
        </p>
        <button
          onClick={handleClick}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          メールで問い合わせる
        </button>
      </div>
    </div>
  )
}
