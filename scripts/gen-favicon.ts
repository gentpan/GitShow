import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'node:fs'

/**
 * Original mark is on a 12×12 grid (1024/12).
 * Rebuild as integer cells so 16/32 favicons stay crisp.
 */
const GRID = 12
const CELLS = new Set<string>()

function addRect(x: number, y: number, w: number, h: number) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      if (xx >= 0 && xx < GRID && yy >= 0 && yy < GRID) CELLS.add(`${xx},${yy}`)
    }
  }
}

function delRect(x: number, y: number, w: number, h: number) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) CELLS.delete(`${xx},${yy}`)
  }
}

// Rasterize original SVG once at 12×12 via coverage sampling
function sampleOriginal() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 1024 1024" shape-rendering="crispEdges">
    <rect width="1024" height="1024" fill="#000"/>
    <path fill="#fff" d="M256 85.333333h512v85.333334H256V85.333333zM426.666667 597.333333H341.333333v-85.333333h85.333334v85.333333zM597.333333 597.333333v85.333334h-170.666666v-85.333334h170.666666zM597.333333 597.333333v-85.333333h85.333334v85.333333h-85.333334z"/>
    <path fill="#fff" d="M256 256V170.666667H170.666667v85.333333H85.333333v512h85.333334v85.333333h85.333333v85.333334h512v-85.333334h85.333333v-85.333333h85.333334V256h-85.333334V170.666667h-85.333333v85.333333h-85.333333v85.333333H341.333333V256H256z m85.333333 256v-85.333333h341.333334v85.333333h85.333333V256h85.333333v512h-85.333333v85.333333h-85.333333v-170.666666h-85.333334v170.666666h-170.666666v-170.666666H256v85.333333h85.333333v85.333333H256v-85.333333H170.666667v-85.333333h85.333333v-85.333334H170.666667V256h85.333333v256h85.333333z"/>
  </svg>`
  // Render large then sample cell centers
  const big = new Resvg(
    svg.replace('width="12" height="12"', 'width="384" height="384"'),
    { fitTo: { mode: 'width', value: 384 } },
  ).render()
  const png = big.asPng()
  // Parse PNG minimally via Resvg pixels API
  const rendered = new Resvg(
    svg.replace('width="12" height="12"', 'width="384" height="384"'),
    { fitTo: { mode: 'width', value: 384 } },
  ).render()
  const { width, height, pixels } = rendered // RGBA
  const cell = width / GRID
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const cx = Math.floor(gx * cell + cell / 2)
      const cy = Math.floor(gy * cell + cell / 2)
      const i = (cy * width + cx) * 4
      if (pixels[i] > 128) CELLS.add(`${gx},${gy}`)
    }
  }
}

sampleOriginal()

function cellsToRects(): string {
  // Emit one <rect> per filled cell (crisp at any integer scale)
  return [...CELLS]
    .map((key) => {
      const [x, y] = key.split(',').map(Number)
      return `<rect x="${x}" y="${y}" width="1" height="1"/>`
    })
    .join('')
}

const markRects = cellsToRects()

function tileSvg(size: number, radius: number, pad: number): string {
  const inner = size - pad * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0d1117"/>
  <g fill="#fafafa" transform="translate(${pad} ${pad}) scale(${inner / GRID})">${markRects}</g>
</svg>`
}

function renderPng(size: number, radius: number, pad: number, out: string) {
  const svg = tileSvg(size, radius, pad)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    shapeRendering: 0,
  })
  writeFileSync(out, resvg.render().asPng())
  console.log('wrote', out)
}

// Favicon SVG: 32 viewBox, integer grid
writeFileSync(
  'public/favicon.svg',
  tileSvg(32, 6, 4).replace(/width="32" height="32" /, ''),
)
console.log('wrote public/favicon.svg')

renderPng(16, 3, 2, 'public/favicon-16x16.png')
renderPng(32, 6, 4, 'public/favicon-32x32.png')
renderPng(180, 32, 22, 'public/apple-touch-icon.png')
renderPng(192, 34, 24, 'public/android-chrome-192x192.png')
renderPng(512, 92, 64, 'public/android-chrome-512x512.png')

// ICO with 16 + 32
const { readFileSync } = await import('node:fs')
const png16 = readFileSync('public/favicon-16x16.png')
const png32 = readFileSync('public/favicon-32x32.png')
writeFileSync('public/favicon.ico', pngsToIco([
  { size: 16, png: png16 },
  { size: 32, png: png32 },
]))
console.log('wrote public/favicon.ico')
console.log('cells', CELLS.size)

function pngsToIco(images: { size: number; png: Buffer }[]): Buffer {
  const count = images.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)
  const entries = Buffer.alloc(16 * count)
  let offset = 6 + 16 * count
  const parts: Buffer[] = [header, entries]
  images.forEach((img, i) => {
    const o = i * 16
    entries.writeUInt8(img.size >= 256 ? 0 : img.size, o)
    entries.writeUInt8(img.size >= 256 ? 0 : img.size, o + 1)
    entries.writeUInt8(0, o + 2)
    entries.writeUInt8(0, o + 3)
    entries.writeUInt16LE(1, o + 4)
    entries.writeUInt16LE(32, o + 6)
    entries.writeUInt32LE(img.png.length, o + 8)
    entries.writeUInt32LE(offset, o + 12)
    parts.push(img.png)
    offset += img.png.length
  })
  return Buffer.concat(parts)
}
