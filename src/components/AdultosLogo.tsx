import React from "react"
import Image from "next/image"

interface AdultosLogoProps {
  className?: string
  showBorder?: boolean
  priority?: boolean
}

export default function AdultosLogo({ 
  className = "size-10", 
  showBorder = false,
  priority = false,
}: AdultosLogoProps) {
  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 select-none bg-[#B94E3B] ${showBorder ? 'border border-white/80 shadow-xs' : ''} ${className}`}
      title="Subibaja Adultos"
    >
      <Image
        src="/logo-adultos.jpg"
        alt="Subibaja Adultos"
        fill
        sizes="(max-width: 768px) 56px, 120px"
        className="object-cover scale-110 object-center"
        priority={priority}
      />
    </div>
  )
}

