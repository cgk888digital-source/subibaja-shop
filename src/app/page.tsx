"use client"
import { useState, useEffect } from "react"
import { ShoppingCart, Heart, Home as HomeIcon, LayoutGrid as GridIcon, User, Loader2, LayoutGrid, Footprints, Shirt, Star, ShoppingBag, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2, Search, X, MapPin } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [justLiked, setJustLiked] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
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
      const { data: prods } = await supabase.from('products').select('*').eq('stock_status', 'in_stock').order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
      if (cats) setCategories(cats)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => {
      const isFav = prev.includes(id)
      const next = isFav ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem("subibaja_favorites", JSON.stringify(next))
      if (!isFav) {
        setJustLiked(id)
        setTimeout(() => setJustLiked(null), 500)
      }
      return next
    })
  }

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── CONTENEDOR MAESTRO: todo vive aquí, 430px centrado ── */}
      <div className="max-w-[430px] mx-auto flex flex-col min-h-screen pb-24 font-['Lato',sans-serif]">

        {/* Header con Glassmorphism */}
        <header className="bg-white/75 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100/50">
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
          <section className="w-full aspect-[16/10] bg-gray-50 overflow-hidden shadow-sm">
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

          {/* Buscador de Productos */}
          <div className="px-4 mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar calzado, ropa, comunión..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-10 rounded-2xl bg-white border border-gray-200/50 shadow-sm text-xs font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-200 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 mt-6">

            {/* Categorías */}
            <h3 className="font-black text-gray-900 text-2xl font-['Poppins'] mb-4 tracking-tight">Categorías</h3>
            <div className="flex overflow-x-auto gap-2.5 pb-6 no-scrollbar">
              {/* Todos — siempre primero */}
              <button
                onClick={() => setActiveCategory("Todos")}
                className={`h-7 px-4 rounded-full whitespace-nowrap text-[11px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  activeCategory === "Todos" ? 'text-blue-900 shadow-sm scale-105' : 'bg-white text-gray-400 shadow-sm hover:text-gray-600'
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
                      activeCategory === cat.name ? 'text-blue-900 shadow-sm scale-105' : 'bg-white text-gray-400 shadow-sm hover:text-gray-600'
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
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col p-4 space-y-3 animate-pulse">
                    <div className="aspect-square bg-slate-100 rounded-2xl w-full" />
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                      <div className="h-6 bg-slate-100 rounded-full w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <ShoppingBag className="size-10 mb-2 opacity-50 text-[#BDE0FE]" />
                <p className="text-sm font-semibold">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col group transition-transform duration-300 hover:-translate-y-0.5"
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
                      <button 
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className={`absolute top-3 right-3 p-1.5 bg-white/90 rounded-full shadow-sm transition-all active:scale-125 ${
                          favorites.includes(product.id) ? 'text-rose-500' : 'text-gray-300 hover:text-rose-300'
                        } ${justLiked === product.id ? 'animate-heartbeat' : ''}`}
                      >
                        <Heart className={`size-3.5 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* ── TEXTOS + BOTÓN: px-4 fondo blanco ── */}
                    <div className="flex flex-col items-center gap-2 px-4 py-3">
                      <h3 className="text-gray-400 text-[11px] font-medium uppercase tracking-[0.15em] text-center leading-tight font-['Poppins'] line-clamp-2 min-h-[33px]">
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
                          className="w-full rounded-full text-[9px] font-bold tracking-widest text-blue-900 transition-transform active:scale-95 shadow-sm"
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

          {/* Sección de Video: Nuestras Instalaciones */}
          <section className="mt-8 px-4">
            <h3 className="font-black text-gray-900 text-2xl font-['Poppins'] mb-4 tracking-tight">Nuestras Instalaciones</h3>
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100/50 flex flex-col gap-3">
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner">
                <video 
                  src="/video shop.mp4" 
                  controls 
                  playsInline 
                  className="w-full h-auto rounded-2xl max-h-[480px] object-contain"
                  preload="metadata"
                />
              </div>
              <div className="px-1 pt-1">
                <p className="text-slate-400 text-xs leading-normal">
                  ¡Ven y conócenos! Te invitamos a dar un recorrido virtual por nuestra tienda física y descubrir todas las colecciones que tenemos preparadas para ti.
                </p>
              </div>
            </div>
          </section>

          {/* Sección de Ubicación */}
          <section className="mt-8 px-4">
            <h3 className="font-black text-gray-900 text-2xl font-['Poppins'] mb-4 tracking-tight">Ubicación</h3>
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100/50 flex flex-col gap-4">
              <div className="relative w-full h-[200px] rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.238914605994!2d-66.8448677!3d10.4686384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a586888f06481%3A0x590fd6ff26307256!2sCentro%20Comercial%20San%20Luis!5e0!3m2!1ses!2sve!4v1716654800000!5m2!1ses!2sve" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-2xl"
                ></iframe>
              </div>
              <div className="flex flex-col gap-1.5 px-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-blue-500 flex-shrink-0" />
                  <h4 className="font-bold text-slate-800 text-sm font-['Poppins']">Centro Comercial San Luis</h4>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal pl-6">Av. Principal de San Luis, Urbanización San Luis, Caracas, Venezuela.</p>
                <a 
                  href="https://maps.app.goo.gl/n4L5GYVrFNUSQ9mJ9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 w-full h-10 rounded-2xl bg-blue-50 border border-[#BDE0FE]/50 text-blue-950 font-bold text-[11px] tracking-wider flex items-center justify-center gap-2 hover:bg-[#BDE0FE]/20 active:scale-95 transition-all shadow-sm"
                >
                  <Search className="size-3.5" />
                  <span>ABRIR EN GOOGLE MAPS</span>
                </a>
              </div>
            </div>
          </section>

          {/* Footer / Redes Sociales */}
          <footer className="mt-8 mb-12 px-4 text-center flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-12 bg-slate-200"></div>
              <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">Síguenos en Redes</span>
              <div className="h-[1px] w-12 bg-slate-200"></div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a 
                href="https://instagram.com/subibaja_shop" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="size-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500 hover:text-rose-500 active:scale-90 transition-all"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href="https://facebook.com/subibajashop" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="size-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 active:scale-90 transition-all"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>

              {/* Whatsapp */}
              <a 
                href="https://wa.me/584141234567" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="size-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-500 active:scale-90 transition-all"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.284 3.509 8.486-.002 6.66-5.338 11.999-11.946 11.999-2.005-.001-3.973-.504-5.714-1.463L0 24zm6.59-4.846c1.66.986 3.292 1.503 4.908 1.504 5.342 0 9.688-4.348 9.69-9.69.001-2.588-1.004-5.02-2.83-6.847-1.826-1.827-4.256-2.83-6.846-2.831-5.345 0-9.691 4.348-9.693 9.692-.001 1.737.478 3.426 1.385 4.903l-1.026 3.743 3.841-1.007zm11.367-5.64c-.327-.164-1.938-.956-2.264-1.075-.328-.118-.567-.177-.805.177-.239.354-.925 1.166-1.134 1.402-.208.236-.417.266-.745.102-.327-.164-1.383-.509-2.636-1.627-.975-.87-1.633-1.946-1.824-2.274-.192-.329-.02-.507.143-.671.147-.147.328-.383.493-.574.165-.192.22-.32.329-.533.109-.214.055-.4-.028-.564-.082-.164-.805-1.94-.105-2.65-.296-.693-.578-.6-.805-.611-.208-.01-.447-.012-.686-.012-.239 0-.627.09-1.015.513-.388.423-1.482 1.45-1.482 3.535 0 2.085 1.52 4.093 1.731 4.38.21.286 2.99 4.566 7.244 6.398 1.011.436 1.802.696 2.42.893 1.016.323 1.941.277 2.673.168.814-.121 1.938-.792 2.21-1.52.272-.729.272-1.353.191-1.482-.081-.13-.297-.208-.624-.372z"/>
                </svg>
              </a>
            </div>

            <p className="text-[9px] font-black text-slate-300 tracking-wider mt-2 uppercase">
              © 2026 SUBIBAJA SHOP. TODOS LOS DERECHOS RESERVADOS.
            </p>
          </footer>
        </main>

        {/* Navegación Inferior con Glassmorphism */}
        <nav 
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 rounded-t-[32px] shadow-2xl border-t border-white/20"
          style={{ 
            backgroundColor: 'rgba(189, 224, 254, 0.85)', 
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)' 
          }}
        >
          <div className="flex justify-around items-center h-[68px] px-4 pb-1">

            {/* Inicio — activo */}
            <Link href="/" className="flex flex-col items-center gap-1">
              <div className="w-10 h-8 rounded-2xl bg-white/30 flex items-center justify-center">
                <HomeIcon className="size-4 text-blue-900" />
              </div>
              <span className="text-[9px] font-black text-blue-900 tracking-wide">Inicio</span>
            </Link>

            {/* Categorías */}
            <button className="flex flex-col items-center gap-1 transition-opacity active:opacity-70">
              <div className="w-10 h-8 rounded-2xl flex items-center justify-center">
                <GridIcon className="size-4 text-blue-900/60" />
              </div>
              <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Categorías</span>
            </button>

            {/* Club Puntos */}
            <Link href="/puntos" className="flex flex-col items-center gap-1 transition-opacity active:opacity-70">
              <div className="w-10 h-8 rounded-2xl flex items-center justify-center">
                <Crown className="size-4 text-blue-900/60" />
              </div>
              <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Club Puntos</span>
            </Link>

            {/* Admin */}
            <Link href="/admin" className="flex flex-col items-center gap-1 transition-opacity active:opacity-70">
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
