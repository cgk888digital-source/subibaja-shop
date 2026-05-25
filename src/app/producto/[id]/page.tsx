"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import { ChevronLeft, Heart, Ruler, Palette, AlignLeft, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [product, setProduct] = useState<any>(null)
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [justLiked, setJustLiked] = useState(false)

  useEffect(() => { if (id) fetchData() }, [id])

  useEffect(() => {
    const saved = localStorage.getItem("subibaja_favorites")
    if (saved) {
      try { setFavorites(JSON.parse(saved)) } catch (e) { console.error(e) }
    }
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const { data: settings } = await supabase.from('settings').select('*').eq('id', 'exchange_rate').single()
      if (settings) setExchangeRate(settings.value)
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) setProduct(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0])
      if (product.colors?.length > 0) setSelectedColor(product.colors[0])
    }
  }, [product])

  const toggleFavorite = () => {
    if (!product) return
    setFavorites(prev => {
      const isFav = prev.includes(product.id)
      const next = isFav ? prev.filter(f => f !== product.id) : [...prev, product.id]
      localStorage.setItem("subibaja_favorites", JSON.stringify(next))
      if (!isFav) {
        setJustLiked(true)
        setTimeout(() => setJustLiked(false), 500)
      }
      return next
    })
  }

  const handleOrder = () => {
    if (!product) return
    const priceBs = (product.price * exchangeRate).toFixed(0)
    const sizeText = selectedSize ? `\nTalla: ${selectedSize}` : ''
    const colorText = selectedColor ? `\nColor: ${selectedColor}` : ''
    const msg = `¡Hola! Me interesa este producto:\n\n*${product.title}*\nPrecio: $${product.price} (${priceBs} Bs)${sizeText}${colorText}\n\n¿Tienen disponibilidad?`
    window.open(`https://wa.me/584141234567?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-blue-900 animate-spin"
          style={{ borderColor: '#BDE0FE', borderTopColor: '#1e3a5f' }}
        />
      </div>
    )
  }

  // ── NOT FOUND ──
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 p-8 text-center">
        <Info className="size-10 text-gray-300" />
        <p className="text-gray-500 text-sm font-medium">Producto no encontrado</p>
        <Link href="/">
          <button
            className="rounded-full text-[9px] font-bold tracking-widest text-blue-900 px-8 transition-transform active:scale-95"
            style={{ height: '24px', backgroundColor: '#BDE0FE' }}
          >
            VOLVER
          </button>
        </Link>
      </div>
    )
  }

  const images: string[] = product.gallery_urls?.length > 0 ? product.gallery_urls : [product.image_url]
  const isFavorite = product ? favorites.includes(product.id) : false

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[430px] mx-auto relative">

        {/* ── HEADER FLOTANTE CON GLASSMORPHISM ── */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 px-4 pt-5 flex justify-between items-center pointer-events-none">
          <button
            onClick={() => router.back()}
            className="pointer-events-auto p-2.5 bg-white/75 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm transition-all active:scale-90"
          >
            <ChevronLeft className="size-5 text-gray-800" />
          </button>
          <button 
            onClick={toggleFavorite}
            className={`pointer-events-auto p-2.5 bg-white/75 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm transition-all active:scale-110 ${
              isFavorite ? 'text-rose-500' : 'text-gray-300'
            } ${justLiked ? 'animate-heartbeat' : ''}`}
          >
            <Heart className={`size-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* ── IMAGEN INMERSIVA: 50vh, bleed-edge sin márgenes ── */}
        <section className="relative w-full overflow-hidden bg-slate-100" style={{ height: '50vh' }}>
          <Swiper
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="w-full h-full"
          >
            {images.map((img: string, i: number) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* ── PANEL DE CONTENIDO: sube 24px sobre la imagen ── */}
        <div className="relative -mt-6 z-10 bg-white rounded-t-3xl px-6 pt-8 pb-36 shadow-xl">

          {/* Badge stock + categoría */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-sm"
              style={{ backgroundColor: '#BDE0FE', color: '#1e3a5f' }}
            >
              {product.stock_status === 'in_stock' ? 'DISPONIBLE' : 'AGOTADO'}
            </span>
            {product.category && (
              <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                {product.category}
              </span>
            )}
          </div>

          {/* ── NOMBRE: serif, boutique ── */}
          <h1
            className="text-2xl font-bold text-gray-900 leading-snug mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {product.title}
          </h1>

          {/* ── PRECIO: text-4xl azul oscuro + Bs gris debajo ── */}
          <div className="flex flex-col mb-8">
            <span className="text-4xl font-black text-blue-900 leading-none">
              ${product.price}
            </span>
            <span className="text-sm text-gray-400 font-medium mt-1">
              {(product.price * exchangeRate).toFixed(0)} Bs
            </span>
          </div>

          {/* ── TALLAS: chips pequeños ── */}
          {product.sizes?.length > 0 && (
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="size-3.5 text-gray-300" />
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Talla</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="px-4 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
                    style={{
                      height: '30px',
                      backgroundColor: selectedSize === size ? '#BDE0FE' : '#f8fafc',
                      color: selectedSize === size ? '#1e3a5f' : '#94a3b8',
                      border: `1.5px solid ${selectedSize === size ? '#93c5fd' : '#e2e8f0'}`,
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── COLORES: swatches circulares ── */}
          {product.colors?.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="size-3.5 text-gray-300" />
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Color</span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className="w-8 h-8 rounded-full transition-all active:scale-95 shadow-sm"
                    style={{
                      backgroundColor: color,
                      outline: `2px solid ${selectedColor === color ? '#93c5fd' : 'transparent'}`,
                      outlineOffset: '3px',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* divisor */}
          <div className="h-px bg-slate-100 mb-4" />

          {/* ── ACORDEÓN: Descripción + Cuidados ── */}
          <Accordion>
            <AccordionItem value="description">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlignLeft className="size-3.5 text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Descripción
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 text-sm leading-relaxed">
                {product.description || "Diseñado para brindar la mayor comodidad y estilo a los más pequeños."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlignLeft className="size-3.5 text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Cuidados
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 text-sm leading-relaxed">
                {product.care_instructions || "Lavar a mano con agua fría. No usar blanqueador. Planchar a temperatura baja."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>

        {/* ── BOTÓN CÁPSULA FLOTANTE PREMIUM ── */}
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50">
          <button
            onClick={handleOrder}
            disabled={product.stock_status !== 'in_stock'}
            className="rounded-full text-[10px] font-black tracking-[0.15em] text-blue-900 px-12 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl border border-white/20"
            style={{ 
              height: '38px', 
              backgroundColor: 'rgba(189, 224, 254, 0.9)', 
              backdropFilter: 'blur(8px)', 
              WebkitBackdropFilter: 'blur(8px)' 
            }}
          >
            {product.stock_status === 'in_stock' ? 'LO QUIERO' : 'AGOTADO'}
          </button>
        </div>

      </div>
    </div>
  )
}
