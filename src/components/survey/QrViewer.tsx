'use client'

import { useEffect, useState } from 'react'
import { downloadDataUrl, downloadSvg, generateQrPngDataUrl, generateQrSvgString } from '@/utils/qr'

interface QrViewerProps {
  value: string
  label?: string
  showCopy?: boolean
}

export default function QrViewer({ value, label, showCopy = true }: QrViewerProps) {
  const [pngDataUrl, setPngDataUrl] = useState<string>('')
  const [svgString, setSvgString] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const [png, svg] = await Promise.all([
          generateQrPngDataUrl(value),
          generateQrSvgString(value)
        ])
        if (!mounted) return
        setPngDataUrl(png)
        setSvgString(svg)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to generate QR code')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [value])

  const handleDownloadPng = () => {
    if (pngDataUrl) downloadDataUrl(`${label || 'survey'}-qr.png`, pngDataUrl)
  }

  const handleDownloadSvg = () => {
    if (svgString) downloadSvg(`${label || 'survey'}-qr.svg`, svgString)
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="w-32 h-32 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="animate-pulse text-gray-500 text-sm">Generating...</div>
        ) : error ? (
          <div className="text-red-700 text-sm p-2 text-center">{error}</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pngDataUrl} alt="Survey QR" className="w-full h-full object-contain" />
        )}
      </div>
      <div className="flex space-x-2 items-center">
        <button
          onClick={handleDownloadPng}
          disabled={!pngDataUrl}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          PNG
        </button>
        <button
          onClick={handleDownloadSvg}
          disabled={!svgString}
          className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-200 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          SVG
        </button>
        {showCopy && (
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(value)
              } catch (_e) {}
            }}
            className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-200 border border-gray-200 text-sm"
            title="Copy survey link"
          >
            Copy Link
          </button>
        )}
      </div>
    </div>
  )
}


