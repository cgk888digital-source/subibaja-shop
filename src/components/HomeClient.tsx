"use client"
import { useState, useEffect, Fragment } from "react"
import { ShoppingCart, Heart, Home as HomeIcon, LayoutGrid as GridIcon, User, Loader2, LayoutGrid, Footprints, Shirt, Star, ShoppingBag, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2, Search, X, MapPin, Menu, ChevronDown, ChevronUp, Percent, BookOpen, Gamepad2, ArrowRight, Ruler } from "lucide-react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import CartFloatingButton from "@/components/CartFloatingButton"

const CAT_ICONS: Record<string, React.ElementType> = {
  Footprints, Shirt, Star, ShoppingBag, Heart, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2, BookOpen, Gamepad2
}

const FAQS = [
  {
    question: "¿Cómo saber la talla de zapato?",
    answer: (
      <p>
        Dibuja en una hoja el contorno del pie y medir en centímetros desde la punta del dedo gordo hasta el centro del talón. Ubicarás en la tabla de tallas según los centímetros medidos la talla exacta.
      </p>
    )
  },
  {
    question: "¿Cuáles son los métodos de pago?",
    answer: (
      <ul className="list-disc pl-4 space-y-0.5">
        <li>Efectivo (Divisa)</li>
        <li>Zelle</li>
        <li>Venmo</li>
        <li>Pago móvil</li>
        <li>Punto de Venta</li>
      </ul>
    )
  },
  {
    question: "¿Cuánto tiempo tengo para realizar el pago de mi compra y hacer el retiro en la tienda?",
    answer: (
      <div className="space-y-2">
        <p>
          • <strong>Pagos online (Zelle, Pago Móvil o Venmo):</strong> Una vez que realices tu compra en nuestra página web, puedes realizar tu pago inmediatamente. El apartado es inmediato y puedes retirar en tienda o solicitar el envío nacional o delivery en cualquier momento.
        </p>
        <p>
          • <strong>Pago en efectivo:</strong> Tendrás 120 minutos o 2 horas para realizar el pago y retiro en nuestra tienda o solicitar el envío por delivery. Una vez culminado este lapso y no se haya recibido el pago o retirado el artículo, el mismo se devolverá automáticamente al stock. Si deseas volver a realizar la compra, no garantizamos la disponibilidad.
        </p>
      </div>
    )
  },
  {
    question: "¿Hacen envíos nacionales?",
    answer: (
      <p>
        Sí, hacemos envíos nacionales (MRW). Los pedidos realizados antes de las 12:00 p.m. se envían el mismo día, pedidos realizados después de las 12:00 p.m. se despachan al siguiente día hábil. Las compras realizadas los viernes después de las 12:00 p.m. (aplica fin de semana), serán enviadas el día lunes.
      </p>
    )
  },
  {
    question: "¿En cuánto tiempo llega mi delivery?",
    answer: (
      <p>
        En estos momentos contamos con un solo repartidor, su ruta de entrega maneja varios destinos. <strong>IMPORTANTE:</strong> Su pedido puede ser entregado de forma inmediata, o puede demorar máximo un lapso de 2 horas en ser entregado.
      </p>
    )
  },
  {
    question: "¿Realizan cambios?",
    answer: (
      <p>
        Una vez efectuada la compra, tiene 3 días para hacer el cambio por: defecto, talla o modelo (bajo ningún concepto se hace devolución del dinero). Las piezas en: promoción, accesorios y trajes de baño NO tienen cambio.
      </p>
    )
  }
]

interface HomeClientProps {
  initialProducts: any[]
  initialCategories: any[]
  initialExchangeRate: number
}

