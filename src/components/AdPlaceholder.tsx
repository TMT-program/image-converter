/* 広告枠プレースホルダー
   PC: 728x90 (leaderboard)
   スマホ: 320x50 (mobile banner)
   実際の広告タグはここに挿入する
*/
export function AdPlaceholder() {
  return (
    <div className="flex justify-center my-4">
      {/* PC広告枠 728x90 */}
      <div
        className="hidden sm:flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 text-gray-400 text-xs rounded"
        style={{ width: 728, height: 90 }}
      >
        広告枠 (728×90)
      </div>
      {/* スマホ広告枠 320x50 */}
      <div
        className="flex sm:hidden items-center justify-center bg-gray-100 border border-dashed border-gray-300 text-gray-400 text-xs rounded"
        style={{ width: 320, height: 50 }}
      >
        広告枠 (320×50)
      </div>
    </div>
  )
}
