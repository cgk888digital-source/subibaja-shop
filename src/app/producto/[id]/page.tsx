"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { MessageCircle, ShieldCheck, Truck, ChevronLeft, Play, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  
  const [product, setProduct] = useState<any>(null)
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")

  useEffect(() => {
    if (!id) return
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      setLoading(true)
      
      // 1. Fetch Tasa
      const { data: settings } = await supabase.from('settings').select('*').eq('id', 'exchange_rate').single()
      if (settings) setExchangeRate(settings.value)

      // 2. Fetch Producto
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

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

  const handleWhatsApp = () => {
    const priceBs = (product.price * exchangeRate).toFixed(0)
    const message = `¡Hola! Me interesa este producto:\n\n*${product.title}*\nPrecio: $${product.price} (${priceBs} Bs)\nTalla: ${selectedSize}\n\n¿Tienen disponibilidad?`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/584141234567?text=${encoded}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50/20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-blue-600 font-bold animate-pulse">Cargando detalles...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-white">
        <Info className="size-12 text-blue-500 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Producto no encontrado</h2>
        <Button asChild className="bg-blue-600 rounded-2xl h-14 px-8 font-bold mt-4">
          <Link href="/">Volver a la tienda</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-['Lato',sans-serif]">
      {/* Header flotante */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg active:scale-90 transition-transform">
          <ChevronLeft className="size-6 text-gray-800" />
        </button>
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Tasa: {exchangeRate} Bs</p>
        </div>
      </div>

      <section className="relative w-full aspect-[4/5] bg-gray-100">
        <Swiper pagination={{ clickable: true }} modules={[Pagination, Navigation]} className="w-full h-full">
          <SwiperSlide>
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          </SwiperSlide>
        </Swiper>
      </section>

      <main className="px-6 py-8 flex-1 pb-32">
        <div className="space-y-2 mb-6">
          <Badge className="bg-blue-50 text-blue-600 border-0 px-3 py-1 font-black text-[10px] tracking-widest">
            {product.stock_status === 'in_stock' ? 'EN STOCK' : 'AGOTADO'}
          </Badge>
          <h1 className="text-3xl font-black text-gray-900 leading-tight font-['Poppins']">
            {product.title}
          </h1>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-black text-blue-600 font-['Poppins']">${product.price}</p>
            <p className="text-xl font-bold text-slate-400">{(product.price * exchangeRate).toFixed(0)} Bs</p>
          </div>
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Tallas Disponibles</h3>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes.map((size: string) => (
                <button
                  key={size} onClick={() => setSelectedSize(size)}
                  className={`h-12 rounded-xl border flex items-center justify-center text-base font-black transition-all ${
                    selectedSize === size ? "border-blue-500 bg-blue-500 text-white shadow-lg" : "border-gray-100 text-gray-700 bg-slate-50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description" className="border-slate-100">
            <AccordionTrigger className="text-gray-800 font-black text-sm uppercase tracking-widest">Descripción</AccordionTrigger>
            <AccordionContent className="text-gray-500 leading-relaxed text-sm">
              {product.description || "Nuestros productos están diseñados para brindar la mayor comodidad y estilo a los más pequeños."}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping" className="border-slate-100">
            <AccordionTrigger className="text-gray-800 font-black text-sm uppercase tracking-widest">Envíos</AccordionTrigger>
            <AccordionContent className="text-gray-500 leading-relaxed text-sm">
              <div className="flex items-center gap-2 mb-2"><Truck className="size-4 text-blue-500" /> <p>Envíos a todo el país.</p></div>
              <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-green-500" /> <p>Garantía de calidad Subibaja.</p></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-2xl z-50 rounded-t-[32px]">
        <Button 
          className="w-full h-16 bg-[#25D366] hover:bg-[#1ebd5b] text-white rounded-2xl gap-3 font-black text-lg shadow-xl shadow-green-100 transition-all active:scale-95"
          onClick={handleWhatsApp}
          disabled={product.stock_status !== 'in_stock'}
        >
          <MessageCircle className="size-6" /> 
          {product.stock_status === 'in_stock' ? 'Apartar por WhatsApp' : 'Agotado'}
        </Button>
      </div>
    </div>
  )
}