export default function HomeClient({ initialProducts, initialCategories, initialExchangeRate }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [activeSubCategory, setActiveSubCategory] = useState("Todos")
  const [activeLeafCategory, setActiveLeafCategory] = useState("Todos")
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false)
  const [showOffersDrawer, setShowOffersDrawer] = useState(false)
  const [products, setProducts] = useState<any[]>(initialProducts)
  const [categories, setCategories] = useState<any[]>(initialCategories)
  const [exchangeRate, setExchangeRate] = useState(initialExchangeRate)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [justLiked, setJustLiked] = useState<string | null>(null)
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
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
    const currentMainCatObj = categories.find(c => c.name === activeCategory && !c.parent_id)
    if (currentMainCatObj) {
        if (!p.category_ids?.includes(currentMainCatObj.id) && p.category !== activeCategory) return false
    } else {
        if (p.category !== activeCategory) return false
    }

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
      return p.category_ids?.includes(subCatObj.id) || leafIds.some((id: string) => p.category_ids?.includes(id)) || p.category_id === subCatObj.id || leafIds.includes(p.category_id)
    }

    const leafCatObj = categories.find(c => c.name === activeLeafCategory && c.parent_id === subCatObj.id)
    if (!leafCatObj) return true // safeguard

    return p.category_ids?.includes(leafCatObj.id) || p.category_id === leafCatObj.id
  })

  // Destacados
  const featuredCategories = categories.filter(c => c.is_featured_on_home)

  const renderProductCard = (product: any, index: number, showMiddleBanner = false) => {
    return (
      <Fragment key={product.id}>
        {showMiddleBanner && (
          <div className="col-span-2 md:col-span-4 lg:col-span-5 my-2 rounded-[32px] overflow-hidden shadow-sm border border-slate-100/50 flex flex-col bg-[#fef8f8] group">
            <div className="relative w-full aspect-[16/8] md:aspect-[21/9]">
              <Image 
                src="/imagen_home.jpg" 
                alt="Zapatos Subibaja" 
                fill
                sizes="(max-width: 768px) 100vw, 100vw"
                className="object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-5 text-left bg-[#fef8f8]">
              <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 font-['Poppins']">Colección Subibaja</span>
              <h4 className="text-sm font-black font-['Poppins'] text-blue-900 tracking-tight uppercase leading-tight mt-1">
                Calidad y Diseño en Cada Paso
              </h4>
              <p className="text-[9.5px] text-slate-500 font-semibold leading-normal mt-0.5">
                Modelos exclusivos diseñados para brindar la máxima comodidad y estilo en el crecimiento de tus niños.
              </p>
            </div>
          </div>
        )}
        
        <div
          className="shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col group transition-transform duration-300 hover:-translate-y-0.5"
        >
          {/* ── IMAGEN: full-bleed, aspect-square, sin padding, bordes superiores heredados ── */}
          <div className="relative aspect-square overflow-hidden">
            {(() => {
              const displayBadge = index === 0 ? 'nuevo' : index === 1 ? 'top' : (product as any).badge;
              if (displayBadge === 'nuevo') {
                return (
                  <div className="absolute top-3 -left-8 w-28 bg-[#00ced1] text-white text-[8px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none">
                    NUEVO
                  </div>
                );
              }
              if (displayBadge === 'top') {
                return (
                  <div className="absolute top-3 -left-8 w-28 bg-[#f44336] text-white text-[9px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none">
                    TOP
                  </div>
                );
              }
              return null;
            })()}
            <Link href={`/producto/${product.id}`} className="block w-full h-full relative">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                priority={index < 4}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
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
            <h3 className="text-slate-500 text-[11px] font-medium uppercase tracking-[0.15em] text-center leading-tight font-['Poppins'] line-clamp-2 min-h-[33px]">
              {product.title}
            </h3>
            {(() => {
              let displayPriceUsd = Number(product.price) || 0;
              let prefix = "";
              
              if (product.prices_by_size && Object.keys(product.prices_by_size).length > 0) {
                const prices = Object.values(product.prices_by_size).map(v => Number(v)).filter(v => !isNaN(v));
                if (prices.length > 0) {
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);
                  displayPriceUsd = min;
                  if (min < max) {
                    prefix = "Desde ";
                  }
                }
              }
              
              return (
                <div className="flex flex-col items-center">
                  <span className="text-blue-900 font-bold text-lg leading-tight">{prefix}${displayPriceUsd}</span>
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-0.5">
                    {prefix}Bs {(displayPriceUsd * exchangeRate).toFixed(0)} BCV
                  </span>
                </div>
              )
            })()}
            <Link 
              href={`/producto/${product.id}`} 
              className="w-3/4 lg:w-1/2 mb-1 rounded-full text-[9px] font-bold tracking-widest text-blue-900 transition-transform active:scale-95 shadow-sm flex items-center justify-center"
              style={{ height: '24px', backgroundColor: '#8dd5e3' }}
            >
              LO QUIERO
            </Link>
          </div>
        </div>
      </Fragment>
    )
  }

  const handleViewMoreCategory = (cat: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (!cat.parent_id) {
      // Es categoría principal
      setActiveCategory(cat.name)
      setActiveSubCategory("Todos")
      setActiveLeafCategory("Todos")
    } else {
      const parent = categories.find(c => c.id === cat.parent_id)
      if (!parent?.parent_id) {
        // Es subcategoría
        setActiveCategory(parent?.name || "Todos")
        setActiveSubCategory(cat.name)
        setActiveLeafCategory("Todos")
      } else {
        // Es categoría hoja (leaf)
        const main = categories.find(c => c.id === parent.parent_id)
        setActiveCategory(main?.name || "Todos")
        setActiveSubCategory(parent.name)
        setActiveLeafCategory(cat.name)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── CONTENEDOR MAESTRO: todo vive aquí, responsivo ── */}
      <div className="w-full max-w-[430px] md:max-w-7xl mx-auto flex flex-col min-h-screen pb-24 font-['Lato',sans-serif] px-4 md:px-8">

        {/* Header con Glassmorphism */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100/50">
          <div className="w-full px-5 h-16 flex items-center justify-between">
            {/* Logo a la izquierda */}
            <Link href="/" className="flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
              <div className="relative size-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo-principal.jpg"
                  alt="Subibaja"
                  fill
                  className="object-contain rounded-full"
                  priority
                />
              </div>
              <span className="font-['Poppins'] font-black text-blue-900 text-sm tracking-widest uppercase">Subibaja</span>
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
            <div className="absolute top-16 left-0 right-0 md:left-auto md:right-0 md:w-80 z-50 bg-white/95 backdrop-blur-lg border-b md:border border-slate-200/60 md:border-slate-100 shadow-2xl rounded-b-[28px] md:rounded-3xl md:mt-2 overflow-hidden flex flex-col font-['Lato',sans-serif] max-h-[75vh]">
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
                    <span>Club Subibaja</span>
                  </Link>
                  <Link 
                    href="/giftcard" 
                    onClick={() => setShowHamburgerMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                  >
                    <Gift className="size-3.5 text-blue-900" />
                    <span>Giftcards</span>
                  </Link>
                  <Link 
                    href="/tallas" 
                    onClick={() => setShowHamburgerMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                  >
                    <Ruler className="size-3.5 text-blue-900" />
                    <span>Guía de Tallas</span>
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
                              <div className="w-7.5 h-7.5 rounded-xl bg-[#8dd5e3]/30 text-blue-900 flex items-center justify-center flex-shrink-0">
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
                                            className="text-[7.5px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 hover:bg-[#8dd5e3]/20 hover:text-blue-800 hover:border-blue-200/50 transition-all uppercase tracking-wide cursor-pointer"
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
                      className="size-[60px] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-900 hover:text-rose-500 active:scale-90 transition-all"
                    >
                      <svg className="size-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                    {/* Whatsapp */}
                    <a 
                      href="https://wa.me/584142274385" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="size-[60px] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-900 hover:text-emerald-500 active:scale-90 transition-all"
                    >
                      <svg className="size-6 fill-current" viewBox="0 0 24 24">
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
          <section className="w-full aspect-[16/10] md:aspect-[21/9] bg-white overflow-hidden shadow-sm">
            <Swiper pagination={{ clickable: true }} autoplay={{ delay: 5000 }} modules={[Pagination, Autoplay]} className="w-full h-full">
              <SwiperSlide>
                <div className="relative w-full h-full">
                  <Image
                    src="/portada.jpg"
                    alt="Portada Subibaja"
                    fill
                    priority
                    className="object-contain"
                  />
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

          {/* Banner de Fidelización - Club VIP */}
          <div className="px-4 mt-6 md:max-w-3xl md:mx-auto w-full">
            <div className="relative rounded-[32px] overflow-hidden bg-[#8dd5e3] shadow-[0_8px_30px_rgba(141,213,227,0.4)]">
              {/* Glassmorphism overlays & gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative p-5 border border-white/30 rounded-[32px]">
                <div className="flex gap-4 items-center">
                  {/* Logotipo redondo natural ampliado sin fondo blanco */}
                  <div className="relative size-24 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                    <Image 
                      src="/logo-principal.jpg" 
                      alt="Logo Subibaja" 
                      fill
                      sizes="96px"
                      className="object-contain rounded-full"
                    />
                  </div>

                  {/* Detalles de acumulación */}
                  <div className="flex-1 space-y-1 text-left">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-900/70 font-['Poppins']">Club Subibaja</span>
                    <h4 className="text-[14px] font-black font-['Poppins'] text-blue-900 tracking-tight uppercase leading-tight">
                      Gana Puntos
                    </h4>
                    <p className="text-xs text-blue-900/80 font-semibold leading-snug mt-1">
                      Acumula 1 punto por cada $1. Canjéalos por regalos o un 50% de descuento.
                    </p>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="mt-4 pt-4 border-t border-blue-900/10 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-blue-900/70 uppercase tracking-widest">
                    ¿Ya tienes cuenta?
                  </span>
                  <Link 
                    href="/puntos" 
                    className="h-9 px-5 rounded-full font-black tracking-widest text-white bg-blue-900 text-[9px] uppercase shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    CONSULTAR PUNTOS <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Acceso Rápido - Guía de Tallas */}
            <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-3 transition-transform hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
                  <Ruler className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-900 font-['Poppins'] tracking-tight">
                    ¿Dudas con la talla del pie?
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    Aprende a medir en 10 sencillos pasos
                  </p>
                </div>
              </div>
              <Link 
                href="/tallas" 
                className="h-8 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest text-blue-900 bg-[#8dd5e3] shadow-xs flex items-center gap-1 transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                VER GUÍA <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          <div className="px-4 mt-6">
            {/* Categorías Principales */}
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
                style={activeCategory === "Todos" ? { backgroundColor: '#8dd5e3' } : {}}
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
                    style={activeCategory === cat.name ? { backgroundColor: '#8dd5e3' } : {}}
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
                      activeSubCategory === "Todos" ? 'bg-[#8dd5e3]/40 text-blue-900 border border-[#8dd5e3]/50' : 'bg-white text-slate-400 hover:text-slate-600'
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
                        activeSubCategory === sub.name ? 'bg-[#8dd5e3]/40 text-blue-900 border border-[#8dd5e3]/50' : 'bg-white text-slate-400 hover:text-slate-600'
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

            {/* Categorías Destacadas (solo se muestran en el Home principal sin búsqueda) */}
            {activeCategory === "Todos" && activeSubCategory === "Todos" && activeLeafCategory === "Todos" && !searchQuery && featuredCategories.map(cat => {
              // Obtener productos de esta categoría (hasta 8)
              // We check if product belongs to this category or its subcategories.
              // To simplify, we'll just check if category is in category_ids or category_id or string category
              const isMain = !cat.parent_id
              const catSubs = categories.filter(c => c.parent_id === cat.id)
              const catLeafs = categories.filter(c => catSubs.some(sub => sub.id === c.parent_id))
              const allRelevantIds = [cat.id, ...catSubs.map(c => c.id), ...catLeafs.map(c => c.id)]
              
              const catProducts = products.filter(p => 
                p.category === cat.name || 
                allRelevantIds.includes(p.category_id) || 
                (p.category_ids && p.category_ids.some((id: string) => allRelevantIds.includes(id)))
              ).slice(0, 8) // Limitamos a 8 productos
              
              if (catProducts.length === 0) return null

              return (
                <div key={cat.id} className="mb-8">
                  <div className="flex items-center justify-between mb-4 mt-2 px-1">
                    <h2 className="text-xl font-black font-['Poppins'] text-slate-800 flex items-center gap-2">
                      {cat.name}
                    </h2>
                    <button 
                      onClick={() => handleViewMoreCategory(cat)}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors active:scale-95 flex items-center gap-1"
                    >
                      Ver más <ArrowRight className="size-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-4">
                    {catProducts.map((product, index) => renderProductCard(product, index, false))}
                  </div>
                </div>
              )
            })}

            {/* Grid de Productos Normales */}
            {activeCategory === "Todos" && !searchQuery && featuredCategories.length > 0 && (
              <div className="flex items-center justify-between mb-4 mt-6">
                <h2 className="text-xl font-black font-['Poppins'] text-slate-800">
                  Todos los productos
                </h2>
              </div>
            )}
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-4">
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
                <ShoppingBag className="size-10 mb-2 opacity-50 text-[#8dd5e3]" />
                <p className="text-sm font-semibold">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-4">
                {filteredProducts.map((product, index) => {
                  const middleIndex = filteredProducts.length > 2 ? Math.floor(filteredProducts.length / 2) : -1
                  const showMiddleBanner = index === middleIndex
                  return renderProductCard(product, index, showMiddleBanner)
                })}
              </div>
            )}

          </div>

          {/* Sección de Tarjeta de Regalo */}
          <section className="mt-8 px-4 animate-fade-in md:max-w-3xl md:mx-auto w-full">
            <h3 className="font-black text-gray-900 text-2xl font-['Poppins'] mb-4 tracking-tight">Tarjeta de Regalo</h3>
            <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100/80 flex flex-col gap-4">
              
              {/* Diseñar el Gift Card Físico/Virtual Visual */}
              <div className="relative aspect-[1.58/1] w-full md:max-w-md mx-auto rounded-[24px] overflow-hidden shadow-md border border-blue-50 flex bg-gradient-to-r from-blue-50/50 to-white select-none">
                {/* Lado Izquierdo: Imagen de Niños */}
                <div className="w-1/2 h-full relative">
                  <Image 
                    src="/imagem_gift_card.jpeg" 
                    alt="Niños Subibaja"
                    fill
                    sizes="(max-width: 768px) 50vw, 30vw"
                    className="object-cover object-[center_70%]"
                    unoptimized={true}
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
                <Link 
                  href="/giftcard" 
                  className="w-full md:max-w-xs mx-auto h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 hover:bg-[#a6d5ff] cursor-pointer"
                  style={{ backgroundColor: '#8dd5e3' }}
                >
                  <Gift className="size-3.5" /> VER TARJETAS DE REGALO
                </Link>
              </div>

            </div>
          </section>

          {/* Sección de Preguntas Frecuentes */}
          <section className="mt-8 px-5">
            <h3 className="font-black text-gray-900 text-xl font-['Poppins'] mb-4 tracking-tight">
              Preguntas Frecuentes
            </h3>
            <div className="flex flex-col border-t border-slate-200/60">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className="border-b border-slate-200/60">
                    {/* Botón de Activación */}
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full py-3.5 flex items-center justify-between text-left gap-4 focus:outline-none cursor-pointer group"
                    >
                      <span className="font-bold text-slate-800 text-[12.5px] leading-snug tracking-tight group-hover:text-blue-600 transition-colors">
                        {faq.question}
                      </span>
                      <span className={`text-[16px] font-medium transition-colors duration-200 ${isOpen ? 'text-blue-500 font-bold' : 'text-slate-400'}`}>
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    {/* Contenido desplegable */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-[350px] pb-4' : 'max-h-0'
                      }`}
                    >
                      <div className="text-[11.5px] text-slate-500 leading-relaxed font-semibold">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                )
              })}
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
                ></iframe>
              </div>
              
              <div className="p-6 pt-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-[15px] uppercase tracking-tight">Visítanos</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tienda Física</p>
                  </div>
                </div>
                <p className="text-slate-500 text-[12px] leading-relaxed font-medium mb-4 pl-1">
                  Av. Principal de San Luis, Urbanización San Luis, Caracas, Venezuela.
                </p>
                <a 
                  href="https://maps.app.goo.gl/cRsb5PJUcEt2uyws8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900 font-black text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-blue-100 active:scale-95 transition-all shadow-sm"
                >
                  <Search className="size-4 text-blue-500" />
                  ABRIR EN GOOGLE MAPS
                </a>

                {/* Separator */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6"></div>

                {/* Redes Sociales Premium */}
                <div className="text-center space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Síguenos en nuestras redes</span>
                  <div className="flex items-center justify-center gap-4">
                    {/* Instagram */}
                    <a 
                      href="https://instagram.com/subibaja_shop" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group relative size-14 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[1px] hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
                    >
                      <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                        <svg className="size-6 fill-[url(#ig-grad)] group-hover:fill-white transition-colors duration-300" viewBox="0 0 24 24">
                          <defs>
                            <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#f9ce34" />
                              <stop offset="50%" stopColor="#ee2a7b" />
                              <stop offset="100%" stopColor="#6228d7" />
                            </linearGradient>
                          </defs>
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </div>
                    </a>

                    {/* WhatsApp */}
                    <a 
                      href="https://wa.me/584142274385" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group relative size-14 rounded-2xl bg-[#25D366] p-[1px] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-300"
                    >
                      <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center group-hover:bg-[#25D366] transition-colors duration-300">
                        <svg className="size-7 fill-[#25D366] group-hover:fill-white transition-colors duration-300" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.284 3.509 8.486-.002 6.66-5.338 11.999-11.946 11.999-2.005-.001-3.973-.504-5.714-1.463L0 24zm6.59-4.846c1.66.986 3.292 1.503 4.908 1.504 5.342 0 9.688-4.348 9.69-9.69.001-2.588-1.004-5.02-2.83-6.847-1.826-1.827-4.256-2.83-6.846-2.831-5.345 0-9.691 4.348-9.693 9.692-.001 1.737.478 3.426 1.385 4.903l-1.026 3.743 3.841-1.007zm11.367-5.64c-.327-.164-1.938-.956-2.264-1.075-.328-.118-.567-.177-.805.177-.239.354-.925 1.166-1.134 1.402-.208.236-.417.266-.745.102-.327-.164-1.383-.509-2.636-1.627-.975-.87-1.633-1.946-1.824-2.274-.192-.329-.02-.507.143-.671.147-.147.328-.383.493-.574.165-.192.22-.32.329-.533.109-.214.055-.4-.028-.564-.082-.164-.805-1.94-.105-2.65-.296-.693-.578-.6-.805-.611-.208-.01-.447-.012-.686-.012-.239 0-.627.09-1.015.513-.388.423-1.482 1.45-1.482 3.535 0 2.085 1.52 4.093 1.731 4.38.21.286 2.99 4.566 7.244 6.398 1.011.436 1.802.696 2.42.893 1.016.323 1.941.277 2.673.168.814-.121 1.938-.792 2.21-1.52.272-.729.272-1.353.191-1.482-.081-.13-.297-.208-.624-.372z"/>
                        </svg>
                      </div>
                    </a>

                    {/* Facebook */}
                    <a 
                      href="https://facebook.com/subibajashop" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group relative size-14 rounded-2xl bg-[#1877F2] p-[1px] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1877F2]/30 transition-all duration-300"
                    >
                      <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center group-hover:bg-[#1877F2] transition-colors duration-300">
                        <svg className="size-7 fill-[#1877F2] group-hover:fill-white transition-colors duration-300" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                        </svg>
                      </div>
                    </a>
                  </div>
                </div>

              </div>
              <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">
                  © {new Date().getFullYear()} SUBIBAJA SHOP. TODOS LOS DERECHOS RESERVADOS.
                </p>
              </div>
            </div>
          </section>
        </main>

            {/* Navegación Inferior con Glassmorphism */}
            <nav 
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 rounded-t-[32px] shadow-2xl border-t border-white/20 md:hidden"
              style={{ 
                backgroundColor: 'rgba(141, 213, 227, 0.85)', 
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
                  <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Club Subibaja</span>
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
                        <div className="w-8 h-8 rounded-xl bg-[#8dd5e3]/30 text-blue-900 flex items-center justify-center shadow-xs">
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
                                        className="text-[8px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md hover:bg-[#8dd5e3]/20 hover:text-blue-800 transition-all uppercase tracking-wide"
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
                          <span className="text-[8px] text-slate-500 font-bold">
                            {offer.promoPrice > 0 ? `Bs ${bsPrice} BCV` : `Bs 0 BCV`} (antes: Bs {origBsPrice} BCV)
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className="h-7 px-2 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center gap-1 text-[8px] font-black text-amber-500 flex-shrink-0">
                            <Crown className="size-3 fill-amber-500" /> {offer.points} PTS
                          </span>
                          <button
                            onClick={() => window.open(`https://wa.me/584142274385?text=${encodeURIComponent(offer.msg)}`, '_blank')}
                            className="flex-1 h-7 rounded-full text-[8px] font-black tracking-wider text-blue-900 uppercase flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm cursor-pointer"
                            style={{ backgroundColor: '#8dd5e3' }}
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
                  ⚠️ NOTA: Al reclamar, se verificará tu saldo de puntos con tu número de teléfono registrado en el Club Subibaja.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Carrito Flotante */}
        <CartFloatingButton />

      </div>
    </div>
  )
}
