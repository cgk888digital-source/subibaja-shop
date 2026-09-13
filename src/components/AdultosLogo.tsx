import React from "react"
import Image from "next/image"

interface AdultosLogoProps {
  className?: string
  showBorder?: boolean
  priority?: boolean
}

export default function AdultosLogo({ 
  className = "size-10", 
  showBorder = true,
  priority = true
}: AdultosLogoProps) {
  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 select-none ${showBorder ? 'border border-white/80 shadow-xs' : ''} ${className}`}
      style={{ backgroundColor: '#B94E3B' }}
      title="Subibaja Adultos"
    >
      <div className="relative w-[82%] h-[82%] flex items-center justify-center">
        {/* Logotipo fino oficial en blanco puro */}
        <Image
          src="/logo-fino.png"
          alt="Subibaja Adultos"
          fill
          priority={priority}
          className="object-contain filter brightness-0 invert"
        />
        {/* Texto ADULTOS a lo largo de la diagonal idéntico al logo de Instagram */}
        <span 
          className="absolute text-white font-black uppercase tracking-[0.24em] pointer-events-none select-none text-[6.5px] leading-none"
          style={{
            left: '20%',
            top: '56%',
            transform: 'rotate(-39deg)',
            transformOrigin: 'left top',
            textShadow: '0 0.5px 1px rgba(0,0,0,0.2)'
          }}
        >
          ADULTOS
        </span>
      </div>
    </div>
  )
}
