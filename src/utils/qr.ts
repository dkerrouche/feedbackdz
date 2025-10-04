// Lightweight QR helpers using the 'qrcode' package (already in project deps)
// Generates PNG data URLs and SVG strings for download/display

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H'

export interface GenerateQrOptions {
  errorCorrectionLevel?: QrErrorCorrection
  margin?: number
  scale?: number
  colorDark?: string
  colorLight?: string
}

const defaultOptions: GenerateQrOptions = {
  errorCorrectionLevel: 'M',
  margin: 2,
  scale: 6,
  colorDark: '#111827', // gray-900
  colorLight: '#ffffff'
}

export async function generateQrPngDataUrl(
  text: string,
  options?: GenerateQrOptions
): Promise<string> {
  const QRCode = await import('qrcode')
  const opts = { ...defaultOptions, ...options }
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    scale: opts.scale,
    color: { dark: opts.colorDark!, light: opts.colorLight! }
  })
}

export async function generateQrSvgString(
  text: string,
  options?: GenerateQrOptions
): Promise<string> {
  const QRCode = await import('qrcode')
  const opts = { ...defaultOptions, ...options }
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: opts.errorCorrectionLevel,
    margin: opts.margin,
    color: { dark: opts.colorDark!, light: opts.colorLight! }
  })
}

export function downloadDataUrl(filename: string, dataUrl: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadSvg(filename: string, svgString: string) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

