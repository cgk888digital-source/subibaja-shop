"use client"
import { useState } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation, Keyboard } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { X, ChevronLeft, ChevronRight, Ruler, Sparkles, ShoppingBag, MessageCircle } from "lucide-react"
import Link from "next/link"

export const TALLA_SLIDES = [
  {
    id: 1,
    title: "¿Quieres saber tu talla?",
    subtitle: "Aprende a medir la talla del pie paso a paso",
    image: "/tallas/01-intro-talla.png",
    badge: "Inicio"
  },
  {
    id: 2,
    title: "¿Cómo saber la medida del pie?",
    subtitle: "Guía rápida para calcular la talla correcta",
    image: "/tallas/02-medida-pie.png",
    badge: "Info"
  },
  {
    id: 3,
    title: "¿Qué necesitas?",
    subtitle: "Hoja de papel, lápiz y una regla",
    image: "/tallas/03-que-necesitas.png",
    badge: "Materiales"
  },
  {
    id: 4,
    title: "Paso 1",
    subtitle: "Coloca el pie sobre la hoja y marca el talón y punta",
    image: "/tallas/04-paso-1.png",
    badge: "Paso 1"
  },
  {
    id: 5,
    title: "Paso 2",
    subtitle: "Mide la distancia en centímetros de extremo a extremo",
    image: "/tallas/05-paso-2.png",
    badge: "Paso 2"
  },
  {
    id: 6,
    title: "Paso 3",
    subtitle: "Suma 0.5 cm de margen de holgura y comodidad",
    image: "/tallas/06-paso-3.png",
    badge: "Paso 3"
  },
  {
    id: 7,
    title: "Tips importantes",
    subtitle: "Recomendaciones clave para un ajuste perfecto",
    image: "/tallas/07-tips.png",
    badge: "Consejos"
  },
  {
    id: 8,
    title: "Tabla de Tallas (1 - 2 años)",
    subtitle: "Equivalencia en cm para los más pequeños",
    image: "/tallas/08-tallas-1-2-anos.png",
    badge: "1-2 Años"
  },
  {
    id: 9,
    title: "Tabla de Tallas (3 - 6 años)",
    subtitle: "Equivalencia en cm para pre-escolares y escolares",
    image: "/tallas/09-tallas-3-6-anos.png",
    badge: "3-6 Años"
  },
  {
    id: 10,
    title: "Tabla de Tallas (11+ años)",
    subtitle: "Equivalencia en cm para juveniles y más",
    image: "/tallas/10-tallas-11-mas-anos.png",
    badge: "11+ Años"
  }
]

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [zoomImage, setZoomImage] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in font-['Lato',sans-serif]">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] border border-slate-100">
        
        {/* Encabezado modal */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-[#8dd5e3]/20 border border-[#8dd5e3]/30 text-[#8dd5e3]">
              <Ruler className="size-4" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-black tracking-tight font-['Poppins'] text-white uppercase flex items-center gap-1.5">
                Guía de Tallas
                <span className="bg-[#8dd5e3] text-blue-950 text-[9px] font-black px-2 py-0.5 rounded-full">
                  10 Pasos
                </span>
              </h3>
              <p className="text-[10px] text-slate-300 font-medium truncate max-w-[200px]">
                {activeSlide + 1}/10: {TALLA_SLIDES[activeSlide]?.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setZoomImage(TALLA_SLIDES[activeSlide]?.image || null)}
              className="text-[9px] font-black uppercase text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer"
            >
              🔍 Agrandar
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Carrusel de Imágenes (Alto extendido para visualización completa de la hoja/reel) */}
        <div className="relative flex-1 bg-[#0b132b] flex items-center justify-center h-[65vh] min-h-[460px] md:min-h-[600px] overflow-hidden">
          <Swiper
            modules={[Pagination, Navigation, Keyboard]}
            pagination={{ 
              clickable: true,
              dynamicBullets: true
            }}
            navigation={true}
            keyboard={{ enabled: true }}
            onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
            className="w-full h-full size-guide-swiper"
            style={{
              ['--swiper-navigation-color' as any]: '#8dd5e3',
              ['--swiper-navigation-size' as any]: '28px',
              ['--swiper-pagination-color' as any]: '#8dd5e3',
              ['--swiper-pagination-bullet-inactive-color' as any]: '#ffffff',
              ['--swiper-pagination-bullet-inactive-opacity' as any]: '0.4',
            }}
          >
            {TALLA_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id} className="flex items-center justify-center p-1 md:p-2">
                <div 
                  onClick={() => setZoomImage(slide.image)}
                  className="relative w-full h-full flex flex-col items-center justify-center cursor-zoom-in"
                >
                  <div className="relative w-full h-[62vh] min-h-[440px] md:h-[580px] flex items-center justify-center">
                    <Image 
                      src={slide.image} 
                      alt={slide.title}
                      fill
                      className="object-contain drop-shadow-2xl rounded-lg"
                      priority={slide.id <= 2}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Footer del Modal con información y botones de acción */}
        <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2.5 flex-shrink-0">
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-900 bg-[#8dd5e3]/30 px-2 py-0.5 rounded-md flex-shrink-0">
                {TALLA_SLIDES[activeSlide]?.badge}
              </span>
              <span className="text-xs font-bold text-slate-700 truncate">
                {TALLA_SLIDES[activeSlide]?.subtitle}
              </span>
            </div>
            <button
              onClick={() => setZoomImage(TALLA_SLIDES[activeSlide]?.image || null)}
              className="text-[9px] font-black uppercase text-blue-900 bg-[#8dd5e3] px-2.5 py-1 rounded-md transition-all flex-shrink-0 cursor-pointer"
            >
              🔍 Ver Grande
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link 
              href="/producto"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 text-center"
            >
              <ShoppingBag className="size-3.5 text-blue-900" />
              <span>Ver Calzado</span>
            </Link>

            <a 
              href="https://wa.me/584142274385?text=%C2%A1Hola!%20Tengo%20una%20duda%20sobre%20las%20tallas%20de%20los%20zapatos."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-white text-xs font-bold transition-all active:scale-95 shadow-md text-center"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="size-3.5" />
              <span>Duda WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      {/* Lightbox zoom */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 animate-fade-in cursor-zoom-out"
        >
          <button 
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 z-50 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all cursor-pointer shadow-lg"
          >
            <X className="size-6" />
          </button>
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            <Image 
              src={zoomImage} 
              alt="Guía ampliada"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}

