import { Link } from 'react-router-dom'
import { AdPlaceholder } from '../components/AdPlaceholder'

interface Step {
  num: string
  title: string
  body: string
}

function StepCard({ num, title, body }: Step) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {num}
      </div>
      <div>
        <p className="font-semibold text-gray-800 mb-1">{title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </section>
  )
}

export function HowToUse() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">使い方ガイド</h1>
        <p className="text-gray-600 text-sm">
          このツールはすべての操作がブラウザ内で完結します。ファイルがインターネット上に送られることはありません。
        </p>
      </div>

      {/* 画像変換 */}
      <Section title="🖼️ 画像変換・軽量化">
        <p className="text-sm text-gray-600">
          JPEG・PNG・WebP・HEICの画像を変換・圧縮します。行政手続きのファイルサイズ制限、メール添付、Web掲載など用途に合わせて使えます。
        </p>
        <div className="space-y-4">
          <StepCard num="1" title="画像を選ぶ" body="点線枠にファイルをドラッグ＆ドロップするか、クリックしてファイルを選択してください。スマホではタップするとカメラロールから選べます。最大10枚まで同時に処理できます。" />
          <StepCard num="2" title="設定を選ぶ" body='「よく使う設定」から用途に合ったプリセットを選ぶのが簡単です。行政手続き用（JPEG・2MB以下）、メール添付用（JPEG・1MB以下）、Web掲載用（WebP・500KB以下）の3種類があります。細かく指定したい場合は出力形式・サイズ・品質を個別に設定できます。' />
          <StepCard num="3" title="変換してダウンロード" body="「○枚を変換する」ボタンを押すと変換が始まります。完了後、各ファイルの「DL」ボタンで個別ダウンロード、または「まとめてダウンロード」でZIPファイルとして一括保存できます。" />
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">目標サイズ指定とは？</p>
          <p>「2MB以下」などを指定すると、自動的に品質・解像度を調整してそのサイズ以下に収めます。行政手続きで「ファイルサイズは○MB以下」と指定されている場合に便利です。</p>
        </div>
      </Section>

      {/* PDF変換 */}
      <Section title="📄 PDF変換">
        <p className="text-sm text-gray-600">
          画像をPDFにまとめたり、PDFの各ページを画像として書き出せます。
        </p>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">画像 → PDF</p>
          <div className="space-y-3 pl-2">
            <StepCard num="1" title="画像を選ぶ" body="「クリックして画像を選択」から複数の画像を選びます。選んだ順番通りにPDFのページになります。JPEG・PNG・WebP・HEICに対応しています。" />
            <StepCard num="2" title="PDFに変換してダウンロード" body="「PDFに変換する」ボタンを押すと変換されます。完了後に「PDFをダウンロード」ボタンが表示されます。" />
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-700">PDF → 画像</p>
          <div className="space-y-3 pl-2">
            <StepCard num="1" title="PDFを選ぶ" body="「クリックしてPDFを選択」からPDFファイルを選びます。" />
            <StepCard num="2" title="出力形式を選んで変換" body="JPEG・PNG・WebPから出力形式を選んで「画像に変換する」を押します。複数ページのPDFはページごとに変換され、ZIPでまとめてダウンロードできます。" />
          </div>
        </div>
      </Section>

      {/* QRコード */}
      <Section title="📷 QRコード生成">
        <p className="text-sm text-gray-600">
          URLやテキストをQRコードに変換してPNG画像でダウンロードできます。名刺・チラシ・Webサイトへの掲載など幅広く使えます。
        </p>
        <div className="space-y-4">
          <StepCard num="1" title="URLまたはテキストを入力" body="テキストエリアにQRコードにしたい内容を入力します。WebサイトのURL、メールアドレス、電話番号、任意のテキストなど何でも変換できます。" />
          <StepCard num="2" title="サイズを選んでダウンロード" body="小（256px）・中（512px）・大（1024px）からダウンロードサイズを選んで「PNGでダウンロード」を押します。入力した内容はリアルタイムでプレビューに反映されます。" />
        </div>
      </Section>

      {/* FAQ */}
      <Section title="よくある質問">
        <div className="space-y-4">
          {[
            {
              q: 'ファイルはサーバーに送られますか？',
              a: 'いいえ。すべての処理はお使いのブラウザ（端末）内で完結しています。画像・PDFがインターネット上に送信されることはありません。',
            },
            {
              q: 'スマホでも使えますか？',
              a: 'はい。iOS Safari・Android Chromeなど主要なスマホブラウザに対応しています。タップで写真アプリから画像を選択できます。',
            },
            {
              q: 'HEICファイルとは何ですか？',
              a: 'iPhoneで撮影した写真のデフォルト形式です。行政サイトなどJPEGしか受け付けないシステムに提出する際は、このツールでJPEGに変換してください。',
            },
            {
              q: '変換後の画質は落ちますか？',
              a: '品質スライダーを「高品質」に設定すると画質の劣化を最小限に抑えられます。ただしJPEGは非可逆圧縮のため、変換のたびに若干の劣化が生じます。',
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <p className="font-semibold text-gray-800 mb-1 text-sm">Q. {q}</p>
              <p className="text-sm text-gray-600 leading-relaxed">A. {a}</p>
            </div>
          ))}
        </div>
      </Section>

      <AdPlaceholder />

      <div className="text-center">
        <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
          ツールを使ってみる
        </Link>
      </div>
    </div>
  )
}
