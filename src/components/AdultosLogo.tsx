"use client"
import React, { useEffect, useState } from "react"

interface AdultosLogoProps {
  className?: string
  showBorder?: boolean
  priority?: boolean
}

let cachedLogoUrl: string | null = null
let isProcessing = false
const callbacks: Array<(url: string) => void> = []

function processOfficialLogo(onReady: (url: string) => void) {
  if (cachedLogoUrl) {
    onReady(cachedLogoUrl)
    return
  }
  callbacks.push(onReady)
  if (isProcessing) return
  isProcessing = true

  const img = new window.Image()
  img.crossOrigin = "anonymous"
  img.src = "/logo-adultos.jpg"
  img.onload = () => {
    try {
      const w = img.naturalWidth || img.width
      const h = img.naturalHeight || img.height

      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = w
      tempCanvas.height = h
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      tempCtx.drawImage(img, 0, 0)
      const imgData = tempCtx.getImageData(0, 0, w, h)
      const data = imgData.data

      // Detectar el círculo terracota en la imagen
      let minX = w, maxX = 0, minY = h, maxY = 0
      let sumR = 0, sumG = 0, sumB = 0, count = 0

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          const isWhite = r > 220 && g > 220 && b > 220
          const isTerracotta = r > 140 && r < 235 && g > 40 && g < 115 && b > 30 && b < 105

          if (isTerracotta && !isWhite) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
            sumR += r
            sumG += g
            sumB += b
            count++
          }
        }
      }

      const avgR = count > 0 ? Math.round(sumR / count) : 185
      const avgG = count > 0 ? Math.round(sumG / count) : 78
      const avgB = count > 0 ? Math.round(sumB / count) : 59
      const terracottaColor = `rgb(${avgR}, ${avgG}, ${avgB})`

      const circleW = maxX - minX
      const circleH = maxY - minY
      const circleD = Math.max(circleW, circleH)
      const cx = minX + circleW / 2
      const cy = minY + circleH / 2
      const circleRadius = circleD / 2

      // Crear canvas final de alta resolución (280x280)
      const outSize = 280
      const outCanvas = document.createElement("canvas")
      outCanvas.width = outSize
      outCanvas.height = outSize
      const ctx = outCanvas.getContext("2d")
      if (!ctx) return

      const center = outSize / 2
      const outRadius = outSize / 2

      // 1. Círculo exterior completo terracota (sin bordes blancos jamás)
      ctx.beginPath()
      ctx.arc(center, center, outRadius, 0, Math.PI * 2)
      ctx.fillStyle = terracottaColor
      ctx.fill()

      // 2. Darle margen holgado al logo para que la 'S' arriba y la 'j' abajo no peguen en el borde
      // Escalamos el contenido interior al 82% del círculo
      const contentRadius = outRadius * 0.82

      ctx.save()
      ctx.beginPath()
      // Recorte estricto dentro del radio de contenido para eliminar cualquier píxel blanco externo
      ctx.arc(center, center, contentRadius - 1.5, 0, Math.PI * 2)
      ctx.clip()

      // Dibujar el arte original centrado
      ctx.drawImage(
        tempCanvas,
        cx - circleRadius, cy - circleRadius, circleD, circleD,
        center - contentRadius, center - contentRadius, contentRadius * 2, contentRadius * 2
      )
      ctx.restore()

      cachedLogoUrl = outCanvas.toDataURL("image/png")
      callbacks.forEach(cb => cb(cachedLogoUrl!))
      callbacks.length = 0
    } catch (e) {
      console.warn("Logo processor error:", e)
    }
  }
}

export default function AdultosLogo({ 
  className = "size-10", 
  showBorder = false,
}: AdultosLogoProps) {
  const [logoSrc, setLogoSrc] = useState<string | null>(cachedLogoUrl)

  useEffect(() => {
    processOfficialLogo((url) => {
      setLogoSrc(url)
    })
  }, [])

  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 select-none bg-[#B94E3B] ${showBorder ? 'border border-white/80 shadow-xs' : ''} ${className}`}
      title="Subibaja Adultos"
    >
      {logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt="Subibaja Adultos"
          className="w-full h-full object-cover rounded-full select-none pointer-events-none block"
        />
      ) : (
        <div className="w-full h-full bg-[#B94E3B] rounded-full" />
      )}
    </div>
  )
}
