// PNG画像を内包する.icoファイルを生成する（Vista以降のPNG格納形式）
export async function buildIco(pngs: { size: number; blob: Blob }[]): Promise<Blob> {
  const buffers = await Promise.all(pngs.map((p) => p.blob.arrayBuffer()))

  const headerSize = 6
  const entrySize = 16
  const dirSize = headerSize + entrySize * pngs.length
  let offset = dirSize
  const totalSize = dirSize + buffers.reduce((sum, b) => sum + b.byteLength, 0)

  const out = new Uint8Array(totalSize)
  const view = new DataView(out.buffer)

  // ICONDIR
  view.setUint16(0, 0, true) // reserved
  view.setUint16(2, 1, true) // type: icon
  view.setUint16(4, pngs.length, true) // count

  pngs.forEach((p, i) => {
    const entryOffset = headerSize + i * entrySize
    const buf = buffers[i]
    const sizeByte = p.size >= 256 ? 0 : p.size

    out[entryOffset] = sizeByte // width
    out[entryOffset + 1] = sizeByte // height
    out[entryOffset + 2] = 0 // color count
    out[entryOffset + 3] = 0 // reserved
    view.setUint16(entryOffset + 4, 1, true) // planes
    view.setUint16(entryOffset + 6, 32, true) // bit count
    view.setUint32(entryOffset + 8, buf.byteLength, true) // bytes in resource
    view.setUint32(entryOffset + 12, offset, true) // image offset

    out.set(new Uint8Array(buf), offset)
    offset += buf.byteLength
  })

  return new Blob([out], { type: 'image/x-icon' })
}
