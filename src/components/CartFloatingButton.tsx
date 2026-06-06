"use client"
import { useState, useEffect } from "react"
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function CartFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(36.50)

  useEffect(() => {
    // Cargar carrito inicial
    loadCart()

    // Obtener tasa de cambio actual de Supabase
    const fetchRate = async () => {
      try {
        const { data } = await supabase.from('settings').select('*').eq('id', 'exchange_rate').single()
        if (data) setExchangeRate(data.value)
      } catch (e) {
        console.error("Error al obtener tasa de cambio:", e)
      }
    }
    fetchRate()

    // Escuchar eventos de actualización de carrito
    window.addEventListener('cart-updated', loadCart)
    return () => window.removeEventListener('cart-updated', loadCart)
  }, [])

  const loadCart = () => {
    const saved = localStorage.getItem('subibaja_cart')
    if (saved) {
      try {
        setCart(JSON.parse(saved))
      } catch (e) {
        console.error("Error al parsear carrito:", e)
      }
    } else {
      setCart([])
    }
  }

  const updateQuantity = (idx: number, delta: number) => {
    const next = [...cart]
    next[idx].quantity = Math.max(1, next[idx].quantity + delta)
    setCart(next)
    localStorage.setItem('subibaja_cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const removeItem = (idx: number) => {
    const next = cart.filter((_, i) => i !== idx)
    setCart(next)
    localStorage.setItem('subibaja_cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleCheckout = () => {
    if (cart.length === 0) return
    const totalUsd = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const totalBs = (totalUsd * exchangeRate).toFixed(0)

    let itemsText = ""
    cart.forEach((item, index) => {
      const sizeText = item.size ? ` (Talla: ${item.size})` : ""
      const colorText = item.color ? ` (Color: ${item.color})` : ""
      itemsText += `${index + 1}. *${item.quantity}x ${item.title}*${sizeText}${colorText} - $${item.price} c/u\n`
    })

    const msg = `¡Hola Subibaja! Me gustaría realizar un pedido con los siguientes artículos:\n\n${itemsText}\n*Total:* $${totalUsd.toFixed(2)} (${totalBs} Bs)\n\n¿Tienen disponibilidad para coordinar el pago y entrega?`
    window.open(`https://wa.me/584142274385?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0)
  const totalUsd = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalBs = (totalUsd * exchangeRate).toFixed(0)

  return (
    <>
      {/* Botón flotante centrado respecto al viewport móvil de 430px */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 pointer-events-none px-5 flex justify-end">
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto size-14 rounded-full shadow-2xl flex items-center justify-center relative transition-transform active:scale-95 cursor-pointer border border-white/20"
          style={{ 
            backgroundColor: '#BDE0FE', 
            color: '#1e3a5f' 
          }}
          aria-label="Abrir Carrito"
        >
          <ShoppingCart className="size-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] size-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Drawer deslizante del Carrito */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in no-print">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          
          <div 
            className="relative w-full max-w-[430px] bg-white rounded-t-[36px] shadow-2xl p-6 pb-10 flex flex-col max-h-[85vh] z-10 transition-transform duration-300 translate-y-0"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            {/* Header del Drawer */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg font-['Poppins'] flex items-center gap-2">
                  <ShoppingCart className="size-5 text-blue-900" /> Mi Pedido
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Revisa y completa tu compra
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Lista de productos en el carrito */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar min-h-[150px] max-h-[45vh]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <ShoppingBag className="size-12 mb-3 opacity-45 text-blue-300" />
                  <p className="text-xs font-bold uppercase tracking-wide">Tu carrito está vacío</p>
                  <p className="text-[10px] text-slate-350 mt-1">¡Navega por la boutique y añade tus favoritos!</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-3xl transition-colors hover:border-blue-100/50">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 bg-slate-100 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-slate-800 text-xs truncate leading-snug">{item.title}</h4>
                          <button 
                            onClick={() => removeItem(idx)}
                            className="text-slate-300 hover:text-rose-500 active:scale-90 transition-colors p-1"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.size && (
                            <span className="text-[8px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40 uppercase">
                              Talla: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40">
                              <span className="text-[8px] font-black text-slate-500 uppercase">Color:</span>
                              <div className="size-2 rounded-full border border-white shadow-xs" style={{ backgroundColor: item.color }} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Selector de cantidad */}
                        <div className="flex items-center gap-2.5 bg-white border border-slate-200/60 rounded-xl px-2 py-1 shadow-2xs">
                          <button 
                            onClick={() => updateQuantity(idx, -1)}
                            className="text-slate-400 hover:text-blue-900 active:scale-75 p-0.5 cursor-pointer"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="text-[11px] font-black text-slate-800 w-3 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(idx, 1)}
                            className="text-slate-400 hover:text-blue-900 active:scale-75 p-0.5 cursor-pointer"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="text-xs font-black text-blue-900 font-['Poppins']">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Resumen del pedido y botón WhatsApp */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Pedido</span>
                    <span className="text-2xl font-black text-blue-900 font-['Poppins'] leading-none">
                      ${totalUsd.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Equivalente</span>
                    <span className="text-sm font-bold text-slate-400 font-['Poppins']">
                      {totalBs} Bs
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full h-12 rounded-full font-black tracking-widest text-blue-900 text-[10px] uppercase shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: '#BDE0FE' }}
                >
                  <ShoppingCart className="size-4" /> CONFIRMAR PEDIDO VÍA WHATSAPP
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
