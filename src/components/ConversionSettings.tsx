import { useState } from 'react'
import type { ConversionSettings, OutputFormat, TargetSizePreset } from '../types'
import { TARGET_SIZE_OPTIONS } from '../constants/presets'

interface Props {
  settings: ConversionSettings
  onChange: (s: ConversionSettings) => void
}

export function ConversionSettingsPanel({ settings, onChange }: Props) {
  const [customKB, setCustomKB] = useState('')

  function setFormat(outputFormat: OutputFormat) {
    onChange({ ...settings, outputFormat })
  }

  function setQuality(quality: number) {
    onChange({ ...settings, quality, targetSizePreset: null, targetSizeKB: null })
  }

  function setTargetPreset(preset: TargetSizePreset, kb: number | null) {
    onChange({ ...settings, targetSizePreset: preset, targetSizeKB: kb })
  }

  function applyCustomKB() {
    const kb = parseInt(customKB)
    if (!kb || kb <= 0) return
    onChange({ ...settings, targetSizePreset: 'custom', targetSizeKB: kb })
  }

  const formats: { value: OutputFormat; label: string }[] = [
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/webp', label: 'WebP' },
  ]

  const qualityLabel =
    settings.quality >= 0.9 ? '高品質' :
    settings.quality >= 0.7 ? '標準' :
    settings.quality >= 0.5 ? '中品質' : '低品質'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      {/* 出力形式 */}
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">出力形式</p>
        <div className="flex gap-2">
          {formats.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={[
                'px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                settings.outputFormat === f.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* サイズ指定 */}
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">ファイルサイズ・品質</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {TARGET_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.preset}
              onClick={() => setTargetPreset(opt.preset, opt.kb)}
              className={[
                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                settings.targetSizePreset === opt.preset
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-400',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}

          {/* 任意入力 */}
          <div className="flex gap-1 items-center">
            <input
              type="number"
              min="10"
              max="50000"
              placeholder="KB"
              value={customKB}
              onChange={(e) => setCustomKB(e.target.value)}
              className={[
                'w-20 px-2 py-1.5 rounded-lg border text-sm text-center',
                settings.targetSizePreset === 'custom'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300',
              ].join(' ')}
            />
            <button
              onClick={applyCustomKB}
              className="px-3 py-1.5 rounded-lg border text-sm font-medium bg-white border-gray-300 hover:border-green-400"
            >
              KB以下
            </button>
          </div>
        </div>

        {/* 品質スライダー */}
        <div className={settings.targetSizeKB !== null ? 'opacity-40 pointer-events-none' : ''}>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>低品質</span>
            <span className="font-medium text-gray-700">{qualityLabel} ({Math.round(settings.quality * 100)}%)</span>
            <span>高品質</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={Math.round(settings.quality * 100)}
            onChange={(e) => setQuality(Number(e.target.value) / 100)}
            className="w-full accent-blue-600"
          />
          {settings.targetSizeKB !== null && (
            <p className="text-xs text-gray-500 mt-1">
              目標サイズ指定中 — スライダーは無効です
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
