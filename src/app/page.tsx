"use client"
import { useState, useEffect } from "react"
import { ShoppingCart, Heart, Home as HomeIcon, LayoutGrid as GridIcon, User, Loader2, LayoutGrid, Footprints, Shirt, Star, ShoppingBag, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2 } from "lucide-react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const CAT_ICONS: Record<string, React.ElementType> = {
  Footprints, Shirt, Star, ShoppingBag, Heart, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const { data: settings } = await supabase.from('settings').select('*').eq('id', 'exchange_rate').single()
      if (settings) setExchangeRate(settings.value)
      const { data: prods } = await supabase.from('products').select('*').eq('stock_status', 'in_stock').order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
      if (cats) setCategories(cats)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filteredProducts = activeCategory === "Todos"
    ? products
    : products.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── CONTENEDOR MAESTRO: todo vive aquí, 430px centrado ── */}
      <div className="max-w-[430px] mx-auto flex flex-col min-h-screen pb-24 font-['Lato',sans-serif]">

        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-50">
          <div className="w-full px-5 h-16 flex items-center justify-between">
            <Image
              src="/Logo.jpg.jpeg"
              alt="Subibaja"
              width={44}
              height={44}
              className="rounded-full object-cover"
              priority
            />
            <div className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#BDE0FE40' }}>
              <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest">Tasa: {exchangeRate} Bs</p>
            </div>
          </div>
        </header>

        <main className="flex-1">

          {/* Hero Carousel */}
          <section className="w-full aspect-[16/10] bg-gray-50 overflow-hidden">
            <Swiper pagination={{ clickable: true }} autoplay={{ delay: 5000 }} modules={[Pagination, Autoplay]} className="w-full h-full">
              <SwiperSlide>
                <div className="relative w-full h-full">
                  <img
                    src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=100&w=1200"
                    className="w-full h-full object-cover"
                    alt="Nuevos Ingresos"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent flex flex-col justify-end p-8 pb-12 text-center items-center">
                    <h2 className="text-3xl font-black text-white leading-tight font-['Poppins'] tracking-tighter">Nuevos Ingresos</h2>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </section>

          <div className="px-4 mt-8">

            {/* Categorías */}
            <h3 className="font-black text-gray-900 text-2xl font-['Poppins'] mb-4 tracking-tight">Categorías</h3>
            <div className="flex overflow-x-auto gap-2.5 pb-6 no-scrollbar">
              {/* Todos — siempre primero */}
              <button
                onClick={() => setActiveCategory("Todos")}
                className={`h-7 px-4 rounded-full whitespace-nowrap text-[11px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  activeCategory === "Todos" ? 'text-blue-900' : 'bg-white text-gray-400 shadow-sm'
                }`}
                style={activeCategory === "Todos" ? { backgroundColor: '#BDE0FE' } : {}}
              >
                <LayoutGrid className="size-3" />
                <span>Todos</span>
              </button>
              {categories.map((cat) => {
                const IconComp = CAT_ICONS[cat.icon] || Tag
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`h-7 px-4 rounded-full whitespace-nowrap text-[11px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      activeCategory === cat.name ? 'text-blue-900' : 'bg-white text-gray-400 shadow-sm'
                    }`}
                    style={activeCategory === cat.name ? { backgroundColor: '#BDE0FE' } : {}}
                  >
                    <IconComp className="size-3" />
                    <span>{cat.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Grid de Productos */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin" style={{ color: '#BDE0FE' }} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col group"
                  >
                    {/* ── IMAGEN: full-bleed, aspect-square, sin padding, bordes superiores heredados ── */}
                    <div className="relative aspect-square overflow-hidden">
                      <Link href={`/producto/${product.id}`} className="block w-full h-full">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </Link>
                      <button className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full shadow-sm text-gray-300">
                        <Heart className="size-3.5" />
                      </button>
                    </div>

                    {/* ── TEXTOS + BOTÓN: px-4 fondo blanco ── */}
                    <div className="flex flex-col items-center gap-2 px-4 py-3">
                      <h3 className="text-gray-400 text-[11px] font-medium uppercase tracking-[0.15em] text-center leading-tight font-['Poppins'] line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex flex-col items-center">
                        <span className="text-blue-900 font-bold text-lg leading-tight">${product.price}</span>
                        <span className="text-slate-300 text-[9px] uppercase tracking-widest font-bold">
                          {(product.price * exchangeRate).toFixed(0)} Bs
                        </span>
                      </div>
                      <Link href={`/producto/${product.id}`} className="w-1/2 mb-1">
                        <button
                          className="w-full rounded-full text-[9px] font-bold tracking-widest text-blue-900 transition-transform active:scale-95"
                          style={{ height: '24px', backgroundColor: '#BDE0FE' }}
                        >
                          LO QUIERO
                        </button>
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </main>

        {/* Navegación Inferior */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 rounded-t-[32px] shadow-lg" style={{ backgroundColor: '#BDE0FE' }}>
          <div className="flex justify-around items-center h-[68px] px-4 pb-1">

            {/* Inicio — activo */}
            <Link href="/" className="flex flex-col items-center gap-1">
              <div className="w-10 h-8 rounded-2xl bg-white/30 flex items-center justify-center">
                <HomeIcon className="size-4 text-blue-900" />
              </div>
              <span className="text-[9px] font-black text-blue-900 tracking-wide">Inicio</span>
            </Link>

            {/* Categorías */}
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-8 rounded-2xl flex items-center justify-center">
                <GridIcon className="size-4 text-blue-900/60" />
              </div>
              <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Categorías</span>
            </button>

            {/* Carrito */}
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-8 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="size-4 text-blue-900/60" />
              </div>
              <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Carrito</span>
            </button>

            {/* Admin */}
            <Link href="/admin" className="flex flex-col items-center gap-1">
              <div className="w-10 h-8 rounded-2xl flex items-center justify-center">
                <User className="size-4 text-blue-900/60" />
              </div>
              <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Admin</span>
            </Link>

          </div>
        </nav>

      </div>
    </div>
  )
}
