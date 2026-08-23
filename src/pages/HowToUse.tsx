import { Link } from 'react-router-dom'
import { AdPlaceholder } from '../components/AdPlaceholder'
import { usePageMeta } from '../hooks/usePageMeta'

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
  usePageMeta(
    '使い方ガイド | 画像変換・PDF圧縮・QRコード作成の無料ツール',
    '画像変換、PDF圧縮・結合・分割、QRコード生成、トリミング、Favicon作成、カラーパレット抽出など、無料ツールの使い方をわかりやすく解説します。'
  )

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
          <StepCard num="2" title="設定を選ぶ" body='「よく使う設定」から用途に合ったプリセットを選ぶのが簡単です。行政手続き用（JPEG・2MB以下）、メール添付用（JPEG・1MB以下）、Web掲載用（WebP・500KB以下）の3種類があります。細かく指定したい場合は出力形式・サイズ・品質・リサイズを個別に設定できます。' />
          <StepCard num="3" title="変換してダウンロード" body="「○枚を変換する」ボタンを押すと変換が始まります。完了後、各ファイルの「DL」ボタンで個別ダウンロード、または「まとめてダウンロード」でZIPファイルとして一括保存できます。" />
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-3">
          <div>
            <p className="font-semibold mb-1">目標サイズ指定とは？</p>
            <p>「2MB以下」などを指定すると、自動的に品質・解像度を調整してそのサイズ以下に収めます。行政手続きで「ファイルサイズは○MB以下」と指定されている場合に便利です。</p>
          </div>
          <div>
            <p className="font-semibold mb-1">リサイズ（サイズ変更）とは？</p>
            <p>「幅を指定」「高さを指定」「長辺を指定」から選び、px単位の数値を入力すると、その寸法に収まるように画像を縮小できます。Webサイトに掲載する画像の解像度を揃えたい場合などに使えます。元画像より大きい値を指定しても拡大はされません。</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Exif（撮影情報）について</p>
            <p>スマホで撮影した写真には位置情報などのExifが含まれていることがありますが、このツールで変換すると自動的に削除されます。SNSやWebに写真を載せる際のプライバシー対策になります。</p>
          </div>
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

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-700">PDF圧縮</p>
          <div className="space-y-3 pl-2">
            <StepCard num="1" title="PDFを選んで圧縮レベルを選ぶ" body="容量の大きいPDFファイルを選び、圧縮レベルのスライダーで「高圧縮〜高品質」を調整します。各ページを画像として再構築することでファイルサイズを小さくします。" />
            <StepCard num="2" title="圧縮してダウンロード" body="「PDFを圧縮する」を押すと変換前後のサイズと削減率が表示され、圧縮済みPDFをダウンロードできます。" />
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-700">PDF結合・PDF分割</p>
          <div className="space-y-3 pl-2">
            <StepCard num="1" title="PDF結合" body="2つ以上のPDFファイルを選ぶと、矢印ボタンで結合する順番を並べ替えられます。「結合する」を押すと1つのPDFにまとめてダウンロードできます。" />
            <StepCard num="2" title="PDF分割" body="1つのPDFファイルを選んで「分割する」を押すと、ページごとに個別のPDFファイルへ分割され、ZIPでまとめてダウンロードできます。" />
          </div>
        </div>
      </Section>

      {/* QRコード */}
      <Section title="📷 QRコード生成">
        <p className="text-sm text-gray-600">
          URL・テキストのほか、WiFi接続用・連絡先(vCard)のQRコードも作成できます。名刺・チラシ・Webサイトへの掲載など幅広く使えます。
        </p>
        <div className="space-y-4">
          <StepCard num="1" title="種類を選ぶ" body="「テキスト / URL」「WiFi」「連絡先」から作りたいQRコードの種類を選びます。" />
          <StepCard num="2" title="内容を入力" body="テキスト / URLの場合はそのまま入力欄に入力します。WiFiの場合はSSID・暗号化方式・パスワードを、連絡先の場合は氏名・電話番号・メールアドレスなどを入力すると、対応する形式のQRコードが自動生成されます。WiFi用QRはスマホのカメラで読み取るとWiFiに接続でき、連絡先QRは読み取ると連絡先アプリに登録できます。" />
          <StepCard num="3" title="サイズを選んでダウンロード" body="小（256px）・中（512px）・大（1024px）からダウンロードサイズを選んで「PNGでダウンロード」を押します。入力内容はリアルタイムでプレビューに反映されます。" />
        </div>
      </Section>

      {/* トリミング・回転 */}
      <Section title="✂️ 画像のトリミング・回転">
        <p className="text-sm text-gray-600">
          1枚の画像を好きな範囲で切り抜いたり、90度ずつ回転させたりできます。
        </p>
        <div className="space-y-4">
          <StepCard num="1" title="画像を選ぶ" body="クリックして画像を選択します。JPEG・PNG・WebP・HEICに対応しています。" />
          <StepCard num="2" title="回転・範囲選択" body="「⟲ 左」「⟳ 右」ボタンで90度ずつ回転できます。切り抜きたい場合は画像の上をドラッグして範囲を指定します。範囲を選択しなければ回転後の画像全体がそのまま書き出されます。" />
          <StepCard num="3" title="適用してダウンロード" body="「適用する」を押すと処理結果がプレビュー表示され、「画像をダウンロード」から保存できます。" />
        </div>
      </Section>

      {/* Favicon */}
      <Section title="⭐ Faviconジェネレーター">
        <p className="text-sm text-gray-600">
          1枚の画像から、Webサイトに必要なfaviconを複数サイズ一括で作成します。
        </p>
        <div className="space-y-4">
          <StepCard num="1" title="画像を選ぶ" body="ロゴやアイコンにしたい画像を選びます。正方形でない場合は中央部分が自動でトリミングされます。" />
          <StepCard num="2" title="ダウンロード" body="favicon.ico（16/32/48px）、apple-touch-icon.png（180px）、icon-192.png、icon-512.pngがまとめてZIPでダウンロードされます。ZIP内のREADMEに、HTMLへの設置方法（&lt;link&gt;タグ）も記載しています。" />
        </div>
      </Section>

      {/* カラーパレット抽出 */}
      <Section title="🎨 カラーパレット抽出">
        <p className="text-sm text-gray-600">
          画像の中でよく使われている色を自動で抽出し、HEXカラーコードで表示します。デザインやブログの配色を決める際に便利です。
        </p>
        <div className="space-y-4">
          <StepCard num="1" title="画像を選ぶ" body="配色を調べたい画像を選ぶと、自動で解析が始まります。" />
          <StepCard num="2" title="色をコピー" body="抽出された色のスウォッチをクリックすると、HEXカラーコード（例: #3b82f6）がクリップボードにコピーされます。" />
        </div>
      </Section>

      {/* Base64 */}
      <Section title="🔤 Base64エンコード/デコード">
        <p className="text-sm text-gray-600">
          画像ファイルとBase64文字列を相互に変換します。HTML/CSSに画像を直接埋め込みたい場合などに使える開発者向けの機能です。
        </p>
        <div className="space-y-4">
          <StepCard num="1" title="画像 → Base64" body="「画像 → Base64」タブで画像を選ぶと、data:image/...;base64,... の形式のテキストが生成されます。「コピー」でクリップボードに、「テキストで保存」でファイルとして保存できます。" />
          <StepCard num="2" title="Base64 → 画像" body="「Base64 → 画像」タブにBase64文字列を貼り付けて「画像に変換する」を押すと、画像としてプレビュー・ダウンロードできます。" />
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
