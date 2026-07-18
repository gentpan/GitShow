import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, readFileSync } from 'node:fs'

const markPaths = readFileSync('public/favicon.svg', 'utf8')
  .replace(/<\/?svg[^>]*>/g, '')
  .trim()

function render(size: number, bg: string | null, out: string) {
  const svg = bg
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="${bg}"/>
        <g transform="translate(${size * 0.1},${size * 0.1}) scale(${(size * 0.8) / 1024})">${markPaths}</g>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">${markPaths}</svg>`

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
  writeFileSync(out, resvg.render().asPng())
  console.log('wrote', out)
}

render(16, null, 'public/favicon-16x16.png')
render(32, null, 'public/favicon-32x32.png')
render(180, '#0d1117', 'public/apple-touch-icon.png')
render(192, '#0d1117', 'public/android-chrome-192x192.png')
render(512, '#0d1117', 'public/android-chrome-512x512.png')

// favicon.ico: write 32px PNG as fallback bytes won't work; keep svg primary.
// Pack a minimal ICO from 32px PNG.
const png32 = readFileSync('public/favicon-32x32.png')
const ico = pngToIco(png32)
writeFileSync('public/favicon.ico', ico)
console.log('wrote public/favicon.ico')

function pngToIco(png: Buffer): Buffer {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)

  const entry = Buffer.alloc(16)
  entry.writeUInt8(32, 0)
  entry.writeUInt8(32, 1)
  entry.writeUInt8(0, 2)
  entry.writeUInt8(0, 3)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(22, 12)

  return Buffer.concat([header, entry, png])
}
