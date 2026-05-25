"use client"
import { useState, useEffect } from "react"
import { ChevronLeft, Crown, Gift, Gift as GiftIcon, Loader2, Search, Sparkles, Star, Smartphone, Tag, User, CheckCircle2, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function LoyaltyPage() {
  const router = useRouter()
  
  // States for loyalty
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [member, setMember] = useState<any>(null)
  const [searchingMember, setSearchingMember] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [rewards, setRewards] = useState<any[]>([])
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  
  // States for gift card
  const [giftCode, setGiftCode] = useState("")
  const [giftCard, setGiftCard] = useState<any>(null)
  const [checkingGift, setCheckingGift] = useState(false)
  const [giftError, setGiftError] = useState("")

  useEffect(() => {
    fetchRewards()
  }, [])

  async function fetchRewards() {
    try {
      setLoadingRewards(true)
      const { data } = await supabase.from('rewards').select('*').eq('is_active', true).order('points_required', { ascending: true })
      if (data) setRewards(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingRewards(false)
    }
  }

  const handleCheckPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    try {
      setSearchingMember(true)
      setMember(null)
      setShowRegisterForm(false)
      const cleanPhone = phone.trim()
      const { data, error } = await supabase.from('loyalty_members').select('*').eq('phone', cleanPhone).single()
      
      if (data) {
        setMember(data)
      } else {
        setShowRegisterForm(true)
      }
    } catch (err) {
      console.error(err)
      setShowRegisterForm(true)
    } finally {
      setSearchingMember(false)
    }
  }

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim() || !name.trim()) return
    try {
      setRegistering(true)
      const { data, error } = await supabase.from('loyalty_members').insert([
        { phone: phone.trim(), name: name.trim(), points: 10 } // 10 welcome points!
      ]).select().single()
      
      if (data) {
        setMember(data)
        setShowRegisterForm(false)
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setRegistering(false)
    }
  }

  const handleCheckGiftCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!giftCode.trim()) return
    try {
      setCheckingGift(true)
      setGiftCard(null)
      setGiftError("")
      const { data, error } = await supabase.from('gift_cards').select('*').eq('code', giftCode.trim().toUpperCase()).single()
      if (data) {
        setGiftCard(data)
      } else {
        setGiftError("Código de tarjeta no válido o inactiva.")
      }
    } catch (err) {
      setGiftError("No se encontró la tarjeta de regalo.")
    } finally {
      setCheckingGift(false)
    }
  }

  const handleClaimReward = (reward: any) => {
    if (!member || member.points < reward.points_required) return
    const msg = `¡Hola Subibaja! Soy ${member.name} (Tlf: ${member.phone}) y me gustaría canjear mis puntos por el premio:\n\n*${reward.title}* (${reward.points_required} Puntos)\n\n¿Cómo procedemos con el canje?`
    window.open(`https://wa.me/584141234567?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleBuyGiftCard = (amount: number) => {
    const msg = `¡Hola Subibaja! Me gustaría comprar una Tarjeta de Regalo virtual de $${amount} para obsequiar.`
    window.open(`https://wa.me/584141234567?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Lato',sans-serif] pb-24">
      <div className="max-w-[430px] mx-auto relative">
        
        {/* Header con Glassmorphism */}
        <header className="bg-white/75 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100/50">
          <div className="w-full px-5 h-16 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 bg-slate-100 rounded-2xl active:scale-90 transition-transform"
            >
              <ChevronLeft className="size-5 text-gray-800" />
            </button>
            <h1 className="text-sm font-black text-blue-900 tracking-wider uppercase flex items-center gap-1.5 font-['Poppins']">
              <Crown className="size-4 text-amber-400 fill-amber-400" /> Club Subibaja
            </h1>
            <div className="w-9 h-9" /> {/* Spacer */}
          </div>
        </header>

        <main className="p-4 space-y-6">

          {/* ── CARD SECCIÓN FIDELIZACIÓN ── */}
          <section className="bg-white rounded-[32px] shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/50">
                <Crown className="size-5 fill-current" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-lg leading-tight font-['Poppins']">Consulta tus Puntos</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Club de Fidelidad</p>
              </div>
            </div>

            {!member ? (
              <form onSubmit={handleCheckPoints} className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ingresa tu número de teléfono registrado para consultar tu balance de puntos y reclamar premios exclusivos.
                </p>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Ej: 04141234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:border-blue-200 transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchingMember}
                  className="w-full h-11 rounded-full font-black tracking-widest text-blue-900 text-[10px] uppercase shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#BDE0FE' }}
                >
                  {searchingMember ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> CONSULTANDO...
                    </>
                  ) : (
                    'VER MIS PUNTOS'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-wider">Miembro del Club</p>
                    <h3 className="font-black text-slate-800 text-sm">{member.name}</h3>
                    <p className="text-[9px] text-slate-400 font-bold">{member.phone}</p>
                  </div>
                  <div className="text-right z-10">
                    <span className="text-3xl font-black text-blue-900 font-['Poppins']">{member.points}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">PUNTOS</span>
                  </div>
                  <Crown className="absolute -bottom-6 -right-6 size-24 text-blue-100/30 rotate-12 pointer-events-none" />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setMember(null)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-500 font-black text-[9px] tracking-wider uppercase active:scale-95 transition-transform"
                  >
                    Salir / Otro teléfono
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de registro rápido en caso de no existir */}
            {showRegisterForm && (
              <form onSubmit={handleRegisterMember} className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-blue-700">
                  <Star className="size-4 fill-blue-500 text-blue-500" />
                  <p className="text-xs font-black uppercase tracking-wider">¡Únete al Club!</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  No encontramos el teléfono <strong className="text-slate-800">{phone}</strong>. Regístrate ahora en 5 segundos y te obsequiaremos **10 puntos de bienvenida** automáticamente.
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 pl-11 pr-4 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-200 transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full h-10 rounded-xl font-black text-[9px] tracking-widest text-white uppercase bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {registering ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" /> REGISTRANDO...
                      </>
                    ) : (
                      'REGISTRARME Y GANAR 10 PTS'
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* ── SECCIÓN CATÁLOGO DE PREMIOS ── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <GiftIcon className="size-5 text-blue-500" />
              <h2 className="font-black text-slate-900 text-xl font-['Poppins'] tracking-tight">Catálogo de Premios</h2>
            </div>
            
            {loadingRewards ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-4 flex gap-4 animate-pulse">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-6 bg-slate-100 rounded-full w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rewards.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-400">
                <Ticket className="size-8 mx-auto mb-2 opacity-50 text-[#BDE0FE]" />
                <p className="text-xs font-semibold">No hay premios activos en este momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => {
                  const canClaim = member && member.points >= reward.points_required
                  return (
                    <div key={reward.id} className="bg-white rounded-3xl overflow-hidden shadow-sm p-4 flex gap-4 border border-slate-100/50 hover:border-blue-100 transition-colors">
                      {reward.image_url && (
                        <img
                          src={reward.image_url}
                          alt={reward.title}
                          className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 bg-slate-50 border border-slate-100"
                        />
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-black text-slate-800 text-xs leading-tight line-clamp-1">{reward.title}</h3>
                            <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0 border border-amber-100">
                              {reward.points_required} pts
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
                            {reward.description}
                          </p>
                        </div>
                        
                        <div className="pt-2">
                          {member ? (
                            <button
                              onClick={() => handleClaimReward(reward)}
                              disabled={!canClaim}
                              className={`h-7 px-4 rounded-full text-[9px] font-black tracking-wider uppercase transition-all active:scale-95 w-full flex items-center justify-center gap-1 ${
                                canClaim 
                                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
                                  : 'bg-slate-100 text-slate-350 cursor-not-allowed text-slate-400'
                              }`}
                            >
                              {canClaim ? (
                                <>
                                  <CheckCircle2 className="size-3" /> CANJEAR PREMIO
                                </>
                              ) : (
                                `FALTAN ${reward.points_required - member.points} PUNTOS`
                              )}
                            </button>
                          ) : (
                            <div className="h-7 border border-dashed border-slate-200 rounded-full flex items-center justify-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              CONSULTA TUS PUNTOS PARA CANJEAR
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── SECCIÓN TARJETAS DE REGALO HOLOGRÁFICAS ── */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Gift className="size-5 text-rose-400" />
              <h2 className="font-black text-slate-900 text-xl font-['Poppins'] tracking-tight">Tarjetas de Regalo</h2>
            </div>

            {/* Holographic Visual Card Demo */}
            <div className="relative aspect-[1.58/1] w-full rounded-[24px] overflow-hidden shadow-xl group border border-white/20" 
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              }}
            >
              {/* Hologram Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-blue-500/15 to-amber-500/10 mix-blend-overlay z-10" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-300/15 via-transparent to-transparent opacity-80" />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#BDE0FE] font-['Poppins']">Gift Card Virtual</span>
                    <h3 className="text-xl font-black font-['Playfair Display'] tracking-wide mt-1">Subibaja</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
                    <Sparkles className="size-5 text-amber-300 fill-amber-300" />
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Código de Activación</p>
                    <p className="text-xs font-black tracking-widest text-[#BDE0FE] font-mono mt-0.5">
                      {giftCard ? giftCard.code : 'SB-GIFT-••••'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Saldo Disponible</p>
                    <p className="text-2xl font-black font-['Poppins'] tracking-tight text-white mt-0.5">
                      {giftCard ? `$${Number(giftCard.balance).toFixed(2)}` : '$100.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Check Gift Card Balance Form */}
            <div className="bg-white rounded-[28px] shadow-sm p-5 space-y-3.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultar Saldo de Gift Card</p>
              <form onSubmit={handleCheckGiftCard} className="space-y-3">
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Código (Ej: SB-GIFT-100)"
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono font-bold focus:outline-none focus:border-blue-200 transition-colors placeholder:font-sans placeholder:font-normal"
                    required
                  />
                </div>
                {giftError && (
                  <p className="text-[10px] text-rose-500 font-bold pl-1">{giftError}</p>
                )}
                {giftCard && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center animate-fade-in">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Estado: Activa</span>
                    <span className="text-xs font-black text-emerald-700">Saldo: ${Number(giftCard.balance).toFixed(2)} USD</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={checkingGift}
                  className="w-full h-10 rounded-full font-black tracking-widest text-[#1e3a5f] text-[9px] uppercase shadow-sm transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: '#BDE0FE' }}
                >
                  {checkingGift ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> CONSULTANDO...
                    </>
                  ) : (
                    'VERIFICAR TARJETA'
                  )}
                </button>
              </form>
            </div>

            {/* Buy Gift Cards list */}
            <div className="bg-white rounded-[28px] shadow-sm p-5 space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Regala Estilo: Adquirir Tarjeta</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Selecciona el monto de la tarjeta de regalo virtual:</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 250].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleBuyGiftCard(val)}
                    className="h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shadow-xs transition-all hover:border-rose-100 hover:bg-rose-50/20 active:scale-95"
                  >
                    <span className="text-[10px] font-black text-slate-400">VALOR</span>
                    <span className="text-md font-black text-blue-900 font-['Poppins']">${val}</span>
                  </button>
                ))}
              </div>
            </div>

          </section>

        </main>

        {/* Navegación Inferior con Glassmorphism */}
        <nav 
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 rounded-t-[32px] shadow-2xl border-t border-white/20 bg-[#BDE0FE]/80 backdrop-blur-xl"
          style={{ 
            backgroundColor: 'rgba(189, 224, 254, 0.85)', 
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)' 
          }}
        >
          <div className="flex justify-around items-center h-[68px] px-4 pb-1">

            {/* Inicio */}
            <Link href="/" className="flex flex-col items-center gap-1 transition-opacity active:opacity-70">
              <div className="w-10 h-8 rounded-2xl flex items-center justify-center">
                <Star className="size-4 text-blue-900/60" />
              </div>
              <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Inicio</span>
            </Link>

            {/* Categorías */}
            <button className="flex flex-col items-center gap-1 transition-opacity active:opacity-70">
              <div className="w-10 h-8 rounded-2xl flex items-center justify-center">
                <Tag className="size-4 text-blue-900/60" />
              </div>
              <span className="text-[9px] font-bold text-blue-900/60 tracking-wide">Categorías</span>
            </button>

            {/* Club Puntos — activo */}
            <Link href="/puntos" className="flex flex-col items-center gap-1">
              <div className="w-10 h-8 rounded-2xl bg-white/30 flex items-center justify-center">
                <Crown className="size-4 text-blue-900" />
              </div>
              <span className="text-[9px] font-black text-blue-900 tracking-wide">Club Puntos</span>
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
