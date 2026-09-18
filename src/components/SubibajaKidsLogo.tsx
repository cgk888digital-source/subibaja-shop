import React from "react"

interface SubibajaKidsLogoProps {
  className?: string
  showBorder?: boolean
  priority?: boolean
}

// Logo oficial de Subibaja (Niños) con fondo azul original y letras en blanco fuerte y nítido
export default function SubibajaKidsLogo({ 
  className = "size-10", 
  showBorder = false,
}: SubibajaKidsLogoProps) {
  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 select-none ${showBorder ? 'border border-white/80 shadow-xs' : ''} ${className}`}
      title="Subibaja"
    >
      <svg 
        viewBox="0 0 140 140" 
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo del mismo azul oficial de Subibaja como estaba antes */}
        <circle cx="70" cy="70" r="70" fill="#82CDDC" />
        
        {/* Letras Subibaja en blanco fuerte, grueso y nítido para que se lea perfecto como el grande */}
        <g style={{ mixBlendMode: "screen" }}>
          {/* Capa base central con drop-shadow blanco para engrosar el trazo */}
          <image 
            href="/logo-fino.png" 
            x="13" 
            y="13" 
            width="114" 
            height="114" 
            style={{ filter: "invert(1) drop-shadow(0 0 1.2px #ffffff)" }}
          />
          {/* Refuerzo horizontal y vertical para dar cuerpo y grosor al trazo blanco */}
          <image 
            href="/logo-fino.png" 
            x="12.4" 
            y="13" 
            width="114" 
            height="114" 
            style={{ filter: "invert(1)" }}
          />
          <image 
            href="/logo-fino.png" 
            x="13.6" 
            y="13" 
            width="114" 
            height="114" 
            style={{ filter: "invert(1)" }}
          />
          <image 
            href="/logo-fino.png" 
            x="13" 
            y="12.4" 
            width="114" 
            height="114" 
            style={{ filter: "invert(1)" }}
          />
          <image 
            href="/logo-fino.png" 
            x="13" 
            y="13.6" 
            width="114" 
            height="114" 
            style={{ filter: "invert(1)" }}
          />
        </g>
      </svg>
    </div>
  )
}
