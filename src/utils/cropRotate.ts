export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error('画像の生成に失敗しました')), 'image/png')
  })
}

// 90度単位で画像を回転した新しい画像を生成する
export async function rotate90(url: string, clockwise: boolean): Promise<{ url: string; blob: Blob }> {
  const img = await loadImage(url)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalHeight
  canvas.height = img.naturalWidth
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((clockwise ? 90 : -90) * (Math.PI / 180))
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
  const blob = await canvasToBlob(canvas)
  return { url: URL.createObjectURL(blob), blob }
}

// 指定範囲（元画像のピクセル座標）で画像を切り抜く
export async function cropToBlob(
  url: string,
  rect: { x: number; y: number; w: number; h: number },
): Promise<Blob> {
  const img = await loadImage(url)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(rect.w))
  canvas.height = Math.max(1, Math.round(rect.h))
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, canvas.width, canvas.height)
  return canvasToBlob(canvas)
}

// 画像をそのままPNGとして書き出す（切り抜き未指定時に使用）
export async function exportAsIs(url: string): Promise<Blob> {
  const img = await loadImage(url)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d')!.drawImage(img, 0, 0)
  return canvasToBlob(canvas)
}
