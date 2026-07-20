"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Sparkles, User, Smartphone, Mail, Loader2, Star, Crown, Ticket, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { fetchBCVRate } from "@/lib/bcv"

const GIFTCARDS_MOCK = [
  {
    amount: 50,
    title: "Classic Blue Edition",
    description: "El obsequio ideal para sorprender. Ideal para zapatos y accesorios de temporada.",
    gradient: "from-blue-600 to-indigo-900",
    badge: "MÁS COMPRADO",
    codePrefix: "SB-GIFT-50"
  },
  {
    amount: 100,
    title: "Rose Gold Edition",
    description: "Sorpresa perfecta para renovar por completo el outfit o calzado de gala.",
    gradient: "from-rose-500 via-pink-600 to-indigo-950",
    badge: "RECOMENDADO",
    codePrefix: "SB-GIFT-100"
  },
  {
    amount: 150,
    title: "Platinum Royal Edition",
    description: "El regalo definitivo de lujo. Libertad total para elegir múltiples prendas VIP.",
    gradient: "from-slate-800 via-slate-900 to-black",
    badge: "VIP PLATINUM",
    codePrefix: "SB-GIFT-150"
  }
]

export default function GiftCardPurchasePage() {
  const router = useRouter()
  const [selectedCard, setSelectedCard] = useState<typeof GIFTCARDS_MOCK[0] | null>(null)
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Retrieve exchange rate to display prices in Bs if needed
  const [exchangeRate, setExchangeRate] = useState(36.50)
  useEffect(() => {
    async function fetchRate() {
      const rate = await fetchBCVRate()
      setExchangeRate(rate)
    }
    fetchRate()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCard || !formData.name || !formData.phone || !formData.email) return

    try {
      setSubmitting(true)
      
      // Save order request to database
      const { error } = await supabase.from('gift_card_orders').insert([{
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        amount: selectedCard.amount,
        status: 'pending'
      }])

      if (error) throw error

      setSuccess(true)
      
      // Format WhatsApp Message
      const msg = `¡Hola Subibaja! Mi nombre es *${formData.name}* (Tlf: ${formData.phone}, Email: ${formData.email}) y me gustaría adquirir la Tarjeta de Regalo virtual de *$${selectedCard.amount} USD* (${selectedCard.title}). Ya registré mis datos en la web, ¿cómo puedo coordinar el pago?`
      
      // Delay redirect to WhatsApp for a better feedback experience
      setTimeout(() => {
        window.open(`https://wa.me/584142274385?text=${encodeURIComponent(msg)}`, '_blank')
        // Reset state
        setSelectedCard(null)
        setFormData({ name: "", phone: "", email: "" })
        setSuccess(false)
      }, 1500)

    } catch (err: any) {
      alert("Error al registrar tu solicitud: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Lato',sans-serif] pb-24">
      <div className="w-full max-w-[430px] md:max-w-4xl mx-auto relative md:px-4 md:py-6">
        
        {/* Header con Glassmorphism */}
        <header className="bg-white/75 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100/50">
          <div className="w-full px-5 h-16 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 bg-slate-100 rounded-2xl active:scale-90 transition-transform cursor-pointer"
              aria-label="Volver"
            >
              <ChevronLeft className="size-5 text-gray-800" />
            </button>
            <h1 className="text-sm font-black text-blue-900 tracking-wider uppercase flex items-center gap-1.5 font-['Poppins']">
              <Ticket className="size-4 text-blue-900" /> Tarjetas de Regalo
            </h1>
            <div className="w-9 h-9" /> {/* Spacer */}
          </div>
        </header>

        <main className="p-4 space-y-6">
          
          {/* Intro Text */}
          <div className="text-center space-y-1.5 px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Poppins']">El Regalo Perfecto</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Elige el monto, completa tus datos de contacto y coordina el pago por WhatsApp para activar e imprimir o enviar la Gift Card.
            </p>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {GIFTCARDS_MOCK.map((card) => {
              const amountBs = (card.amount * exchangeRate).toFixed(0)
              return (
                <div 
                  key={card.amount}
                  className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100/80 flex flex-col gap-4 transition-all duration-300 hover:shadow-md"
                >
                  {/* Virtual Card Graphic */}
                  <div className={`relative aspect-[1.58/1] w-full rounded-[24px] overflow-hidden shadow-lg border border-white/20 select-none bg-gradient-to-r ${card.gradient}`}>
                    
                    {/* Gloss / Holographic reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent mix-blend-overlay z-10" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute inset-0 p-5 flex flex-col justify-between text-white z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#8dd5e3] font-['Poppins']">Gift Card Virtual</span>
                          <h3 className="text-lg font-black font-['Poppins'] tracking-tight mt-0.5">Subibaja</h3>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
                          <Crown className="size-4 text-amber-300 fill-amber-300 animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Código temporal</p>
                          <p className="text-[10px] font-black tracking-widest text-[#8dd5e3] font-mono mt-0.5">{card.codePrefix}-••••</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Valor</p>
                          <p className="text-2xl font-black font-['Poppins'] tracking-tight text-white mt-0.5">${card.amount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Decorative glows */}
                    <div className="absolute -top-10 -left-10 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  </div>

                  {/* Info and Purchase Button */}
                  <div className="space-y-3 px-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[8px] font-black text-blue-500 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-100/30 uppercase tracking-wider">
                          {card.badge}
                        </span>
                        <h4 className="text-sm font-black text-slate-800 mt-1.5">{card.title}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-blue-900">${card.amount} USD</span>
                        <span className="text-[9px] text-slate-500 font-bold block">Bs {amountBs} BCV</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      {card.description}
                    </p>
                    <button
                      onClick={() => setSelectedCard(card)}
                      className="w-full h-11 rounded-full font-black tracking-widest text-blue-900 text-[10px] uppercase shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 hover:bg-[#a6d5ff] cursor-pointer"
                      style={{ backgroundColor: '#8dd5e3' }}
                    >
                      Solicitar Tarjeta de ${card.amount}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        </main>

        {/* Modal Form Overlay */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
              onClick={() => { if (!submitting && !success) setSelectedCard(null) }}
            />
            
            {/* Modal Card */}
            <div className="relative w-full max-w-[380px] bg-white rounded-[32px] overflow-hidden shadow-2xl p-6 border border-slate-100 flex flex-col gap-4 text-center z-10 transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-10">
              
              {success ? (
                <div className="py-6 flex flex-col items-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-blue-900 font-['Poppins']">¡Solicitud Registrada!</h3>
                    <p className="text-xs text-slate-400 font-semibold px-2">Abriendo chat de WhatsApp para completar el pago...</p>
                  </div>
                  <Loader2 className="size-5 animate-spin text-emerald-500 mt-2" />
                </div>
              ) : (
                <>
                  {/* Top Crown Graphic */}
                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 relative shadow-sm border border-blue-100/30">
                    <Crown className="size-6 fill-blue-100 text-blue-900" />
                    <Sparkles className="size-4 text-amber-400 fill-amber-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[8px] font-black tracking-widest text-[#8dd5e3] bg-blue-900 px-3 py-1 rounded-full uppercase inline-block">Confirmar Solicitud</span>
                    <h3 className="text-sm font-black text-blue-900 font-['Poppins'] tracking-tight mt-2 uppercase">
                      Gift Card ${selectedCard.amount} USD
                    </h3>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="text-left space-y-3 mt-1">
                    <p className="text-[11px] text-slate-400 leading-relaxed font-bold mb-1">
                      Por favor, registra tus datos de contacto. Serán vinculados a la tarjeta y mostrados en tu factura.
                    </p>
                    
                    <div className="space-y-3">
                      {/* Name */}
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold focus:outline-none focus:border-blue-200 transition-colors text-slate-700"
                          required
                          disabled={submitting}
                        />
                      </div>
                      
                      {/* Phone */}
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="Número de Teléfono"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold focus:outline-none focus:border-blue-200 transition-colors text-slate-700"
                          required
                          disabled={submitting}
                        />
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="Correo Electrónico"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold focus:outline-none focus:border-blue-200 transition-colors text-slate-700"
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedCard(null)}
                        className="flex-1 h-11 rounded-full border border-slate-200 text-slate-500 font-black text-[9px] tracking-wider uppercase active:scale-95 transition-transform cursor-pointer"
                        disabled={submitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[9px] uppercase shadow-sm active:scale-95 disabled:opacity-50 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ backgroundColor: '#8dd5e3' }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" /> PROCESANDO...
                          </>
                        ) : (
                          'COMPRAR'
                        )}
                      </button>
                    </div>

                  </form>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
