import { PRESETS } from '../constants/presets'
import type { ConversionSettings } from '../types'

interface Props {
  onSelect: (settings: ConversionSettings) => void
  activePresetId: string | null
}

export function PresetButtons({ onSelect, activePresetId }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600 mb-2">よく使う設定</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.settings)}
            className={[
              'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
              activePresetId === preset.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600',
            ].join(' ')}
          >
            <span className="font-semibold">{preset.label}</span>
            <span className="ml-1 text-xs opacity-70">({preset.description})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
