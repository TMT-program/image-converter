import type { ConversionSettings } from '../types'

export interface Preset {
  id: string
  label: string
  description: string
  settings: ConversionSettings
}

export const PRESETS: Preset[] = [
  {
    id: 'government',
    label: '行政手続き用',
    description: 'JPEG・2MB以下',
    settings: {
      outputFormat: 'image/jpeg',
      quality: 0.85,
      targetSizePreset: '2MB',
      targetSizeKB: 2048,
      resizeMode: 'none',
      resizeValue: null,
    },
  },
  {
    id: 'email',
    label: 'メール添付用',
    description: 'JPEG・1MB以下',
    settings: {
      outputFormat: 'image/jpeg',
      quality: 0.8,
      targetSizePreset: '1MB',
      targetSizeKB: 1024,
      resizeMode: 'none',
      resizeValue: null,
    },
  },
  {
    id: 'web',
    label: 'Web掲載用',
    description: 'WebP・500KB以下',
    settings: {
      outputFormat: 'image/webp',
      quality: 0.8,
      targetSizePreset: '500KB',
      targetSizeKB: 512,
      resizeMode: 'longEdge',
      resizeValue: 1600,
    },
  },
]

export const TARGET_SIZE_OPTIONS = [
  { label: '2MB以下', preset: '2MB' as const, kb: 2048 },
  { label: '1MB以下', preset: '1MB' as const, kb: 1024 },
  { label: '500KB以下', preset: '500KB' as const, kb: 512 },
]

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']

export const MAX_FILES = 10
