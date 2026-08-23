import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-lg font-bold text-gray-900">画像変換・軽量化ツール</h1>
            <p className="text-xs text-gray-500">無料・登録不要・すべてブラウザで処理</p>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <span className="text-green-600 text-base">🔒</span>
            <p className="text-xs text-green-700 font-medium">ファイルは外部に送信されません</p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {!isHome && (
            <div className="text-center">
              <Link to="/" className="text-sm text-blue-600 hover:underline">
                ← ツールに戻る
              </Link>
            </div>
          )}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <Link to="/how-to-use" className="hover:text-gray-700 hover:underline">使い方</Link>
            <Link to="/privacy" className="hover:text-gray-700 hover:underline">プライバシーポリシー</Link>
            <Link to="/terms" className="hover:text-gray-700 hover:underline">利用規約</Link>
            <Link to="/contact" className="hover:text-gray-700 hover:underline">お問い合わせ</Link>
          </nav>
          <p className="text-center text-xs text-gray-400">
            ファイルはすべてお使いの端末内で処理され、外部に送信されることはありません。
          </p>
          <p className="text-center text-xs text-gray-400">© 2026 画像変換・軽量化ツール</p>
        </div>
      </footer>
    </div>
  )
}
