import React from "react"

interface AdultosLogoProps {
  className?: string
  showBorder?: boolean
  priority?: boolean
}

export default function AdultosLogo({ 
  className = "size-10", 
  showBorder = false,
}: AdultosLogoProps) {
  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 select-none ${showBorder ? 'border border-white/80 shadow-xs' : ''} ${className}`}
      title="Subibaja Adultos"
    >
      <svg 
        viewBox="0 0 140 140" 
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo Terracota Oficial de Subibaja Adultos */}
        <circle cx="70" cy="70" r="70" fill="#B94E3B" />
        
        {/* Logotipo Subibaja en trazo blanco puro sin fondos cuadrados */}
        <g style={{ mixBlendMode: "screen" }}>
          <image 
            href="/logo-fino.png" 
            x="8" 
            y="8" 
            width="124" 
            height="124" 
            style={{ filter: "invert(1)" }}
          />
        </g>
        
        {/* Texto ADULTOS a lo largo de la diagonal idéntico al logo original de Instagram */}
        <g transform="translate(24, 96) rotate(-38.5)">
          <text 
            x="0" 
            y="0" 
            fill="#ffffff" 
            fontFamily="-apple-system, BlinkMacSystemFont, 'Montserrat', 'Poppins', sans-serif" 
            fontSize="6.8" 
            fontWeight="600" 
            letterSpacing="3.2"
          >
            ADULTOS
          </text>
        </g>
      </svg>
    </div>
  )
}
