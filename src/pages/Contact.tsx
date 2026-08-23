export function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mb-6">
          ご質問・ご要望・不具合のご報告はこちらからどうぞ。
        </p>
        <div className="w-full overflow-hidden rounded-xl">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdVVEeZ8PAg5vIcXax6DdnRwCewnHXpRof7Gb4zD7O8fF2q9Q/viewform?embedded=true"
            width="100%"
            height="700"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="お問い合わせフォーム"
          >
            読み込んでいます…
          </iframe>
        </div>
      </div>
    </div>
  )
}
