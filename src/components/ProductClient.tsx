"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { ChevronLeft, Heart, Ruler, Palette, AlignLeft, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import CartFloatingButton from "@/components/CartFloatingButton"
import Image from "next/image"
import { getColorName } from "@/lib/colors"

interface ProductClientProps {
  initialProduct: any
  initialCategories: any[]
  initialExchangeRate: number
}

export default function ProductClient({ initialProduct, initialCategories, initialExchangeRate }: ProductClientProps) {
  const router = useRouter()

  const [product, setProduct] = useState<any>(initialProduct)
  const [exchangeRate, setExchangeRate] = useState(initialExchangeRate)
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [justLiked, setJustLiked] = useState(false)
  const [categories, setCategories] = useState<any[]>(initialCategories)
  const [isAdded, setIsAdded] = useState(false)

  const getColorHex = (colorName: string) => {
    const normalized = colorName.toLowerCase().trim()
    
    if (normalized.startsWith('#')) return normalized

    if (normalized.includes('blanco') || normalized.includes('blanca')) return '#ffffff'
    if (normalized.includes('negro') || normalized.includes('negra')) return '#000000'
    if (normalized.includes('rojo') || normalized.includes('roja')) return '#ef4444'
    if (normalized.includes('azul')) return '#3b82f6'
    if (normalized.includes('verde')) return '#22c55e'
    if (normalized.includes('amarill')) return '#eab308'
    if (normalized.includes('naranj')) return '#f97316'
    if (normalized.includes('morad') || normalized.includes('purpura') || normalized.includes('púrpura')) return '#a855f7'
    if (normalized.includes('rosad') || normalized.includes('rosa')) return '#f472b6'
    if (normalized.includes('gris')) return '#64748b'
    if (normalized.includes('marron') || normalized.includes('marrón') || normalized.includes('cafe') || normalized.includes('café')) return '#8b5a2b'
    if (normalized.includes('beige')) return '#f5f5dc'
    if (normalized.includes('dorad') || normalized.includes('oro')) return '#eab308'
    if (normalized.includes('plat')) return '#cbd5e1'
    if (normalized.includes('celest')) return '#38bdf8'
    if (normalized.includes('fucsia')) return '#d946ef'
    if (normalized.includes('vino')) return '#7f1d1d'
    if (normalized.includes('lila') || normalized.includes('lavanda')) return '#c084fc'
    if (normalized.includes('hueso') || normalized.includes('crema') || normalized.includes('nude')) return '#fef3c7'

    return colorName 
  }

  useEffect(() => {
    const saved = localStorage.getItem("subibaja_favorites")
    if (saved) {
      try { setFavorites(JSON.parse(saved)) } catch (e) { console.error(e) }
    }
  }, [])

  const getParsedSizes = () => {
    if (!product) return []
    let list = product.sizes || []
    if (list.length === 1) {
      const raw = list[0]
      if (raw.includes(',') || raw.includes(' ')) {
        list = raw.split(/[\s,]+/).map((s: string) => s.trim()).filter(Boolean)
      }
    }
    if (list.length === 0 && product?.category?.toLowerCase().includes('zapatos')) {
      list = ['24', '26', '28']
    }
    return list
  }

  const getParsedColors = () => {
    if (!product) return []
    let list = product.colors || []
    if (list.length === 1) {
      const raw = list[0]
      if (raw.includes(',') || raw.includes(' ')) {
        list = raw.split(/[\s,]+/).map((c: string) => c.trim()).filter(Boolean)
      }
    }
    // Si tiene menos de 2 colores, agregamos colores ficticios para la demo
    if (list.length < 2) {
      let defaultMock = ['#ffffff', '#8dd5e3', '#FAD2E1'] // Blanco, Azul, Rosa
      const title = (product.title || '').toLowerCase()
      if (title.includes('silver') || title.includes('glitter')) {
        defaultMock = ['#E2E8F0', '#FFFFFF', '#BAE6FD'] // Plata, Blanco, Azul cielo
      } else if (title.includes('harmony') || title.includes('cintillo') || title.includes('floral')) {
        defaultMock = ['#FCE7F3', '#CCFBF1', '#FFFFFF'] // Rosa suave, Menta, Blanco
      } else if (title.includes('blanco') || title.includes('charol')) {
        defaultMock = ['#FFFFFF', '#0F172A', '#FECDD3'] // Blanco, Negro charol, Rosa pastel
      } else if (title.includes('gold') || title.includes('mariposa')) {
        defaultMock = ['#FEF08A', '#FDE2E4', '#E2E8F0'] // Oro, Oro rosa, Plata
      } else if (title.includes('beige')) {
        defaultMock = ['#F5F5DC', '#F1F5F9', '#FFFFFF'] // Beige, Crema/Nude, Blanco
      } else if (title.includes('gala') || title.includes('vestido')) {
        defaultMock = ['#FAD2E1', '#FFF5C3', '#E8E8FF'] // Rosa pastel, Amarillo pastel, Lavanda
      } else if (title.includes('sinderella')) {
        defaultMock = ['#8dd5e3', '#FFFFFF', '#FFCAD4'] // Azul Cenicienta, Blanco, Rosa suave
      }

      const extra = defaultMock.filter(c => !list.includes(c))
      list = [...list, ...extra].slice(0, 3)
    }
    return list
  }

  useEffect(() => {
    if (product) {
      const parsedSizes = getParsedSizes()
      const parsedColors = getParsedColors()
      if (parsedSizes.length > 0) setSelectedSize(parsedSizes[0])
      if (parsedColors.length > 0) setSelectedColor(parsedColors[0])
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

  const getActivePrice = () => {
    if (!product) return 0
    if (selectedSize && selectedColor && product.prices_by_size) {
      const keyWithColor = `${selectedSize}_${selectedColor.toLowerCase()}`
      if (product.prices_by_size[keyWithColor] !== undefined) {
        return Number(product.prices_by_size[keyWithColor])
      }
    }
    if (selectedSize && product.prices_by_size && product.prices_by_size[selectedSize] !== undefined) {
      return Number(product.prices_by_size[selectedSize])
    }
    return Number(product.price)
  }

  const getSizePrice = (size: string) => {
    if (!product) return 0
    if (size && selectedColor && product.prices_by_size) {
      const keyWithColor = `${size}_${selectedColor.toLowerCase()}`
      if (product.prices_by_size[keyWithColor] !== undefined) {
        return Number(product.prices_by_size[keyWithColor])
      }
    }
    if (size && product.prices_by_size && product.prices_by_size[size] !== undefined) {
      return Number(product.prices_by_size[size])
    }
    return Number(product.price)
  }

    const getStockForSelected = () => {
    if (!product) return 0
    if (product.stock_by_size) {
      if (selectedSize && selectedColor) {
        const keyWithColor = `${selectedSize}_${selectedColor.toLowerCase()}`
        if (product.stock_by_size[keyWithColor] !== undefined) {
          return Number(product.stock_by_size[keyWithColor])
        }
      }
      if (selectedSize && product.stock_by_size[selectedSize] !== undefined) {
        return Number(product.stock_by_size[selectedSize])
      }
    }
    return product.stock_quantity ?? 0
  }
  const isOutOfStock = product?.stock_status === 'out_of_stock' || getStockForSelected() <= 0

  const getPriceRange = () => {
    if (!product) return null
    const pricesSet = new Set<number>()
    pricesSet.add(Number(product.price))
    if (product.prices_by_size) {
      Object.keys(product.prices_by_size).forEach(key => {
        const val = Number(product.prices_by_size[key])
        if (!isNaN(val)) {
          pricesSet.add(val)
        }
      })
    }
    const pricesList = Array.from(pricesSet).sort((a, b) => a - b)
    if (pricesList.length <= 1) return null
    return {
      min: pricesList[0],
      max: pricesList[pricesList.length - 1]
    }
  }

  const handleOrder = () => {
    if (!product) return
    const activePrice = getActivePrice()
    const priceBs = (activePrice * exchangeRate).toFixed(0)
    const sizeText = selectedSize ? `\nTalla: ${selectedSize}` : ''
    const colorText = selectedColor ? `\nColor: ${getColorName(selectedColor)}` : ''
    
    // Obtener la URL absoluta de la imagen
    const imgUrl = product.image_url?.startsWith('http') 
      ? product.image_url 
      : `${window.location.origin}${product.image_url}`

    const msg = `¡Hola! Me interesa este producto:\n\n*${product.title}*\nPrecio: $${activePrice} (${priceBs} BCV)${sizeText}${colorText}\n\n🔗 Link del producto:\n${window.location.href}\n\n🖼️ Ver imagen:\n${imgUrl}\n\n¿Tienen disponibilidad?`
    window.open(`https://wa.me/584142274385?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleAddToCart = () => {
    if (!product) return
    const activePrice = getActivePrice()
    const cart = JSON.parse(localStorage.getItem('subibaja_cart') || '[]')
    const existingIndex = cart.findIndex((item: any) => 
      item.id === product.id && 
      item.size === selectedSize && 
      item.color === selectedColor
    )
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
      cart[existingIndex].price = activePrice
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: activePrice,
        image_url: product.image_url,
        size: selectedSize,
        color: selectedColor,
        quantity: 1
      })
    }
    localStorage.setItem('subibaja_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    
    // Feedback visual
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-blue-900 animate-spin"
          style={{ borderColor: '#8dd5e3', borderTopColor: '#1e3a5f' }}
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
            style={{ height: '24px', backgroundColor: '#8dd5e3' }}
          >
            VOLVER
          </button>
        </Link>
      </div>
    )
  }

  const getBreadcrumbs = () => {
    if (!product || !product.category_id || categories.length === 0) {
      return product?.category ? [product.category] : []
    }
    const path: string[] = []
    let curr = categories.find(c => c.id === product.category_id)
    while (curr) {
      path.unshift(curr.name)
      if (curr.parent_id) {
        curr = categories.find(c => c.id === curr.parent_id)
      } else {
        curr = null
      }
    }
    return path
  }

  const images: string[] = product.gallery_urls?.length > 0 ? [product.image_url, ...product.gallery_urls] : [product.image_url]
  const isFavorite = product ? favorites.includes(product.id) : false

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-[430px] md:max-w-6xl mx-auto relative md:px-6 md:py-8">

        {/* ── HEADER FLOTANTE CON GLASSMORPHISM ── */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-6xl z-30 px-4 pt-5 flex justify-between items-center pointer-events-none md:relative md:top-auto md:left-auto md:translate-x-0 md:px-0 md:mb-6 md:w-full">
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

        <div className="md:grid md:grid-cols-2 md:gap-16 md:items-start md:mt-4">
          {/* ── IMAGEN INMERSIVA: responsivo, 50vh en móvil, 600px en PC ── */}
          <section className="relative w-full h-[50vh] md:h-[600px] overflow-hidden bg-white border border-slate-100/60 md:rounded-3xl md:shadow-md">
            {product.badge === 'nuevo' && (
              <div className="absolute top-4 -left-10 w-32 bg-[#00ced1] text-white text-[10px] font-black tracking-widest py-1 text-center transform -rotate-45 z-20 shadow-sm pointer-events-none">
                NUEVO
              </div>
            )}
            {product.badge === 'top' && (
              <div className="absolute top-4 -left-10 w-32 bg-[#f44336] text-white text-[11px] font-black tracking-widest py-1 text-center transform -rotate-45 z-20 shadow-sm pointer-events-none">
                TOP
              </div>
            )}
            <Swiper
              pagination={{ clickable: true }}
              navigation={true}
              modules={[Pagination, Navigation]}
              className="w-full h-full"
              style={{
                // Custom colors for swiper pagination and navigation
                ['--swiper-navigation-color' as any]: '#1e3a5f',
                ['--swiper-navigation-size' as any]: '20px',
                ['--swiper-pagination-color' as any]: '#1e3a5f',
                ['--swiper-pagination-bullet-inactive-color' as any]: '#cbd5e1',
                ['--swiper-pagination-bullet-inactive-opacity' as any]: '0.6',
              }}
            >
              {images.map((img: string, i: number) => (
                <SwiperSlide key={i} className="relative">
                  <Image
                    src={img}
                    alt={product.title}
                    fill
                    priority={i < 2}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-4"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* ── PANEL DE CONTENIDO: sube 24px sobre la imagen en móvil, normal en PC ── */}
          <div className="relative -mt-6 md:-mt-0 z-10 bg-white rounded-t-3xl md:rounded-3xl px-6 pt-8 md:p-10 pb-36 md:pb-10 shadow-xl md:shadow-md border border-slate-100/50">

            {/* Badge stock + categoría */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-sm"
                style={{ backgroundColor: '#8dd5e3', color: '#1e3a5f' }}
              >
                {product.stock_status === 'in_stock' ? 'DISPONIBLE' : 'AGOTADO'}
              </span>
              {getBreadcrumbs().length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[280px] py-1">
                  {getBreadcrumbs().map((bc, idx, arr) => (
                    <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                      {idx > 0 && <span className="text-slate-300 text-[8px] font-black">/</span>}
                      <span className={`text-[9px] font-black uppercase tracking-widest ${idx === arr.length - 1 ? "text-blue-900" : "text-slate-300"}`}>
                        {bc}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── NOMBRE: serif, boutique ── */}
            <h1
              className="text-2xl font-bold text-gray-900 leading-snug mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {product.title}
            </h1>

            {/* ── PRECIO: text-4xl azul oscuro + BCV gris debajo ── */}
            <div className="flex flex-col mb-8">
              <span className="text-4xl font-black text-blue-900 leading-none font-['Poppins']">
                ${getActivePrice()}
              </span>
              <span className="text-sm text-slate-500 font-bold mt-1">
                Bs {(getActivePrice() * exchangeRate).toFixed(0)} BCV
              </span>
              {!isOutOfStock && getStockForSelected() > 0 && (
                <div className="mt-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-3 py-1 rounded-lg w-fit flex items-center gap-1.5 shadow-sm">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                  </span>
                  Quedan {getStockForSelected()} unidades
                </div>
              )}
              {(() => {
                const range = getPriceRange()
                if (range) {
                  return (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100/60 border border-slate-200/30 px-3 py-1.5 rounded-full w-fit">
                      <span>Precios desde ${range.min} hasta ${range.max} según la talla</span>
                    </div>
                  )
                }
                return null
              })()}
            </div>

            {/* ── ACORDEÓN DE COMPRA Y DETALLES: Tallas + Colores + Descripción + Cuidados ── */}
            <Accordion multiple defaultValue={["size"]}>
              {getParsedSizes().length > 0 && (
                <AccordionItem value="size">
                  <AccordionTrigger className="hover:no-underline py-3.5">
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center gap-2">
                        <Ruler className="size-3.5 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Tallas
                        </span>
                      </div>
                      {selectedSize && (
                        <span className="text-[9px] font-black text-blue-900 bg-[#8dd5e3]/40 border border-[#8dd5e3]/50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                          Talla {selectedSize}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="flex flex-wrap gap-2.5">
                      {getParsedSizes().map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-95 shadow-2xs cursor-pointer border min-w-12 h-14"
                          style={{
                            backgroundColor: selectedSize === size ? '#1e3a5f' : '#f8fafc',
                            color: selectedSize === size ? '#ffffff' : '#64748b',
                            borderColor: selectedSize === size ? '#1e3a5f' : '#e2e8f0',
                          }}
                        >
                          <span className="text-xs font-black">{size}</span>
                          <span className={`text-[8px] font-black mt-0.5 ${selectedSize === size ? 'text-[#8dd5e3]' : 'text-slate-400'}`}>
                            ${getSizePrice(size)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {getParsedColors().length > 0 && (
                <AccordionItem value="color">
                  <AccordionTrigger className="hover:no-underline py-3.5">
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center gap-2">
                        <Palette className="size-3.5 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Colores
                        </span>
                      </div>
                      {selectedColor && (
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                          <span
                            className="size-3.5 rounded-full border border-slate-200/60 shadow-2xs block animate-fade-in"
                            style={{ backgroundColor: getColorHex(selectedColor) }}
                          />
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            {selectedColor.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="flex flex-wrap gap-3">
                      {getParsedColors().map((color: string) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          title={color}
                          className={`size-8 rounded-full transition-all active:scale-90 cursor-pointer shadow-sm ${
                            selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-900' : 'border border-slate-200'
                          }`}
                          style={{
                            backgroundColor: getColorHex(color),
                          }}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {product.description && product.description.trim() && (
                <AccordionItem value="description">
                  <AccordionTrigger className="hover:no-underline py-3.5">
                    <div className="flex items-center gap-2">
                      <AlignLeft className="size-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Descripción
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 text-sm leading-relaxed pt-2 pb-4">
                    {product.description}
                  </AccordionContent>
                </AccordionItem>
              )}


            </Accordion>

            {/* ── BOTÓN CÁPSULA FLOTANTE PREMIUM: fijo en móvil, relativo adentro del card en PC ── */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-none z-30 px-6 flex gap-3 justify-center md:relative md:bottom-auto md:left-auto md:translate-x-0 md:px-0 md:mt-8 md:shadow-none md:z-10 animate-fade-in">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_status !== 'in_stock'}
                className="flex-1 rounded-full text-[9px] font-black tracking-[0.1em] text-slate-700 bg-white border border-slate-200 transition-all active:scale-95 disabled:opacity-40 shadow-xl md:shadow-sm cursor-pointer h-[38px] md:h-12"
              >
                {isAdded ? '¡AÑADIDO!' : 'AÑADIR AL CARRITO'}
              </button>
              <button
                onClick={handleOrder}
                disabled={product.stock_status !== 'in_stock'}
                className="flex-1 rounded-full text-[9px] font-black tracking-[0.1em] text-blue-900 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl md:shadow-sm border border-white/20 cursor-pointer h-[38px] md:h-12"
                style={{ 
                  backgroundColor: 'rgba(141, 213, 227, 0.9)', 
                  backdropFilter: 'blur(8px)', 
                  WebkitBackdropFilter: 'blur(8px)' 
                }}
              >
                {product.stock_status === 'in_stock' ? 'COMPRAR AHORA' : 'AGOTADO'}
              </button>
            </div>

          </div>
        </div>

        {/* Carrito Flotante */}
        <CartFloatingButton />

      </div>
    </div>
  )
}
