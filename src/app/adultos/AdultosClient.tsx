"use client"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Search, Heart, ArrowLeft, 
  Sparkles, X, Menu, Crown, Gift, Ruler, 
  Percent, Home as HomeIcon, MessageCircle
} from "lucide-react"
import CartFloatingButton from "@/components/CartFloatingButton"
import AdultosLogo from "@/components/AdultosLogo"

interface AdultosClientProps {
  initialProducts: any[]
  initialCategories: any[]
  initialExchangeRate: number
}

export default function AdultosClient({
  initialProducts,
  initialCategories,
  initialExchangeRate
}: AdultosClientProps) {
  const [products] = useState<any[]>(initialProducts)
  const [categories] = useState<any[]>(initialCategories)
  const [exchangeRate] = useState(initialExchangeRate)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubCat, setSelectedSubCat] = useState("Todos")
  const [favorites, setFavorites] = useState<string[]>([])
  const [justLiked, setJustLiked] = useState<string | null>(null)
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("subibaja_favorites")
    if (saved) {
      try { setFavorites(JSON.parse(saved)) } catch (e) { console.error(e) }
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

  // Adult category IDs: main Adultos category + all its subcategories + any category containing "adult"
  const adultCategoryIds = useMemo(() => {
    const adultMain = categories.find(c => c.name.toLowerCase().includes("adult") && !c.parent_id)
    const adultMainId = adultMain?.id || "1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d"
    const subCategories = categories.filter(c => c.parent_id === adultMainId)
    const subIds = subCategories.map(c => c.id)
    const anyAdultNamed = categories.filter(c => c.name.toLowerCase().includes("adult")).map(c => c.id)
    return Array.from(new Set([adultMainId, ...subIds, ...anyAdultNamed]))
  }, [categories])

  // Subcategories specifically for Adultos
  const adultSubCategories = useMemo(() => {
    const adultMain = categories.find(c => c.name.toLowerCase().includes("adult") && !c.parent_id)
    const adultMainId = adultMain?.id || "1d1d1d1d-1d1d-1d1d-1d1d-1d1d1d1d1d1d"
    return categories.filter(c => c.parent_id === adultMainId)
  }, [categories])

  // All adult products
  const adultProducts = useMemo(() => {
    return products.filter(p => {
      const hasAdultCatId = adultCategoryIds.includes(p.category_id)
      const hasAdultInCatIds = p.category_ids && Array.isArray(p.category_ids) && p.category_ids.some((id: string) => adultCategoryIds.includes(id))
      const hasAdultCategory = p.category && typeof p.category === 'string' && p.category.toLowerCase().includes("adult")
      const hasAdultBadge = p.badge && typeof p.badge === 'string' && (p.badge.toLowerCase() === "adulto" || p.badge.toLowerCase() === "adultos")
      return hasAdultCatId || hasAdultInCatIds || hasAdultCategory || hasAdultBadge
    })
  }, [products, adultCategoryIds])

  // Filtered by subcategory and search
  const filteredProducts = useMemo(() => {
    return adultProducts.filter(p => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesTitle = p.title?.toLowerCase().includes(q)
        const matchesDesc = p.description?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc) return false
      }

      // 2. Subcategory filter
      if (selectedSubCat !== "Todos") {
        const subCatObj = adultSubCategories.find(c => c.name.trim().toLowerCase() === selectedSubCat.trim().toLowerCase())
        if (subCatObj) {
          const matchId = p.category_id === subCatObj.id
          const matchIds = p.category_ids && Array.isArray(p.category_ids) && p.category_ids.includes(subCatObj.id)
          if (!matchId && !matchIds) return false
        }
      }

      return true
    })
  }, [adultProducts, selectedSubCat, searchQuery, adultSubCategories])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Container responsivo */}
      <div className="w-full max-w-[430px] md:max-w-7xl mx-auto flex flex-col min-h-screen pb-24 font-['Lato',sans-serif] px-4 md:px-8">
        
        {/* Header con Glassmorphism */}
        <header className="relative bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100/60 shadow-xs md:rounded-b-2xl">
          <div className="w-full px-4 h-16 flex items-center justify-between">
            {/* Izquierda: Volver a inicio */}
            <div className="flex items-center gap-2">
              <Link 
                href="/" 
                className="size-9 rounded-xl bg-orange-50/60 border border-[#B94E3B]/20 flex items-center justify-center text-[#B94E3B] hover:bg-[#B94E3B]/10 active:scale-95 transition-all"
                title="Volver a Inicio"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <Link href="/adultos" className="flex items-center gap-2.5">
                {/* Logotipo Oficial Terracota de Subibaja Adultos */}
                <AdultosLogo className="size-10" />
                <div className="flex flex-col">
                  <span className="font-black text-slate-900 text-sm tracking-tight font-['Poppins'] leading-tight">
                    SUBIBAJA
                  </span>
                  <span className="text-[9.5px] font-black tracking-widest text-[#B94E3B] uppercase leading-none">
                    ADULTOS
                  </span>
                </div>
              </Link>
            </div>

            {/* Enlaces de Navegación en Desktop */}
            <nav className="hidden md:flex items-center gap-6 font-bold text-xs text-slate-600">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Inicio
              </Link>
              <span className="text-[#B94E3B] font-black border-b-2 border-[#B94E3B] pb-0.5">
                Subibaja Adultos
              </span>
              <Link href="/puntos" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Crown className="size-3.5 text-amber-500 fill-amber-100" />
                <span>Club Subibaja</span>
              </Link>
              <Link href="/giftcard" className="hover:text-slate-900 transition-colors">
                Giftcards
              </Link>
              <Link href="/tallas" className="hover:text-slate-900 transition-colors">
                Guía de Tallas
              </Link>
            </nav>

            {/* Menú Hamburguesa a la derecha */}
            <button
              onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer"
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
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] md:bg-black/5 md:backdrop-blur-none"
                onClick={() => setShowHamburgerMenu(false)}
              />
              <div className="absolute top-full left-0 right-0 md:left-auto md:right-0 md:w-80 z-50 bg-white/95 backdrop-blur-lg border-b md:border border-slate-200/60 md:border-slate-100 shadow-2xl rounded-b-[28px] md:rounded-3xl md:mt-2 overflow-hidden flex flex-col font-['Lato',sans-serif] max-h-[75vh]">
                <div className="overflow-y-auto p-5 pb-7 flex flex-col gap-4 max-h-[calc(75vh-1rem)] no-scrollbar">
                  
                  {/* Navegación Principal */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Navegación</span>
                    <Link 
                      href="/" 
                      onClick={() => setShowHamburgerMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <HomeIcon className="size-3.5 text-slate-700" />
                      <span>Inicio (Tienda Niños)</span>
                    </Link>
                    <Link 
                      href="/adultos" 
                      onClick={() => setShowHamburgerMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-orange-50/80 text-[#B94E3B] font-black text-xs transition-colors border border-[#B94E3B]/20"
                    >
                      <AdultosLogo className="size-5" showBorder={false} />
                      <span>Subibaja Adultos</span>
                    </Link>
                    <Link 
                      href="/puntos" 
                      onClick={() => setShowHamburgerMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <Crown className="size-3.5 text-amber-500 fill-amber-100" />
                      <span>Club Subibaja</span>
                    </Link>
                    <Link 
                      href="/giftcard" 
                      onClick={() => setShowHamburgerMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <Gift className="size-3.5 text-slate-700" />
                      <span>Giftcards</span>
                    </Link>
                    <Link 
                      href="/tallas" 
                      onClick={() => setShowHamburgerMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <Ruler className="size-3.5 text-slate-700" />
                      <span>Guía de Tallas</span>
                    </Link>
                  </div>

                  <div className="h-[1px] bg-slate-100 w-full" />

                  {/* Subcategorías de Adultos */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">
                      Línea Adultos ({adultProducts.length} modelos)
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSubCat("Todos")
                        setShowHamburgerMenu(false)
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                        selectedSubCat === "Todos" ? "bg-[#B94E3B] text-white" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>Todos los Modelos</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        selectedSubCat === "Todos" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {adultProducts.length}
                      </span>
                    </button>
                    {adultSubCategories.map(sub => {
                      const count = adultProducts.filter(p => p.category_id === sub.id || (p.category_ids && p.category_ids.includes(sub.id))).length
                      const isSelected = selectedSubCat === sub.name
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubCat(sub.name)
                            setShowHamburgerMenu(false)
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                            isSelected ? "bg-[#B94E3B] text-white" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{sub.name.trim()}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 mt-4 space-y-6">
          
          {/* Banner Hero Especial: Subibaja Adultos (Terracota Elegante) */}
          <section className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#2F1410] via-[#522119] to-[#802F21] text-white p-6 md:p-10 shadow-xl border border-[#B94E3B]/40">
            {/* Resplandores terracota sutiles */}
            <div className="absolute -right-16 -top-16 size-72 bg-[#B94E3B]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 size-72 bg-[#D3604B]/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-[#F5C4BC]">
                  <Sparkles className="size-3 text-[#F5C4BC]" />
                  Colección Exclusiva
                </div>
                <div className="flex items-center gap-3">
                  <AdultosLogo className="size-12 md:size-14 ring-2 ring-white/30 shadow-md" />
                  <div>
                    <h1 className="text-2xl md:text-4xl font-black font-['Poppins'] tracking-tight text-white leading-tight">
                      Subibaja Adultos
                    </h1>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#F5C4BC]/90">
                      Zapatos y accesorios para damas y caballeros
                    </p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed pt-1">
                  Modelos exclusivos con la calidad, confort y confección europea tradicional características de nuestra boutique.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center">
                  <span className="text-xl md:text-2xl font-black text-white font-['Poppins'] leading-none">
                    {adultProducts.length}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#F5C4BC] mt-1">
                    Modelos
                  </span>
                </div>
                <a 
                  href="https://wa.me/584142274385?text=Hola%20Subibaja,%20tengo%20una%20consulta%20sobre%20la%20secci%C3%B3n%20Adultos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-5 rounded-2xl bg-[#B94E3B] hover:bg-[#A33F2E] active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#B94E3B]/40 transition-all cursor-pointer whitespace-nowrap border border-white/10"
                >
                  <MessageCircle className="size-4" />
                  Asesoría WhatsApp
                </a>
              </div>
            </div>
          </section>

          {/* Barra de Búsqueda */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en Subibaja Adultos (menorquinas, pantuflas, sandalias...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white border border-gray-200/60 shadow-xs text-xs font-semibold text-slate-800 placeholder:text-gray-400 focus:outline-none focus:border-[#B94E3B] focus:ring-2 focus:ring-[#B94E3B]/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filtro por Subcategorías (Clásicos, Españoles, Sandalias, Tacones, etc.) */}
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedSubCat("Todos")}
              className={`h-8 px-4 rounded-full whitespace-nowrap text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedSubCat === "Todos"
                  ? "bg-[#B94E3B] text-white shadow-md shadow-[#B94E3B]/30 scale-105"
                  : "bg-white text-slate-600 border border-slate-200/70 hover:bg-orange-50/50 hover:text-[#B94E3B] hover:border-[#B94E3B]/30"
              }`}
            >
              <span>Todos ({adultProducts.length})</span>
            </button>

            {adultSubCategories.map(sub => {
              const subCount = adultProducts.filter(p => 
                p.category_id === sub.id || (p.category_ids && p.category_ids.includes(sub.id))
              ).length

              const isSelected = selectedSubCat === sub.name

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCat(sub.name)}
                  className={`h-8 px-4 rounded-full whitespace-nowrap text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#B94E3B] text-white shadow-md shadow-[#B94E3B]/30 scale-105"
                      : "bg-white text-slate-600 border border-slate-200/70 hover:bg-orange-50/50 hover:text-[#B94E3B] hover:border-[#B94E3B]/30"
                  }`}
                >
                  <span>{sub.name.trim()}</span>
                  {subCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {subCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Grid de Productos */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
              <div className="size-14 rounded-full bg-orange-50 text-[#B94E3B] flex items-center justify-center mx-auto">
                <Search className="size-6" />
              </div>
              <h3 className="font-black text-slate-800 text-sm">No se encontraron modelos</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No encontramos productos que coincidan con tu búsqueda en la sección de adultos.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedSubCat("Todos")
                }}
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#B94E3B] text-white text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer shadow-md shadow-[#B94E3B]/20"
              >
                Ver todos los adultos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {filteredProducts.map((product, index) => {
                const displayBadge = product.badge || (index === 0 ? 'nuevo' : index === 1 ? 'top' : null)
                let displayPriceUsd = Number(product.price) || 0
                let prefix = ""
                
                if (product.prices_by_size && Object.keys(product.prices_by_size).length > 0) {
                  const prices = Object.values(product.prices_by_size).map(v => Number(v)).filter(v => !isNaN(v))
                  if (prices.length > 0) {
                    const min = Math.min(...prices)
                    const max = Math.max(...prices)
                    displayPriceUsd = min
                    if (min < max) prefix = "Desde "
                  }
                }

                const isOutOfStock = product.badge === 'agotado' || product.badge === 'agotado_rojo' || product.stock_status === 'out_of_stock'

                return (
                  <div
                    key={product.id}
                    className="shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col group transition-transform duration-300 hover:-translate-y-0.5 border border-slate-100/60 hover:border-[#B94E3B]/30"
                  >
                    {/* Imagen */}
                    <div className="relative aspect-square overflow-hidden bg-slate-50/50">
                      {/* Badge Ribbon */}
                      {(() => {
                        if (displayBadge === 'nuevo') {
                          return (
                            <div className="absolute top-3 -left-8 w-28 bg-[#00ced1] text-white text-[8px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none">
                              NUEVO
                            </div>
                          )
                        }
                        if (displayBadge === 'top') {
                          return (
                            <div className="absolute top-3 -left-8 w-28 bg-[#f44336] text-white text-[9px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none">
                              TOP
                            </div>
                          )
                        }
                        if (displayBadge === 'descuentos' || displayBadge === 'descuento') {
                          return (
                            <div className="absolute top-3 -left-8 w-28 bg-[#10b981] text-white text-[7px] font-black tracking-wider py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none">
                              DESCUENTOS
                            </div>
                          )
                        }
                        if (displayBadge === 'rebaja' || displayBadge === 'rebajas') {
                          return (
                            <div className="absolute top-3 -left-8 w-28 bg-[#ef4444] text-white text-[8px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none">
                              REBAJA
                            </div>
                          )
                        }
                        if (displayBadge === 'rebaja_azul') {
                          return (
                            <div className="absolute top-3 -left-8 w-28 bg-[#1e40af] text-white text-[8px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none">
                              REBAJA
                            </div>
                          )
                        }
                        if (displayBadge === 'agotado') {
                          return (
                            <div className="absolute top-3 -left-8 w-28 bg-[#334155] text-white text-[8px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none uppercase">
                              AGOTADO
                            </div>
                          )
                        }
                        if (displayBadge === 'agotado_rojo') {
                          return (
                            <div className="absolute top-3 -left-8 w-28 bg-[#dc2626] text-white text-[8px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none uppercase">
                              AGOTADO
                            </div>
                          )
                        }
                        if (displayBadge === 'adulto' || displayBadge === 'adultos') {
                          return (
                            <div className="absolute top-3 -left-8 w-28 bg-[#B94E3B] text-white text-[8px] font-black tracking-widest py-1 text-center transform -rotate-45 z-10 shadow-sm pointer-events-none uppercase">
                              ADULTO
                            </div>
                          )
                        }
                        return null
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
                        className={`absolute top-3 right-3 p-1.5 bg-white/90 rounded-full shadow-sm transition-all active:scale-125 cursor-pointer ${
                          favorites.includes(product.id) ? 'text-[#B94E3B] fill-[#B94E3B]' : 'text-gray-300 hover:text-rose-300'
                        } ${justLiked === product.id ? 'scale-125 transition-transform duration-300' : ''}`}
                      >
                        <Heart className={`size-3.5 ${favorites.includes(product.id) ? 'fill-[#B94E3B]' : ''}`} />
                      </button>
                    </div>

                    {/* Textos y Acción */}
                    <div className="flex flex-col items-center gap-2 px-4 py-3 bg-white">
                      <h3 className="text-slate-700 text-[11px] font-semibold uppercase tracking-[0.15em] text-center leading-tight font-['Poppins'] line-clamp-2 min-h-[33px]">
                        {product.title}
                      </h3>

                      <div className="flex flex-col items-center">
                        <span className="text-[#B94E3B] font-black text-lg leading-tight">
                          {prefix}${displayPriceUsd}
                        </span>
                        <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-0.5">
                          {prefix}Bs {(displayPriceUsd * exchangeRate).toFixed(0)} BCV
                        </span>
                      </div>

                      {isOutOfStock ? (
                        <Link 
                          href={`/producto/${product.id}`} 
                          className="w-3/4 lg:w-1/2 mb-1 rounded-full text-[9px] font-bold tracking-widest text-slate-500 bg-slate-100 border border-slate-200 transition-transform active:scale-95 shadow-sm flex items-center justify-center uppercase"
                          style={{ height: '26px' }}
                        >
                          AGOTADO
                        </Link>
                      ) : (
                        <Link 
                          href={`/producto/${product.id}`} 
                          className="w-3/4 lg:w-1/2 mb-1 rounded-full text-[9px] font-black tracking-widest text-white transition-all active:scale-95 shadow-sm hover:shadow flex items-center justify-center hover:opacity-90"
                          style={{ height: '26px', backgroundColor: '#B94E3B' }}
                        >
                          LO QUIERO
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Enlace para volver a la tienda general */}
          <div className="pt-8 pb-4 text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-orange-50/60 text-slate-700 hover:text-[#B94E3B] text-xs font-black uppercase tracking-wider transition-all border border-slate-200 hover:border-[#B94E3B]/30 shadow-xs"
            >
              <ArrowLeft className="size-4" /> Volver a toda la tienda
            </Link>
          </div>
        </main>
      </div>

      {/* Carrito flotante */}
      <CartFloatingButton />
    </div>
  )
}
