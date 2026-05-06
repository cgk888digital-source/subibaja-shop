"use client"
import { useState, useEffect } from "react"
import { ShoppingBag, ShoppingCart, Heart, Home as HomeIcon, Grid, Settings, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const categories = ["Todos", "Zapatos de Niña", "Ropa", "Primera Comunión"]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [products, setProducts] = useState<any[]>([])
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
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filteredProducts = activeCategory === "Todos" 
    ? products 
    : products.filter(p => p.category === activeCategory)

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24 font-['Lato',sans-serif]">
      {/* Header Premium */}
      <header className="bg-white/95 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-50">
        <div className="w-full px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-xl"><ShoppingBag className="text-white size-5" /></div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter font-['Poppins']">Subibaja</h1>
          </div>
          <div className="bg-blue-50/80 px-3 py-1.5 rounded-full">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Tasa: {exchangeRate} Bs</p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Carousel */}
        <section className="w-full aspect-[16/10] bg-gray-50 overflow-hidden">
          <Swiper pagination={{ clickable: true }} autoplay={{ delay: 5000 }} modules={[Pagination, Autoplay]} className="w-full h-full">
            <SwiperSlide>
              <div className="relative w-full h-full">
                <img src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=100&w=1200" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent flex flex-col justify-end p-8 pb-12 text-center items-center">
                  <h2 className="text-3xl font-black text-white leading-tight font-['Poppins'] tracking-tighter">Nuevos Ingresos</h2>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </section>

        <div className="px-5 mt-10">
          <h3 className="font-black text-gray-900 text-2xl font-['Poppins'] mb-6 tracking-tight">Categorías</h3>
          <div className="flex overflow-x-auto gap-3 pb-8 no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-2xl whitespace-nowrap text-xs font-bold transition-all ${
                  activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="size-8 text-blue-500 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 mt-2">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-0 shadow-none bg-white rounded-[40px] overflow-hidden flex flex-col group">
                  {/* 1. Proporción Imagen (Floating) */}
                  <div className="relative aspect-square p-[12px] flex items-center justify-center bg-gray-50/50 rounded-[32px] overflow-hidden">
                    <Link href={`/producto/${product.id}`} className="block w-full h-full">
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" 
                      />
                    </Link>
                    <button className="absolute top-4 right-4 p-1.5 bg-white/90 rounded-full shadow-sm text-gray-200">
                      <Heart className="size-3.5" />
                    </button>
                  </div>
                  
                  {/* 3. Jerarquía de Textos */}
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <h3 className="text-gray-400 text-[11px] font-medium uppercase tracking-[0.15em] mb-2 font-['Poppins']">
                      {product.title}
                    </h3>
                    
                    <div className="flex flex-col items-center mb-6">
                      <span className="text-slate-900 font-bold text-lg tracking-tight">${product.price}</span>
                      <span className="text-slate-300 font-bold text-[9px] uppercase tracking-widest mt-0.5">
                        {(product.price * exchangeRate).toFixed(0)} Bs
                      </span>
                    </div>
                    
                    {/* 2. El Botón 'Cápsula' (Minimalista) */}
                    <div className="w-full flex justify-center py-2">
                      <Link href={`/producto/${product.id}`}>
                        <Button className="w-[100px] h-[26px] min-h-[26px] px-0 py-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-[9px] font-bold tracking-widest border-0 shadow-sm transition-all active:scale-95">
                          LO QUIERO
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Navegación Inferior */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-sm z-50 rounded-t-[40px]">
        <div className="flex justify-around items-center h-20 px-6">
          <Link href="/" className="text-blue-600 p-3 rounded-2xl"><HomeIcon className="size-6" /></Link>
          <button className="text-gray-200"><Grid className="size-6" /></button>
          <button className="text-gray-200"><ShoppingCart className="size-6" /></button>
          <Link href="/admin" className="text-gray-200"><Settings className="size-6" /></Link>
        </div>
      </nav>
    </div>
  )
}
