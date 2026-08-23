function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 leading-relaxed mb-2">{children}</p>
}

export function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">プライバシーポリシー</h1>
        <p className="text-xs text-gray-400 mb-6">最終更新日：2026年8月9日</p>

        <P>
          本プライバシーポリシーは、画像変換・軽量化ツール（以下「本サービス」）における個人情報の取り扱いについて定めるものです。
        </P>

        <H2>1. ファイルの取り扱いについて</H2>
        <P>
          本サービスにおける画像・PDFファイルの変換・圧縮処理は、すべてお使いのブラウザ（端末）内で完結しています。アップロードされたファイルは当サービスのサーバーに送信されることはなく、外部のいかなる第三者にも提供されません。
        </P>

        <H2>2. 収集する情報</H2>
        <P>本サービスは以下の情報を収集する場合があります。</P>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-2 ml-2">
          <li>アクセスログ（IPアドレス、ブラウザの種類、アクセス日時）</li>
          <li>Cookieおよびこれに類する技術を用いた利用状況の統計情報</li>
        </ul>
        <P>これらの情報は、サービスの改善および広告配信の目的のみに使用します。</P>

        <H2>3. Google AdSenseについて</H2>
        <P>
          本サービスでは、広告配信サービスとしてGoogle AdSenseを利用する場合があります。Google AdSenseはCookieを使用してユーザーの興味に応じた広告を表示します。Googleによる広告Cookieの使用はGoogleのプライバシーポリシーに従います。Cookieを無効にする方法やGoogleアドセンスに関する詳細については、Googleの「広告に関するポリシー」をご参照ください。
        </P>

        <H2>4. Google Analyticsについて</H2>
        <P>
          本サービスでは、サービス向上のためにGoogle Analyticsを使用する場合があります。Google Analyticsはトラフィックデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
        </P>

        <H2>5. 第三者への情報提供</H2>
        <P>
          当サービスは、法令に基づく場合を除き、収集した情報を第三者に提供することはありません。
        </P>

        <H2>6. プライバシーポリシーの変更</H2>
        <P>
          本ポリシーの内容は、必要に応じて変更することがあります。変更後のポリシーは本ページに掲載した時点から効力を生じます。
        </P>

        <H2>7. お問い合わせ</H2>
        <P>
          本プライバシーポリシーに関するお問い合わせは、サイト内のお問い合わせフォームよりご連絡ください。
        </P>
      </div>
    </div>
  )
}
