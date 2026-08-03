"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation, Keyboard } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { ChevronLeft, Ruler, ShoppingBag, MessageCircle, Sparkles, CheckCircle2, ArrowRight, Info, X } from "lucide-react"
import CartFloatingButton from "@/components/CartFloatingButton"
import { TALLA_SLIDES } from "@/components/SizeGuideModal"

export default function TallasPage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const [zoomImage, setZoomImage] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-slate-50 font-['Lato',sans-serif] pb-24">
      {/* ── HEADER DE NAVEGACIÓN ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-md md:max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all text-xs font-bold"
          >
            <ChevronLeft className="size-5 text-blue-900" />
            <span>Volver</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#8dd5e3]/20 text-blue-900">
              <Ruler className="size-4" />
            </div>
            <h1 className="text-sm font-black tracking-tight font-['Poppins'] text-blue-900 uppercase">
              Guía de Tallas
            </h1>
          </div>

          <a 
            href="https://wa.me/584142274385?text=%C2%A1Hola!%20Necesito%20ayuda%20para%20elegir%20la%20talla%20de%20zapato."
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all"
            title="Ayuda por WhatsApp"
          >
            <MessageCircle className="size-5" />
          </a>
        </div>
      </header>

      {/* ── SECCIÓN HÉROE / BANNER ── */}
      <main className="max-w-md md:max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#8dd5e3]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-start gap-2">
            <span className="bg-[#8dd5e3] text-blue-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="size-3" /> TUTORIAL INTERACTIVO
            </span>
            <h2 className="text-xl md:text-2xl font-black font-['Poppins'] text-white tracking-tight leading-tight mt-1">
              ¿Cómo medir la talla del pie para zapatos?
            </h2>
            <p className="text-xs text-slate-300 font-normal leading-relaxed max-w-lg">
              Sigue nuestra guía ilustrada de 10 imágenes explicativas paso a paso para asegurarte de pedir el calzado perfecto sin errores de talla.
            </p>
          </div>
        </div>

        {/* ── CARRUSEL PRINCIPAL DE 10 IMÁGENES (FORMATO VERTICAL AMPLIO / REEL) ── */}
        <section className="bg-white rounded-3xl p-3 md:p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-blue-900 uppercase tracking-wider font-['Poppins']">
                Paso {activeSlide + 1} de {TALLA_SLIDES.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-blue-900 bg-[#8dd5e3]/30 px-2.5 py-1 rounded-full">
                {TALLA_SLIDES[activeSlide]?.badge}
              </span>
              <button 
                onClick={() => setZoomImage(TALLA_SLIDES[activeSlide]?.image || null)}
                className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                title="Ampliar imagen"
              >
                🔍 Agrandar
              </button>
            </div>
          </div>

          {/* Marco ampliado estilo Reel/Hoja completa */}
          <div className="relative bg-[#0b132b] rounded-2xl overflow-hidden flex items-center justify-center h-[70vh] min-h-[520px] max-h-[720px] md:min-h-[680px]">
            <Swiper
              modules={[Pagination, Navigation, Keyboard]}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation={true}
              keyboard={{ enabled: true }}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
              className="w-full h-full"
              style={{
                ['--swiper-navigation-color' as any]: '#8dd5e3',
                ['--swiper-navigation-size' as any]: '32px',
                ['--swiper-pagination-color' as any]: '#8dd5e3',
                ['--swiper-pagination-bullet-inactive-color' as any]: '#ffffff',
                ['--swiper-pagination-bullet-inactive-opacity' as any]: '0.4',
              }}
            >
              {TALLA_SLIDES.map((slide) => (
                <SwiperSlide key={slide.id} className="flex items-center justify-center p-1 md:p-3">
                  <div 
                    onClick={() => setZoomImage(slide.image)}
                    className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
                  >
                    <Image 
                      src={slide.image} 
                      alt={slide.title}
                      fill
                      className="object-contain drop-shadow-2xl rounded-lg"
                      priority={slide.id <= 2}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Información del slide actual */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black text-blue-900 font-['Poppins']">
                {TALLA_SLIDES[activeSlide]?.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {TALLA_SLIDES[activeSlide]?.subtitle}
              </p>
            </div>

            <button
              onClick={() => setZoomImage(TALLA_SLIDES[activeSlide]?.image || null)}
              className="flex-shrink-0 px-3 py-2 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs hover:bg-blue-800 transition-all flex items-center gap-1 cursor-pointer"
            >
              🔍 Ver Grande
            </button>
          </div>

          {/* Miniaturas de selección directa */}
          <div className="flex overflow-x-auto gap-2 py-2 no-scrollbar">
            {TALLA_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => swiperInstance?.slideTo(idx)}
                className={`relative flex-shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                  activeSlide === idx ? 'border-blue-900 scale-105 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >                }`}
              >

                <Image 
                  src={slide.image} 
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-0.5">
                  <span className="text-[9px] font-black text-white bg-slate-900/80 px-1 rounded">
                    {idx + 1}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── RESUMEN DE PASOS CLAVE ── */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest font-['Poppins'] flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Resumen de Medición en 3 Pasos
          </h3>

          <div className="space-y-3">
            <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="flex-shrink-0 size-7 rounded-full bg-blue-900 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Dibuja el contorno del pie</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Coloca el pie descalzo bien apoyado sobre una hoja de papel pegada al piso. Con un lápiz en ángulo de 90°, marca el talón y la punta del dedo más largo.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="flex-shrink-0 size-7 rounded-full bg-blue-900 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Mide la distancia y suma 0.5 cm</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Usa una regla recta para medir la distancia en cm desde la marca del talón hasta el dedo más largo. Añade **0.5 cm** para garantizar comodidad.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="flex-shrink-0 size-7 rounded-full bg-blue-900 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Compara con las tablas de tallas</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Consulta las diapositivas 8, 9 y 10 para ubicar los centímetros en las edades correspondientes (1-2 años, 3-6 años y 11+ años).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTONES DE ACCIÓN ── */}
        <section className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-4 px-6 rounded-2xl bg-blue-900 text-white text-xs font-black tracking-wider uppercase text-center shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="size-4" />
            <span>Explorar Catálogo de Calzado</span>
            <ArrowRight className="size-4" />
          </Link>

          <a
            href="https://wa.me/584142274385?text=%C2%A1Hola!%20Tengo%20una%20duda%20sobre%20las%20tallas%20de%20zapatos."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-2xl text-white text-xs font-bold tracking-wider uppercase text-center shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle className="size-4" />
            <span>Asesoría Personalizada por WhatsApp</span>
          </a>
        </section>
      </main>

      <CartFloatingButton />

      {/* ── MODAL LIGHTBOX PANTALLA COMPLETA ── */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 animate-fade-in cursor-zoom-out"
        >
          <button 
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 z-50 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all cursor-pointer shadow-lg"
            aria-label="Cerrar vista ampliada"
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
