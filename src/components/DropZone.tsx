import { useRef, useState } from 'react'
import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES, MAX_FILES } from '../constants/presets'

interface Props {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

export function DropZone({ onFiles, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function filterValidFiles(fileList: FileList | File[]): { valid: File[]; errors: string[] } {
    const files = Array.from(fileList)
    const valid: File[] = []
    const errors: string[] = []

    for (const f of files) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      const isValidType =
        ACCEPTED_MIME_TYPES.includes(f.type) || ACCEPTED_EXTENSIONS.includes(ext)
      if (!isValidType) {
        errors.push(`「${f.name}」は対応していない形式です`)
      } else {
        valid.push(f)
      }
    }
    return { valid, errors }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const { valid, errors } = filterValidFiles(e.dataTransfer.files)
    if (errors.length) alert(errors.join('\n'))
    if (valid.length) onFiles(valid.slice(0, MAX_FILES))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const { valid, errors } = filterValidFiles(e.target.files)
    if (errors.length) alert(errors.join('\n'))
    if (valid.length) onFiles(valid.slice(0, MAX_FILES))
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={[
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        multiple
        className="hidden"
        onChange={handleChange}
        capture={undefined}
      />
      <div className="text-4xl mb-3">🖼️</div>
      <p className="text-lg font-semibold text-gray-700 mb-1">
        ここに画像をドラッグ＆ドロップ
      </p>
      <p className="text-sm text-gray-500 mb-3">またはタップ・クリックして選択</p>
      <p className="text-xs text-gray-400">
        対応形式：JPEG / PNG / WebP / HEIC　最大{MAX_FILES}枚まで
      </p>
    </div>
  )
}
