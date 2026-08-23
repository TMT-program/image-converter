import { formatBytes, reductionPercent } from '../utils/imageConverter'
import { downloadSingle } from '../utils/zipDownloader'
import type { ConvertedFile } from '../types'

interface Props {
  file: ConvertedFile
  onRemove: (id: string) => void
}

export function FileCard({ file, onRemove }: Props) {
  const reduction =
    file.convertedSizeBytes !== null
      ? reductionPercent(file.originalSizeBytes, file.convertedSizeBytes)
      : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4">
      {/* プレビュー */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {file.previewUrl ? (
          <img src={file.previewUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
        )}
      </div>

      {/* 情報 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate mb-1">
          {file.originalFile.name}
        </p>

        {file.status === 'pending' && (
          <p className="text-xs text-gray-400">変換待ち</p>
        )}

        {file.status === 'converting' && (
          <p className="text-xs text-blue-500 animate-pulse">変換中...</p>
        )}

        {file.status === 'error' && (
          <p className="text-xs text-red-500">{file.errorMessage}</p>
        )}

        {file.status === 'done' && file.convertedSizeBytes !== null && (
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500">
              変換前: {formatBytes(file.originalSizeBytes)}
              {' → '}
              <span className="text-gray-700 font-medium">
                変換後: {formatBytes(file.convertedSizeBytes)}
              </span>
            </p>
            {reduction !== null && (
              <p className={[
                'text-xs font-semibold',
                reduction > 0 ? 'text-green-600' : 'text-gray-400',
              ].join(' ')}>
                {reduction > 0 ? `▼ ${reduction}% 削減` : '変化なし'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* アクション */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {file.status === 'done' && (
          <button
            onClick={() => downloadSingle(file)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
          >
            DL
          </button>
        )}
        <button
          onClick={() => onRemove(file.id)}
          className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-lg hover:bg-gray-200 transition-colors"
        >
          削除
        </button>
      </div>
    </div>
  )
}
