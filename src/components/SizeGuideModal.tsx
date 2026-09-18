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
    subtitle: "Te presentamos nuestra guía de tallas oficial",
    image: "/tallas/guia-talla-1.jpeg",
    badge: "Inicio"
  },
  {
    id: 2,
    title: "De 0 a 12 meses",
    subtitle: "Tallas EU 16 a 19 | Americana 0.5 a 4 | 9.5 a 11.3 cm",
    image: "/tallas/guia-talla-2.jpeg",
    badge: "0-12 Meses"
  },
  {
    id: 3,
    title: "De 12 a 24 meses",
    subtitle: "Tallas EU 20 a 23 | Americana 4.5 a 7 | 12 a 13.9 cm",
    image: "/tallas/guia-talla-3.jpeg",
    badge: "12-24 Meses"
  },
  {
    id: 4,
    title: "De 2 a 4 años",
    subtitle: "Tallas EU 24 a 30 | Americana 7.5 a 12.5 | 14.6 a 18.5 cm",
    image: "/tallas/guia-talla-4.jpeg",
    badge: "2-4 Años"
  },
  {
    id: 5,
    title: "De 4 a 8 años",
    subtitle: "Tallas EU 31 a 34 | Americana 13 a 3 | 19.2 a 21.3 cm",
    image: "/tallas/guia-talla-5.jpeg",
    badge: "4-8 Años"
  },
  {
    id: 6,
    title: "De 8 años en adelante",
    subtitle: "Tallas EU 35 a 40 | Americana 3.5 a 7.5 | 22 a 25.5 cm",
    image: "/tallas/guia-talla-6.jpeg",
    badge: "8+ Años"
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
                  {TALLA_SLIDES.length} Guías
                </span>
              </h3>
              <p className="text-[10px] text-slate-300 font-medium truncate max-w-[200px]">
                {activeSlide + 1}/{TALLA_SLIDES.length}: {TALLA_SLIDES[activeSlide]?.title}
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

