import { usePageMeta } from '../hooks/usePageMeta'

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 leading-relaxed mb-2">{children}</p>
}

export function Terms() {
  usePageMeta(
    '利用規約 | 画像変換・軽量化ツール',
    '画像変換・軽量化ツールの利用規約です。'
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">利用規約</h1>
        <p className="text-xs text-gray-400 mb-6">最終更新日：2026年8月9日</p>

        <P>
          本利用規約（以下「本規約」）は、画像変換・軽量化ツール（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様には本規約に同意いただいた上でご利用いただきます。
        </P>

        <H2>第1条（適用）</H2>
        <P>
          本規約は、ユーザーと本サービス運営者との間の本サービスの利用に関わる一切の関係に適用されます。
        </P>

        <H2>第2条（サービスの内容）</H2>
        <P>
          本サービスは、画像ファイルの形式変換・サイズ軽量化、PDF変換、QRコード生成を行うWebツールを提供します。すべての処理はユーザーのブラウザ上で実行され、ファイルは外部サーバーに送信されません。
        </P>

        <H2>第3条（禁止事項）</H2>
        <P>ユーザーは本サービスの利用にあたり、以下の行為を行ってはなりません。</P>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-2 ml-2">
          <li>法令または公序良俗に違反する行為</li>
          <li>著作権・肖像権など第三者の権利を侵害する行為</li>
          <li>本サービスの運営を妨害するおそれのある行為</li>
          <li>本サービスを不正な目的で利用する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ul>

        <H2>第4条（免責事項）</H2>
        <P>
          本サービスは現状有姿で提供されます。運営者は、本サービスの変換結果の正確性・完全性・特定目的への適合性について保証しません。
        </P>
        <P>
          本サービスの利用または利用不能によって生じた損害（データの損失、業務の中断等を含む）について、運営者は一切の責任を負いません。
        </P>
        <P>
          本サービスは予告なく内容の変更・停止・終了することがあります。
        </P>

        <H2>第5条（著作権）</H2>
        <P>
          本サービス上のテキスト・デザイン等の著作権は運営者に帰属します。ユーザーが本サービスを通じて生成したファイル（変換後の画像・PDF・QRコード等）の権利はユーザーに帰属します。
        </P>

        <H2>第6条（規約の変更）</H2>
        <P>
          運営者は必要に応じて本規約を変更することができます。変更後の規約は本ページに掲載した時点から効力を生じます。
        </P>

        <H2>第7条（準拠法・管轄）</H2>
        <P>
          本規約の解釈にあたっては日本法を準拠法とし、本サービスに関して生じた紛争については、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
        </P>
      </div>
    </div>
  )
}
