"use client"
import { useState, useEffect } from "react"
import { ShoppingCart, Heart, Home as HomeIcon, LayoutGrid as GridIcon, User, Loader2, LayoutGrid, Footprints, Shirt, Star, ShoppingBag, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2, Search, X, MapPin, Menu, ChevronDown, ChevronUp, Percent } from "lucide-react"
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
  const [activeSubCategory, setActiveSubCategory] = useState("Todos")
  const [activeLeafCategory, setActiveLeafCategory] = useState("Todos")
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false)
  const [showOffersDrawer, setShowOffersDrawer] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [justLiked, setJustLiked] = useState<string | null>(null)
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchData()
    const saved = localStorage.getItem("subibaja_favorites")
    if (saved) {
      try { setFavorites(JSON.parse(saved)) } catch (e) { console.error(e) }
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("openCategories") === "true") {
        setShowCategoryDrawer(true)
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      } else if (params.get("openOffers") === "true") {
        setShowOffersDrawer(true)
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
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
    // 1. Search Query Filter
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    if (!matchesSearch) return false

    // 2. Category Hierarchy Filter
    if (activeCategory === "Todos") return true

    // Check main category match
    if (p.category !== activeCategory) return false

    // If main category matches, check subcategory
    if (activeSubCategory === "Todos") return true

    const mainCatObj = categories.find(c => c.name === activeCategory && !c.parent_id)
    if (!mainCatObj) return true // safeguard

    const subCatObj = categories.find(c => c.name === activeSubCategory && c.parent_id === mainCatObj.id)
    if (!subCatObj) return true // safeguard

    // If subcategory is selected, check leaf category
    if (activeLeafCategory === "Todos") {
      // Must match subcategory itself OR any of its leaf children
      const leafIds = categories.filter(c => c.parent_id === subCatObj.id).map(c => c.id)
      return p.category_id === subCatObj.id || leafIds.includes(p.category_id)
    }

    const leafCatObj = categories.find(c => c.name === activeLeafCategory && c.parent_id === subCatObj.id)
    if (!leafCatObj) return true // safeguard

    return p.category_id === leafCatObj.id
  })

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── CONTENEDOR MAESTRO: todo vive aquí, 430px centrado ── */}
      <div className="max-w-[430px] mx-auto flex flex-col min-h-screen pb-24 font-['Lato',sans-serif]">

        {/* Header con Glassmorphism */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100/50">
          <div className="w-full px-5 h-16 flex items-center justify-between">
            {/* Logo a la izquierda */}
            <Link href="/" className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <Image
                src="/Logo.jpg.jpeg"
                alt="Subibaja"
                width={38}
                height={38}
                className="rounded-full object-cover border border-slate-100 shadow-sm"
                priority
              />
              <span className="font-['Poppins'] font-black text-blue-900 text-xs tracking-widest uppercase">Subibaja</span>
            </Link>

            {/* Menú Hamburguesa a la derecha */}
            <button
              onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-900 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer"
              aria-label="Abrir Menú"
            >
              {showHamburgerMenu ? (
                <X className="size-4.5 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="size-4.5 transition-transform duration-300" />
              )}
            </button>
          </div>

          {/* Menú Desplegable Hamburguesa (Dropdown) */}
          {showHamburgerMenu && (
            <div className="absolute top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 shadow-2xl rounded-b-[28px] overflow-hidden flex flex-col font-['Lato',sans-serif] max-h-[75vh]">
              {/* Contenedor con Scroll si excede altura */}
              <div className="overflow-y-auto p-5 pb-7 flex flex-col gap-5 max-h-[calc(75vh-1rem)] no-scrollbar">
                
                {/* 1. Navegación Principal */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Navegación</span>
                  <Link 
                    href="/" 
                    onClick={() => setShowHamburgerMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                  >
                    <HomeIcon className="size-3.5 text-blue-900" />
                    <span>Inicio</span>
                  </Link>
                  <Link 
                    href="/puntos" 
                    onClick={() => setShowHamburgerMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                  >
                    <Crown className="size-3.5 text-amber-500 fill-amber-100" />
                    <span>Clientes VIP</span>
                  </Link>

                </div>

                <div className="h-[1px] bg-slate-100 w-full" />

                {/* 2. Categorías / Acordeón */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Colecciones</span>
                    <button 
                      onClick={() => {
                        setActiveCategory("Todos");
                        setActiveSubCategory("Todos");
                        setActiveLeafCategory("Todos");
                        setShowHamburgerMenu(false);
                      }}
                      className="text-[8px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase"
                    >
                      Ver Todo
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {categories.filter(c => !c.parent_id).map((mainCat) => {
                      const mainCatSubs = categories.filter(sub => sub.parent_id === mainCat.id);
                      const MainIcon = CAT_ICONS[mainCat.icon] || Tag;
                      const isExpanded = expandedCategories[mainCat.id] || false;

                      return (
                        <div key={mainCat.id} className="bg-slate-50/50 rounded-2xl border border-slate-100/50 overflow-hidden">
                          {/* Botón de la Categoría Principal */}
                          <div className="flex items-center justify-between w-full px-3 py-2.5">
                            <button
                              onClick={() => {
                                setActiveCategory(mainCat.name);
                                setActiveSubCategory("Todos");
                                setActiveLeafCategory("Todos");
                                setShowHamburgerMenu(false);
                              }}
                              className="flex items-center gap-3 text-left group flex-1 min-w-0"
                            >
                              <div className="w-7.5 h-7.5 rounded-xl bg-[#BDE0FE]/30 text-blue-900 flex items-center justify-center flex-shrink-0">
                                <MainIcon className="size-3.5" />
                              </div>
                              <span className="font-black text-slate-800 text-[10.5px] tracking-tight group-hover:text-blue-600 transition-colors uppercase truncate">
                                {mainCat.name}
                              </span>
                            </button>
                            {mainCatSubs.length > 0 && (
                              <button
                                onClick={() => setExpandedCategories(prev => ({ ...prev, [mainCat.id]: !isExpanded }))}
                                className="size-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                              >
                                {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                              </button>
                            )}
                          </div>

                          {/* Subcategorías desplegables */}
                          {isExpanded && mainCatSubs.length > 0 && (
                            <div className="bg-white border-t border-slate-100/50 p-2.5 pl-4.5 flex flex-col gap-3 animate-fade-in">
                              {mainCatSubs.map((subCat) => {
                                const leafChildren = categories.filter(leaf => leaf.parent_id === subCat.id);
                                return (
                                  <div key={subCat.id} className="flex flex-col gap-1">
                                    <button
                                      onClick={() => {
                                        setActiveCategory(mainCat.name);
                                        setActiveSubCategory(subCat.name);
                                        setActiveLeafCategory("Todos");
                                        setShowHamburgerMenu(false);
                                      }}
                                      className="text-[9.5px] font-black text-slate-700 hover:text-blue-600 text-left transition-colors uppercase tracking-wide"
                                    >
                                      {subCat.name}
                                    </button>

                                    {/* Nivel 3: Hojas (tags) */}
                                    {leafChildren.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {leafChildren.map((leaf) => (
                                          <button
                                            key={leaf.id}
                                            onClick={() => {
                                              setActiveCategory(mainCat.name);
                                              setActiveSubCategory(subCat.name);
                                              setActiveLeafCategory(leaf.name);
                                              setShowHamburgerMenu(false);
                                            }}
                                            className="text-[7.5px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 hover:bg-[#BDE0FE]/20 hover:text-blue-800 hover:border-blue-200/50 transition-all uppercase tracking-wide cursor-pointer"
                                          >
                                            {leaf.name}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 w-full" />

                {/* 3. Redes y Contacto */}
                <div className="flex flex-col items-center gap-2.5">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Síguenos en Redes</span>
                  <div className="flex items-center gap-3">
                    {/* Instagram */}
                    <a 
                      href="https://instagram.com/subibaja_shop" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="size-7.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-900 hover:text-rose-500 active:scale-90 transition-all"
                    >
                      <svg className="size-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                    {/* Whatsapp */}
                    <a 
                      href="https://wa.me/584241999482" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="size-7.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-900 hover:text-emerald-500 active:scale-90 transition-all"
                    >
                      <svg className="size-3 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.284 3.509 8.486-.002 6.66-5.338 11.999-11.946 11.999-2.005-.001-3.973-.504-5.714-1.463L0 24zm6.59-4.846c1.66.986 3.292 1.503 4.908 1.504 5.342 0 9.688-4.348 9.69-9.69.001-2.588-1.004-5.02-2.83-6.847-1.826-1.827-4.256-2.83-6.846-2.831-5.345 0-9.691 4.348-9.693 9.692-.001 1.737.478 3.426 1.385 4.903l-1.026 3.743 3.841-1.007zm11.367-5.64c-.327-.164-1.938-.956-2.264-1.075-.328-.118-.567-.177-.805.177-.239.354-.925 1.166-1.134 1.402-.208.236-.417.266-.745.102-.327-.164-1.383-.509-2.636-1.627-.975-.87-1.633-1.946-1.824-2.274-.192-.329-.02-.507.143-.671.147-.147.328-.383.493-.574.165-.192.22-.32.329-.533.109-.214.055-.4-.028-.564-.082-.164-.805-1.94-.105-2.65-.296-.693-.578-.6-.805-.611-.208-.01-.447-.012-.686-.012-.239 0-.627.09-1.015.513-.388.423-1.482 1.45-1.482 3.535 0 2.085 1.52 4.093 1.731 4.38.21.286 2.99 4.566 7.244 6.398 1.011.436 1.802.696 2.42.893 1.016.323 1.941.277 2.673.168.814-.121 1.938-.792 2.21-1.52.272-.729.272-1.353.191-1.482-.081-.13-.297-.208-.624-.372z"/>
                      </svg>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}
        </header>

        <main className="flex-1">

          {/* Hero Carousel */}
          <section className="w-full aspect-[16/10] bg-gray-50 overflow-hidden shadow-sm">
            <Swiper pagination={{ clickable: true }} autoplay={{ delay: 5000 }} modules={[Pagination, Autoplay]} className="w-full h-full">
              <SwiperSlide>
                <div className="relative w-full h-full">
                  <video
                    src="/video-fachada-tienda.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex flex-col justify-end p-8 pb-12 text-center items-center">
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
            {/* Categorías Principales */}
            <h3 className="font-black text-gray-900 text-2xl font-['Poppins'] mb-4 tracking-tight">Categorías</h3>
            <div className="flex overflow-x-auto gap-2.5 pb-3 no-scrollbar">
              <button
                onClick={() => {
                  setActiveCategory("Todos");
                  setActiveSubCategory("Todos");
                  setActiveLeafCategory("Todos");
                }}
                className={`h-7 px-4 rounded-full whitespace-nowrap text-[11px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  activeCategory === "Todos" ? 'text-blue-900 shadow-sm scale-105' : 'bg-white text-gray-400 shadow-sm hover:text-gray-600'
                }`}
                style={activeCategory === "Todos" ? { backgroundColor: '#BDE0FE' } : {}}
              >
                <LayoutGrid className="size-3" />
                <span>Todos</span>
              </button>
              {categories.filter(c => !c.parent_id).map((cat) => {
                const IconComp = CAT_ICONS[cat.icon] || Tag
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      setActiveSubCategory("Todos");
                      setActiveLeafCategory("Todos");
                    }}
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

            {/* Subcategorías de Nivel 2 */}
            {(() => {
              const mainCat = categories.find(c => c.name === activeCategory && !c.parent_id)
              if (!mainCat) return null
              const subCats = categories.filter(c => c.parent_id === mainCat.id)
              if (subCats.length === 0) return null
              return (
                <div className="flex overflow-x-auto gap-2 pb-3 pt-1 no-scrollbar animate-fade-in">
                  <button
                    onClick={() => {
                      setActiveSubCategory("Todos");
                      setActiveLeafCategory("Todos");
                    }}
                    className={`h-6 px-3 rounded-full whitespace-nowrap text-[10px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      activeSubCategory === "Todos" ? 'bg-[#BDE0FE]/40 text-blue-900 border border-[#BDE0FE]/50' : 'bg-white text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>Todo {activeCategory}</span>
                  </button>
                  {subCats.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubCategory(sub.name);
                        setActiveLeafCategory("Todos");
                      }}
                      className={`h-6 px-3 rounded-full whitespace-nowrap text-[10px] font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                        activeSubCategory === sub.name ? 'bg-[#BDE0FE]/40 text-blue-900 border border-[#BDE0FE]/50' : 'bg-white text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span>{sub.name}</span>
                    </button>
                  ))}
                </div>
              )
            })()}

            {/* Tipo de Producto de Nivel 3 */}
            {(() => {
              const mainCat = categories.find(c => c.name === activeCategory && !c.parent_id)
              if (!mainCat) return null
              const subCat = categories.find(c => c.name === activeSubCategory && c.parent_id === mainCat.id)
              if (!subCat) return null
              const leafCats = categories.filter(c => c.parent_id === subCat.id)
              if (leafCats.length === 0) return null
              return (
                <div className="flex overflow-x-auto gap-2 pb-4 pt-0.5 no-scrollbar animate-fade-in">
                  <button
                    onClick={() => setActiveLeafCategory("Todos")}
                    className={`h-5 px-2.5 rounded-full whitespace-nowrap text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      activeLeafCategory === "Todos" ? 'bg-amber-100/50 text-amber-900 border border-amber-200/50' : 'bg-white text-slate-350 hover:text-slate-500'
                    }`}
                  >
                    <span>Todo {activeSubCategory}</span>
                  </button>
                  {leafCats.map((leaf) => (
                    <button
                      key={leaf.id}
                      onClick={() => setActiveLeafCategory(leaf.name)}
                      className={`h-5 px-2.5 rounded-full whitespace-nowrap text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0 ${
                        activeLeafCategory === leaf.name ? 'bg-amber-100/50 text-amber-900 border border-amber-200/50' : 'bg-white text-slate-350 hover:text-slate-500'
                      }`}
                    >
                      <span>{leaf.name}</span>
                    </button>
                  ))}
                </div>
              )
            })()}

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

          {/* Sección de Tarjeta de Regalo */}
          <section className="mt-8 px-4 animate-fade-in">
            <h3 className="font-black text-gray-900 text-2xl font-['Poppins'] mb-4 tracking-tight">Tarjeta de Regalo</h3>
            <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100/80 flex flex-col gap-4">
              
              {/* Diseñar el Gift Card Físico/Virtual Visual */}
              <div className="relative aspect-[1.58/1] w-full rounded-[24px] overflow-hidden shadow-md border border-blue-50 flex bg-gradient-to-r from-blue-50/50 to-white select-none">
                {/* Lado Izquierdo: Imagen de Niños */}
                <div className="w-1/2 h-full relative">
                  <img 
                    src="/giftcard_kids.png" 
                    alt="Niños Subibaja" 
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay sutil para mezclar con el azul/blanco */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                </div>
                
                {/* Lado Derecho: Detalles de la Tarjeta */}
                <div className="w-1/2 p-4 flex flex-col justify-between items-start text-left bg-white/40 backdrop-blur-xs">
                  <div className="space-y-0.5">
                    <span className="text-[7px] font-black tracking-widest text-blue-500 uppercase block font-['Poppins']">Gift Card Virtual</span>
                    <h4 className="text-sm font-black font-['Poppins'] text-blue-900 tracking-tight leading-none uppercase">Subibaja</h4>
                  </div>
                  
                  <div className="w-full">
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">VALOR</span>
                    <span className="text-3xl font-black font-['Poppins'] text-blue-900 leading-none">$50</span>
                    <span className="text-[8px] font-bold text-slate-400 block mt-0.5">USD</span>
                  </div>
                  
                  <div className="text-[8px] font-mono text-blue-300 font-bold tracking-wider">
                    SB-GIFT-KIDS50
                  </div>
                </div>

                {/* Decoración: Sparkle o Crown de la tienda */}
                <div className="absolute right-4 top-4 opacity-40">
                  <Sparkles className="size-4.5 text-blue-400 fill-blue-100 animate-pulse" />
                </div>
              </div>

              {/* Descripción y botón de compra */}
              <div className="space-y-4 px-1 text-center">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  ¿No sabes qué obsequiar? Regala estilo y sonrisas con nuestra **Gift Card de $50 USD**. El detalle perfecto para que elijan sus prendas y zapatos favoritos en nuestra tienda.
                </p>
                <button
                  onClick={() => {
                    const msg = "¡Hola Subibaja! Me gustaría adquirir la Tarjeta de Regalo virtual de $50 (Kids Gift Card) para obsequiar. ¿Cómo puedo realizar el pago?"
                    window.open(`https://wa.me/584241999482?text=${encodeURIComponent(msg)}`, '_blank')
                  }}
                  className="w-full h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 hover:bg-[#a6d5ff]"
                  style={{ backgroundColor: '#BDE0FE' }}
                >
                  <Gift className="size-3.5" /> COMPRAR GIFT CARD ($50)
                </button>
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
                className="size-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-900 hover:text-rose-500 active:scale-90 transition-all"
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
                className="size-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-900 hover:text-[#1877F2] active:scale-90 transition-all"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>

              {/* Whatsapp */}
              <a 
                href="https://wa.me/584241999482" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="size-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-900 hover:text-emerald-500 active:scale-90 transition-all"
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

                {/* Inicio */}
                <button 
                  onClick={() => {
                    setShowCategoryDrawer(false);
                    setShowOffersDrawer(false);
                  }}
                  className="flex flex-col items-center gap-1 transition-opacity active:opacity-70 cursor-pointer"
                >
                  <div className={`w-10 h-8 rounded-2xl flex items-center justify-center ${(!showCategoryDrawer && !showOffersDrawer) ? 'bg-white/30' : ''}`}>
                    <HomeIcon className={`size-4 ${(!showCategoryDrawer && !showOffersDrawer) ? 'text-blue-900' : 'text-blue-900/60'}`} />
                  </div>
                  <span className={`text-[9px] tracking-wide ${(!showCategoryDrawer && !showOffersDrawer) ? 'font-black text-blue-900' : 'font-bold text-blue-900/60'}`}>Inicio</span>
                </button>

                {/* Categorías */}
                <button 
                  onClick={() => {
                    setShowCategoryDrawer(true);
                    setShowOffersDrawer(false);
                  }}
                  className="flex flex-col items-center gap-1 transition-opacity active:opacity-70 cursor-pointer"
                >
                  <div className={`w-10 h-8 rounded-2xl flex items-center justify-center ${showCategoryDrawer ? 'bg-white/30' : ''}`}>
                    <GridIcon className={`size-4 ${showCategoryDrawer ? 'text-blue-900' : 'text-blue-900/60'}`} />
                  </div>
                  <span className={`text-[9px] tracking-wide ${showCategoryDrawer ? 'font-black text-blue-900' : 'font-bold text-blue-900/60'}`}>Categorías</span>
                </button>

                {/* Ofertas */}
                <button 
                  onClick={() => {
                    setShowOffersDrawer(true);
                    setShowCategoryDrawer(false);
                  }}
                  className="flex flex-col items-center gap-1 transition-opacity active:opacity-70 cursor-pointer"
                >
                  <div className={`w-10 h-8 rounded-2xl flex items-center justify-center ${showOffersDrawer ? 'bg-white/30' : ''}`}>
                    <Percent className={`size-4 ${showOffersDrawer ? 'text-blue-900' : 'text-blue-900/60'}`} />
                  </div>
                  <span className={`text-[9px] tracking-wide ${showOffersDrawer ? 'font-black text-blue-900' : 'font-bold text-blue-900/60'}`}>Ofertas</span>
                </button>

                {/* Clientes VIP */}
                <Link href="/puntos" className="flex flex-col items-center gap-1 transition-opacity active:opacity-70">
                  <div className="w-10 h-8 rounded-2xl flex items-center justify-center">
                    <Crown className="size-4 text-blue-900/60" />
                  </div>
                  <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Clientes VIP</span>
                </Link>

              </div>
            </nav>

        {/* Drawer de Categorías Jerárquicas */}
        {showCategoryDrawer && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in no-print">
            {/* Overlay click to close */}
            <div className="absolute inset-0" onClick={() => setShowCategoryDrawer(false)} />
            
            {/* Sliding Panel */}
            <div 
              className="relative w-full max-w-[430px] bg-white rounded-t-[36px] shadow-2xl p-6 pb-10 flex flex-col gap-5 max-h-[80vh] overflow-y-auto z-10 transition-transform duration-300 translate-y-0"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-lg font-['Poppins']">Explorar Categorías</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Todas nuestras colecciones</p>
                </div>
                <button 
                  onClick={() => setShowCategoryDrawer(false)}
                  className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Categorías List */}
              <div className="flex flex-col gap-4 py-2">
                {categories.filter(c => !c.parent_id).map((mainCat) => {
                  const mainCatSubs = categories.filter(sub => sub.parent_id === mainCat.id)
                  const MainIcon = CAT_ICONS[mainCat.icon] || Tag
                  
                  return (
                    <div key={mainCat.id} className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100/50 space-y-3">
                      {/* Main Cat Item */}
                      <button
                        onClick={() => {
                          setActiveCategory(mainCat.name);
                          setActiveSubCategory("Todos");
                          setActiveLeafCategory("Todos");
                          setShowCategoryDrawer(false);
                        }}
                        className="w-full flex items-center gap-3 text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#BDE0FE]/30 text-blue-900 flex items-center justify-center shadow-xs">
                          <MainIcon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-black text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase">{mainCat.name}</span>
                        </div>
                        <span className="text-[9px] font-black text-blue-500 bg-blue-50/50 px-2 py-0.5 rounded-full border border-blue-100/30">VER TODO</span>
                      </button>

                      {/* Subcategories (Level 2) list */}
                      {mainCatSubs.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pl-2">
                          {mainCatSubs.map((subCat) => {
                            const leafChildren = categories.filter(leaf => leaf.parent_id === subCat.id)
                            
                            return (
                              <div key={subCat.id} className="flex flex-col gap-1 py-1 px-2 bg-white rounded-2xl border border-slate-100/50 shadow-2xs">
                                <button
                                  onClick={() => {
                                    setActiveCategory(mainCat.name);
                                    setActiveSubCategory(subCat.name);
                                    setActiveLeafCategory("Todos");
                                    setShowCategoryDrawer(false);
                                  }}
                                  className="text-[11px] font-bold text-slate-700 hover:text-blue-600 text-left truncate w-full"
                                >
                                  {subCat.name}
                                </button>
                                
                                {/* Leaf items inside drawer (Level 3) */}
                                {leafChildren.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {leafChildren.slice(0, 3).map((leaf) => (
                                      <button
                                        key={leaf.id}
                                        onClick={() => {
                                          setActiveCategory(mainCat.name);
                                          setActiveSubCategory(subCat.name);
                                          setActiveLeafCategory(leaf.name);
                                          setShowCategoryDrawer(false);
                                        }}
                                        className="text-[8px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md hover:bg-[#BDE0FE]/20 hover:text-blue-800 transition-all uppercase tracking-wide"
                                      >
                                        {leaf.name}
                                      </button>
                                    ))}
                                    {leafChildren.length > 3 && (
                                      <span className="text-[7px] font-bold text-slate-300 px-1 py-0.5">+{leafChildren.length - 3}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Drawer de Promociones VIP por Puntos */}
        {showOffersDrawer && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in no-print">
            {/* Overlay click to close */}
            <div className="absolute inset-0" onClick={() => setShowOffersDrawer(false)} />
            
            {/* Sliding Panel */}
            <div 
              className="relative w-full max-w-[430px] bg-white rounded-t-[36px] shadow-2xl p-6 pb-10 flex flex-col gap-5 max-h-[85vh] overflow-y-auto z-10 transition-transform duration-300 translate-y-0"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-lg font-['Poppins'] flex items-center gap-1.5">
                    <Sparkles className="size-5 text-amber-400 fill-amber-400 animate-pulse" /> Promociones VIP
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Canjea tus puntos por ofertas únicas</p>
                </div>
                <button 
                  onClick={() => setShowOffersDrawer(false)}
                  className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* List of Offers */}
              <div className="flex flex-col gap-4 py-2 overflow-y-auto no-scrollbar max-h-[60vh]">
                {[
                  {
                    title: "Zapato Charol Blanco",
                    category: "Zapatos de Niña",
                    points: 200,
                    discount: "40% OFF",
                    originalPrice: 35,
                    promoPrice: 21,
                    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
                    msg: "¡Hola Subibaja! Me gustaría canjear mis puntos por la oferta VIP de Zapato Charol Blanco (40% OFF) por 200 puntos. ¿Cómo es el proceso?"
                  },
                  {
                    title: "Bailarinas Glitter Silver",
                    category: "Zapatos de Niña",
                    points: 150,
                    discount: "50% OFF",
                    originalPrice: 22,
                    promoPrice: 11,
                    image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=800&auto=format&fit=crop",
                    msg: "¡Hola Subibaja! Me gustaría canjear mis puntos por la oferta VIP de Bailarinas Glitter Silver (50% OFF) por 150 puntos. ¿Cómo es el proceso?"
                  },
                  {
                    title: "Cintillo Floral Harmony",
                    category: "Primera Comunión",
                    points: 100,
                    discount: "GRATIS",
                    originalPrice: 12,
                    promoPrice: 0,
                    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
                    msg: "¡Hola Subibaja! Me gustaría canjear mis puntos por la oferta VIP de Cintillo Floral Harmony (¡GRATIS!) por 100 puntos. ¿Cómo es el proceso?"
                  }
                ].map((offer, idx) => {
                  const bsPrice = (offer.promoPrice * exchangeRate).toFixed(0);
                  const origBsPrice = (offer.originalPrice * exchangeRate).toFixed(0);
                  return (
                    <div key={idx} className="bg-white rounded-3xl p-4 flex gap-4 border border-slate-100/80 shadow-xs hover:border-blue-100 transition-colors">
                      <img 
                        src={offer.image} 
                        alt={offer.title} 
                        className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 bg-slate-50 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block truncate">{offer.category}</span>
                            <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full flex-shrink-0">
                              {offer.discount}
                            </span>
                          </div>
                          
                          <h4 className="font-black text-slate-800 text-xs mt-1 leading-tight line-clamp-1">{offer.title}</h4>
                          
                          <div className="flex items-center gap-2 mt-1.5">
                            {offer.promoPrice > 0 ? (
                              <>
                                <span className="text-sm font-black text-blue-900">${offer.promoPrice}</span>
                                <span className="text-[10px] text-slate-400 line-through">${offer.originalPrice}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">¡Gratis!</span>
                                <span className="text-[10px] text-slate-400 line-through">${offer.originalPrice}</span>
                              </>
                            )}
                          </div>
                          <span className="text-[8px] text-slate-400 font-bold">
                            {offer.promoPrice > 0 ? `${bsPrice} Bs` : `0 Bs`} (antes: {origBsPrice} Bs)
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className="h-7 px-2 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center gap-1 text-[8px] font-black text-amber-500 flex-shrink-0">
                            <Crown className="size-3 fill-amber-500" /> {offer.points} PTS
                          </span>
                          <button
                            onClick={() => window.open(`https://wa.me/584241999482?text=${encodeURIComponent(offer.msg)}`, '_blank')}
                            className="flex-1 h-7 rounded-full text-[8px] font-black tracking-wider text-blue-900 uppercase flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm cursor-pointer"
                            style={{ backgroundColor: '#BDE0FE' }}
                          >
                            RECLAMAR OFERTA
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Note / Terms */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center">
                <p className="text-[9px] text-slate-400 leading-normal font-bold">
                  ⚠️ NOTA: Al reclamar, se verificará tu saldo de puntos con tu número de teléfono registrado en el Club VIP.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
