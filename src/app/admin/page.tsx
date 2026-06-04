"use client"
import { useState, useEffect, useRef } from "react"
import {
  Camera, Package, Loader2, Lock, DollarSign, RefreshCcw, Wallet, Banknote,
  Type, Ruler, Info, Search, X, Plus, ChevronDown, Palette, Smartphone, Ticket,
  Footprints, Shirt, Star, ShoppingBag, Heart, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const ADMIN_PASSWORD = "SUBIBAJA2024"
const CAT_ICONS: Record<string, React.ElementType> = {
  Footprints, Shirt, Star, ShoppingBag, Heart, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  const [products, setProducts] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "", price: "", category: "Zapatos", sizes: "",
    image_url: "", stock_quantity: "10", description: ""
  })
  const [selectedSubCat, setSelectedSubCat] = useState<any>(null)
  const [selectedLeafCat, setSelectedLeafCat] = useState<any>(null)
  const [showSubDropdown, setShowSubDropdown] = useState(false)
  const [showLeafDropdown, setShowLeafDropdown] = useState(false)
  const [colors, setColors] = useState<string[]>([])
  const [colorPick, setColorPick] = useState("#BDE0FE")
  const [saleForm, setSaleForm] = useState({
    productId: "", productTitle: "", productCategory: "",
    amount: "", method: "$ Efectivo"
  })
  const [productSearch, setProductSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const [showNewCatForm, setShowNewCatForm] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("Tag")
  const [newCatParentId, setNewCatParentId] = useState("")
  const [savingCat, setSavingCat] = useState(false)
  
  // Loyalty and Gift card state variables
  const [customerPhone, setCustomerPhone] = useState("")
  const [loyaltyMembers, setLoyaltyMembers] = useState<any[]>([])
  const [rewardForm, setRewardForm] = useState({ title: "", description: "", pointsRequired: "", image_url: "" })
  const [giftCardForm, setGiftCardForm] = useState({ code: "", balance: "" })
  const [savingReward, setSavingReward] = useState(false)
  const [savingGift, setSavingGift] = useState(false)
  const [rewards, setRewards] = useState<any[]>([])
  const [uploadingRewardImg, setUploadingRewardImg] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const catDropdownRef = useRef<HTMLDivElement>(null)

  const mainCategories = categories.filter(c => !c.parent_id)
  const currentMainCat = categories.find(c => c.name === formData.category && !c.parent_id)
  const subCategories = currentMainCat ? categories.filter(c => c.parent_id === currentMainCat.id) : []
  const leafCategories = selectedSubCat ? categories.filter(c => c.parent_id === selectedSubCat.id) : []

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('adminAuth', 'true')
      fetchInitialData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') === 'true') setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setShowCatDropdown(false)
        setShowSubDropdown(false)
        setShowLeafDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchInitialData() {
    try {
      setLoading(true)
      const { data: settings } = await supabase.from('settings').select('*').eq('id', 'exchange_rate').single()
      if (settings) setExchangeRate(settings.value)
      const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: false })
      if (salesData) setSales(salesData)
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
      if (cats) {
        setCategories(cats)
        if (cats.length > 0 && !formData.category) {
          const mainCats = cats.filter(c => !c.parent_id)
          if (mainCats.length > 0) setFormData(f => ({ ...f, category: mainCats[0].name }))
        }
      }
      
      // Fetch loyalty members and rewards
      const { data: members } = await supabase.from('loyalty_members').select('*').order('created_at', { ascending: false })
      if (members) setLoyaltyMembers(members)
      const { data: rewardsData } = await supabase.from('rewards').select('*').order('created_at', { ascending: false })
      if (rewardsData) setRewards(rewardsData)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleSaveReward = async () => {
    if (!rewardForm.title || !rewardForm.pointsRequired || !rewardForm.image_url) { alert("Faltan datos del premio"); return }
    try {
      setSavingReward(true)
      await supabase.from('rewards').insert([{
        title: rewardForm.title,
        description: rewardForm.description,
        points_required: parseInt(rewardForm.pointsRequired),
        image_url: rewardForm.image_url,
        is_active: true
      }])
      setRewardForm({ title: "", description: "", pointsRequired: "", image_url: "" })
      fetchInitialData()
      alert("¡Premio publicado en el catálogo!")
    } catch (err: any) { alert(err.message) } finally { setSavingReward(false) }
  }

  const handleCreateGiftCard = async () => {
    if (!giftCardForm.code || !giftCardForm.balance) { alert("Faltan datos de tarjeta"); return }
    try {
      setSavingGift(true)
      await supabase.from('gift_cards').insert([{
        code: giftCardForm.code.trim().toUpperCase(),
        balance: parseFloat(giftCardForm.balance),
        initial_value: parseFloat(giftCardForm.balance),
        is_active: true
      }])
      setGiftCardForm({ code: "", balance: "" })
      alert("¡Tarjeta de regalo creada con éxito!")
    } catch (err: any) { alert(err.message) } finally { setSavingGift(false) }
  }

  const generateRandomGiftCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = "SB-"
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGiftCardForm({ ...giftCardForm, code })
  }

  const handleRewardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploadingRewardImg(true)
      const fileName = `rewards_${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`products/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${fileName}`)
      setRewardForm(prev => ({ ...prev, image_url: data.publicUrl }))
    } catch (err: any) {
      alert(err.message || 'Error al subir imagen del premio')
    } finally {
      setUploadingRewardImg(false)
    }
  }

  async function handleSaveCategory() {
    if (!newCatName.trim()) return
    try {
      setSavingCat(true)
      const insertData: any = { name: newCatName.trim(), icon: newCatIcon }
      if (newCatParentId) insertData.parent_id = newCatParentId
      await supabase.from('categories').insert([insertData])
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
      if (cats) setCategories(cats)
      if (!newCatParentId) {
        setFormData(f => ({ ...f, category: newCatName.trim() }))
        setSelectedSubCat(null)
        setSelectedLeafCat(null)
      }
      setNewCatName("")
      setNewCatIcon("Tag")
      setNewCatParentId("")
      setShowNewCatForm(false)
    } catch (err: any) { alert(err.message) } finally { setSavingCat(false) }
  }

  const updateExchangeRate = async (val: string) => {
    const rate = parseFloat(val) || 0
    setExchangeRate(rate)
    await supabase.from('settings').update({ value: rate }).eq('id', 'exchange_rate')
  }

  const selectProduct = (p: any) => {
    setSaleForm({ ...saleForm, productId: p.id, productTitle: p.title, productCategory: p.category, amount: p.price.toString() })
    setProductSearch(p.title)
    setShowDropdown(false)
  }

  const clearProductSelection = () => {
    setSaleForm({ ...saleForm, productId: "", productTitle: "", productCategory: "", amount: "" })
    setProductSearch("")
  }

  const handleRegisterSale = async () => {
    if (!saleForm.amount) return
    try {
      const amountUsd = parseFloat(saleForm.amount)
      await supabase.from('sales').insert([{
        amount_usd: amountUsd,
        amount_bs: amountUsd * exchangeRate,
        payment_method: saleForm.method,
        exchange_rate: exchangeRate,
        product_id: saleForm.productId || null,
        product_title: saleForm.productTitle || null,
        category: saleForm.productCategory || null,
      }])
      if (saleForm.productId) {
        const prod = products.find(p => p.id === saleForm.productId)
        if (prod) {
          const newQty = Math.max(0, (prod.stock_quantity || 0) - 1)
          await supabase.from('products').update({
            stock_quantity: newQty,
            stock_status: newQty === 0 ? 'out_of_stock' : 'in_stock'
          }).eq('id', saleForm.productId)
        }
      }

      // Award points if customer is registered in loyalty club
      if (customerPhone.trim()) {
        const cleanPhone = customerPhone.trim()
        const { data: member } = await supabase.from('loyalty_members').select('*').eq('phone', cleanPhone).single()
        if (member) {
          const pointsEarned = Math.round(amountUsd)
          await supabase.from('loyalty_members').update({ points: member.points + pointsEarned }).eq('id', member.id)
          alert(`¡Venta registrada! Se sumaron ${pointsEarned} puntos al programa VIP de ${member.name}.`)
        } else {
          alert("Venta registrada. El teléfono ingresado no está registrado en el programa Clientes VIP.")
        }
      }

      setSaleForm({ productId: "", productTitle: "", productCategory: "", amount: "", method: "$ Efectivo" })
      setCustomerPhone("")
      setProductSearch("")
      fetchInitialData()
    } catch (err) { console.error(err) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`products/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${fileName}`)
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }))
    } catch (err: any) {
      alert(err.message || 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const getSelectedCategoryId = () => {
    if (selectedLeafCat) return selectedLeafCat.id
    if (selectedSubCat) return selectedSubCat.id
    const mainCat = categories.find(c => c.name === formData.category && !c.parent_id)
    return mainCat ? mainCat.id : null
  }

  const handleSaveProduct = async () => {
    if (!formData.title || !formData.price || !formData.image_url) { alert("Faltan datos"); return }
    try {
      setSaving(true)
      await supabase.from('products').insert([{
        title: formData.title, price: parseFloat(formData.price),
        category: formData.category,
        category_id: getSelectedCategoryId(),
        image_url: formData.image_url,
        description: formData.description,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors,
        stock_quantity: parseInt(formData.stock_quantity), stock_status: 'in_stock'
      }])
      setFormData({ title: "", price: "", category: "Zapatos", sizes: "", image_url: "", stock_quantity: "10", description: "" })
      setSelectedSubCat(null)
      setSelectedLeafCat(null)
      setColors([])
      setColorPick("#BDE0FE")
      fetchInitialData()
      setActiveTab("inventory")
    } catch (err: any) { alert(err.message) } finally { setSaving(false) }
  }

  const kpis = {
    totalUsd: sales.reduce((acc, s) => acc + Number(s.amount_usd), 0),
    cash: sales.filter(s => s.payment_method === '$ Efectivo').reduce((acc, s) => acc + Number(s.amount_usd), 0),
    zelle: sales.filter(s => s.payment_method === 'Zelle').reduce((acc, s) => acc + Number(s.amount_usd), 0),
    pagoMovil: sales.filter(s => s.payment_method === 'Pago Móvil (Bs)').reduce((acc, s) => acc + Number(s.amount_bs), 0),
  }

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) && p.stock_status === 'in_stock'
  ).slice(0, 6)

  // ── LOGIN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-[40px] shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#BDE0FE' }}>
              <Lock className="text-blue-900 size-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-['Poppins']">Business OS</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (password === ADMIN_PASSWORD) setIsAuthenticated(true); else alert("Contraseña incorrecta") }} className="space-y-4">
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl text-center text-lg bg-slate-50 border-0" />
            <button type="submit" className="w-full rounded-full font-bold tracking-widest text-blue-900" style={{ height: '44px', backgroundColor: '#BDE0FE' }}>
              ENTRAR
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Lato',sans-serif] pb-24">

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-2xl sticky top-0 z-40 px-6 py-4 border-b border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Administración</p>
            <h1 className="text-xl font-black text-slate-900 font-['Poppins']">Subibaja OS</h1>
          </div>
          <div className="px-3 py-1.5 rounded-2xl border border-blue-100 flex items-center gap-1.5" style={{ backgroundColor: '#BDE0FE20' }}>
            <span className="text-[9px] font-black text-blue-500 uppercase">Bs</span>
            <input type="number" value={exchangeRate} onChange={(e) => updateExchangeRate(e.target.value)} className="w-12 bg-transparent font-black text-blue-700 outline-none text-sm" />
          </div>
        </div>
        <div className="bg-slate-100/80 p-1 rounded-2xl flex gap-1">
          {['dashboard', 'inventory', 'upload', 'club'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>
              {tab === 'dashboard' ? 'Ventas' : tab === 'inventory' ? 'Stock' : tab === 'upload' ? 'Cargar' : 'Club'}
            </button>
          ))}
          <Link href="/admin/dashboard" className="flex-1">
            <button className="w-full py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest text-blue-900"
              style={{ backgroundColor: '#BDE0FE' }}>
              Panel
            </button>
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* ── TAB VENTAS ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">

            {/* KPIs */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 relative overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Caja Total</p>
              <p className="text-4xl font-black text-slate-900 font-['Poppins']">${kpis.totalUsd.toFixed(2)}</p>
              <DollarSign className="absolute -bottom-4 -right-4 size-32 text-slate-50" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Banknote className="size-4 text-emerald-500 mx-auto mb-1.5" />, label: 'Efectivo', val: `$${kpis.cash.toFixed(2)}` },
                { icon: <RefreshCcw className="size-4 text-sky-500 mx-auto mb-1.5" />, label: 'Zelle', val: `$${kpis.zelle.toFixed(2)}` },
                { icon: <Wallet className="size-4 text-indigo-500 mx-auto mb-1.5" />, label: 'P. Móvil', val: `${kpis.pagoMovil.toFixed(0)} Bs` },
              ].map(k => (
                <div key={k.label} className="bg-white p-3 rounded-[28px] shadow-sm text-center">
                  {k.icon}
                  <p className="text-[8px] font-black text-slate-400 uppercase">{k.label}</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">{k.val}</p>
                </div>
              ))}
            </div>

            {/* Formulario de venta con buscador de producto */}
            <div className="bg-white rounded-[32px] shadow-sm p-5 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrar Venta</p>

              {/* Buscador de producto */}
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowDropdown(true) }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full h-12 rounded-xl bg-slate-50 pl-11 pr-10 text-sm font-medium outline-none border-0 placeholder:text-slate-300"
                  />
                  {productSearch && (
                    <button onClick={clearProductSelection} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="size-4 text-slate-300" />
                    </button>
                  )}
                </div>
                {showDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100">
                    {filteredProducts.map(p => (
                      <button key={p.id} onClick={() => selectProduct(p)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left">
                        <img src={p.image_url} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 line-clamp-1">{p.title}</p>
                          <p className="text-[10px] font-black text-blue-500 mt-0.5">${p.price} · Stock: {p.stock_quantity}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Monto + Método */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                  <Input placeholder="Monto" type="number" value={saleForm.amount}
                    onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-0 font-bold pl-9" />
                </div>
                <Select onValueChange={(v) => setSaleForm({ ...saleForm, method: v ?? "$ Efectivo" })} defaultValue="$ Efectivo">
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 font-bold text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="$ Efectivo">$ Efectivo</SelectItem>
                    <SelectItem value="Zelle">Zelle</SelectItem>
                    <SelectItem value="Pago Móvil (Bs)">P. Móvil (Bs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Teléfono Cliente para Club Puntos */}
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Teléfono Cliente (Opcional - Club Puntos)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-12 rounded-xl bg-slate-50 pl-11 pr-4 text-xs font-semibold outline-none border-0 placeholder:text-slate-300 text-slate-700"
                />
              </div>

              <button onClick={handleRegisterSale} disabled={!saleForm.amount}
                className="w-full rounded-full font-bold tracking-widest text-blue-900 disabled:opacity-40 transition-transform active:scale-95"
                style={{ height: '44px', backgroundColor: '#BDE0FE' }}>
                REGISTRAR VENTA
              </button>
            </div>

            {/* Últimas ventas */}
            {sales.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Últimas ventas</p>
                {sales.slice(0, 8).map(s => (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700 line-clamp-1">{s.product_title || 'Venta manual'}</p>
                      <p className="text-[10px] text-slate-400">{s.payment_method} · {new Date(s.created_at).toLocaleDateString('es-VE')}</p>
                    </div>
                    <p className="text-sm font-black text-blue-900">${Number(s.amount_usd).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB STOCK ── */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-slate-300" /></div>
            ) : products.map(product => (
              <div key={product.id} className="bg-white rounded-[28px] shadow-sm p-4 flex items-center gap-4">
                <img src={product.image_url} className="size-14 rounded-2xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-sm line-clamp-1">{product.title}</h4>
                  <p className="text-xs font-black text-blue-500">${product.price}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {(product.stock_quantity ?? 0) <= 3 && (
                      <span className="animate-pulse bg-red-50 text-rose-500 px-2 py-0.5 rounded-full font-black text-[8px] tracking-wide border border-rose-100">
                        STOCK BAJO
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${(product.stock_quantity || 0) > 3 ? 'bg-sky-50 text-sky-600' : 'bg-orange-50 text-orange-500'}`}>
                      {product.stock_quantity ?? 0}
                    </span>
                  </div>
                  <Switch checked={product.stock_status === 'in_stock'} className="scale-75"
                    onCheckedChange={async (v) => {
                      await supabase.from('products').update({ stock_status: v ? 'in_stock' : 'out_of_stock' }).eq('id', product.id)
                      fetchInitialData()
                    }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB CARGAR ── */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-[40px] shadow-sm">
            <div className="p-7 space-y-7">
              <div className="relative border-2 border-dashed border-slate-100 rounded-[32px] p-10 bg-slate-50 flex flex-col items-center justify-center aspect-video overflow-hidden">
                {formData.image_url ? (
                  <img src={formData.image_url} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-3xl shadow-sm mb-3"><Camera className="text-blue-400 size-7" /></div>
                    <span className="text-slate-500 font-bold text-sm">Toca para subir foto</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                {uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-blue-400 size-8" /></div>}
              </div>

              <div className="space-y-5">
                {[
                  { label: 'Nombre', icon: <Type className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />, key: 'title', placeholder: 'Ej: Zapato Gala', type: 'text' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</Label>
                    <div className="relative">{f.icon}<Input placeholder={f.placeholder} type={f.type} value={(formData as any)[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-bold" /></div>
                  </div>
                ))}

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</Label>
                  <div className="relative">
                    <Info className="absolute left-4 top-4 size-4 text-slate-300" />
                    <textarea placeholder="Detalles del producto..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full min-h-[100px] rounded-2xl bg-slate-50 border-0 pl-12 pt-3.5 font-medium text-sm outline-none resize-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio $</Label>
                    <div className="relative"><DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input type="number" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-black" /></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</Label>
                    <div className="relative"><Package className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-black" /></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tallas (separadas por coma)</Label>
                  <div className="relative"><Ruler className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input placeholder="24, 25, 26" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-medium" /></div>
                </div>

                {/* Colores */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Colores disponibles</Label>
                    <span className="text-[8px] text-slate-450 font-bold uppercase">Haz clic para agregar o eliminar</span>
                  </div>

                  {/* Preajustes Rápidos */}
                  <div className="flex gap-2 items-center flex-wrap px-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Preajustes:</span>
                    {[
                      { hex: '#FFFFFF', name: 'Blanco' },
                      { hex: '#000000', name: 'Negro' },
                      { hex: '#BDE0FE', name: 'Celeste' },
                      { hex: '#FAD2E1', name: 'Rosa' },
                      { hex: '#F5F5DC', name: 'Beige' },
                      { hex: '#FEF08A', name: 'Dorado' },
                      { hex: '#E2E8F0', name: 'Plata' },
                      { hex: '#F87171', name: 'Rojo' },
                    ].map(preset => {
                      const isSelected = colorPick.toLowerCase() === preset.hex.toLowerCase()
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setColorPick(preset.hex)}
                          title={preset.name}
                          className={`size-6 rounded-full border transition-all active:scale-90 cursor-pointer ${
                            isSelected ? 'ring-2 ring-offset-1 ring-blue-500 border-blue-500 scale-105 shadow-sm' : 'border-slate-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        />
                      )
                    })}
                  </div>

                  {/* Selector y Botón Agregar */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-24 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-colors">
                      <Palette className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none z-10" />
                      
                      {/* Círculo de color que muestra la selección actual */}
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm ml-6 flex-shrink-0" style={{ backgroundColor: colorPick }} />
                      
                      {/* Input oculto que abarca todo el botón para abrir el selector nativo al tocar */}
                      <input
                        type="color"
                        value={colorPick}
                        onChange={e => setColorPick(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => { if (!colors.includes(colorPick)) setColors([...colors, colorPick]) }}
                      className="h-14 flex-1 rounded-2xl font-black text-[10px] tracking-[0.12em] transition-all active:scale-95 shadow-xs cursor-pointer"
                      style={{ backgroundColor: '#BDE0FE', color: '#1e3a5f' }}
                    >
                      + AGREGAR COLOR
                    </button>
                  </div>

                  {/* Listado de colores agregados */}
                  {colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1.5 px-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50">
                      {colors.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColors(colors.filter(x => x !== c))}
                          title="Click para eliminar"
                          className="flex items-center gap-2 h-8 pl-2 pr-3.5 rounded-full border bg-white text-[9px] font-black transition-transform active:scale-95 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-3xs cursor-pointer group"
                          style={{ borderColor: c }}
                        >
                          <div className="w-3.5 h-3.5 rounded-full shadow-2xs group-hover:scale-90 transition-transform" style={{ backgroundColor: c }} />
                          <span className="text-slate-500 group-hover:text-rose-600 font-mono text-[8px] uppercase">{c}</span>
                          <X className="size-2.5 text-slate-400 group-hover:text-rose-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría Principal</Label>
                  <div className="relative" ref={catDropdownRef}>
                    {/* Trigger */}
                    <button
                      type="button"
                      onClick={() => { setShowCatDropdown(v => !v); setShowNewCatForm(false); setShowSubDropdown(false); setShowLeafDropdown(false) }}
                      className="w-full h-14 rounded-2xl bg-slate-50 px-5 flex items-center justify-between font-bold text-sm text-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const cat = mainCategories.find(c => c.name === formData.category)
                          const IconComp = cat ? (CAT_ICONS[cat.icon] || Tag) : Tag
                          return <><IconComp className="size-4 text-blue-400" /><span>{formData.category || 'Selecciona categoría'}</span></>
                        })()}
                      </div>
                      <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${showCatDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown list */}
                    {showCatDropdown && (
                      <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100">
                        {mainCategories.map(cat => {
                          const IconComp = CAT_ICONS[cat.icon] || Tag
                          return (
                            <button key={cat.id} type="button"
                              onClick={() => {
                                setFormData({ ...formData, category: cat.name });
                                setSelectedSubCat(null);
                                setSelectedLeafCat(null);
                                setShowCatDropdown(false);
                              }}
                              className={`w-full px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${formData.category === cat.name ? 'bg-blue-50' : ''}`}
                            >
                              <IconComp className="size-4 text-blue-400 flex-shrink-0" />
                              <span className="text-sm font-bold text-slate-700 flex-1">{cat.name}</span>
                              {formData.category === cat.name && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                            </button>
                          )
                        })}
                        <div className="border-t border-slate-100">
                          <button type="button"
                            onClick={() => { setShowNewCatForm(v => !v); setShowCatDropdown(false) }}
                            className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-blue-500"
                          >
                            <Plus className="size-4 flex-shrink-0" />
                            <span className="text-sm font-bold">Nueva Categoría</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline new-category form */}
                    {showNewCatForm && (
                      <div className="mt-2 bg-white rounded-2xl border border-slate-100 shadow-lg p-4 space-y-4">
                        <input
                          placeholder="Nombre de categoría..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="w-full h-12 rounded-xl bg-slate-50 border-0 px-4 font-bold text-sm outline-none placeholder:text-slate-300"
                        />
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pertenece a (Opcional)</p>
                          <select
                            value={newCatParentId}
                            onChange={(e) => setNewCatParentId(e.target.value)}
                            className="w-full h-11 rounded-xl bg-slate-50 border-0 px-3 font-semibold text-xs text-slate-700 outline-none"
                          >
                            <option value="">Ninguna (Categoría Principal)</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.parent_id ? `  └─ ${c.name}` : c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Elige un icono</p>
                          <div className="grid grid-cols-6 gap-2">
                            {Object.entries(CAT_ICONS).map(([name, IconComp]) => (
                              <button key={name} type="button"
                                onClick={() => setNewCatIcon(name)}
                                className="h-9 rounded-xl flex items-center justify-center transition-all"
                                style={newCatIcon === name
                                  ? { backgroundColor: '#BDE0FE', color: '#1e3a5f' }
                                  : { backgroundColor: '#f8fafc', color: '#cbd5e1' }}
                              >
                                <IconComp className="size-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <button type="button" onClick={handleSaveCategory}
                          disabled={!newCatName.trim() || savingCat}
                          className="w-full h-11 rounded-full font-black tracking-widest text-blue-900 text-[10px] disabled:opacity-40 transition-transform active:scale-95"
                          style={{ backgroundColor: '#BDE0FE' }}>
                          {savingCat ? 'GUARDANDO...' : 'GUARDAR CATEGORÍA'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subcategory Level 2 */}
                {subCategories.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subcategoría</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setShowSubDropdown(v => !v); setShowLeafDropdown(false); setShowCatDropdown(false) }}
                        className="w-full h-14 rounded-2xl bg-slate-50 px-5 flex items-center justify-between font-bold text-sm text-slate-700"
                      >
                        <span className="truncate">{selectedSubCat ? selectedSubCat.name : 'Selecciona subcategoría'}</span>
                        <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${showSubDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showSubDropdown && (
                        <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100 max-h-60 overflow-y-auto">
                          {subCategories.map(sub => (
                            <button key={sub.id} type="button"
                              onClick={() => {
                                setSelectedSubCat(sub);
                                setSelectedLeafCat(null);
                                setShowSubDropdown(false);
                              }}
                              className={`w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left ${selectedSubCat?.id === sub.id ? 'bg-blue-50' : ''}`}
                            >
                              <span className="text-sm font-bold text-slate-700">{sub.name}</span>
                              {selectedSubCat?.id === sub.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Leaf Category / Type Level 3 */}
                {selectedSubCat && leafCategories.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Producto</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setShowLeafDropdown(v => !v); setShowSubDropdown(false); setShowCatDropdown(false) }}
                        className="w-full h-14 rounded-2xl bg-slate-50 px-5 flex items-center justify-between font-bold text-sm text-slate-700"
                      >
                        <span className="truncate">{selectedLeafCat ? selectedLeafCat.name : 'Selecciona tipo'}</span>
                        <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${showLeafDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showLeafDropdown && (
                        <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100 max-h-60 overflow-y-auto">
                          {leafCategories.map(leaf => (
                            <button key={leaf.id} type="button"
                              onClick={() => {
                                setSelectedLeafCat(leaf);
                                setShowLeafDropdown(false);
                              }}
                              className={`w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left ${selectedLeafCat?.id === leaf.id ? 'bg-blue-50' : ''}`}
                            >
                              <span className="text-sm font-bold text-slate-700">{leaf.name}</span>
                              {selectedLeafCat?.id === leaf.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleSaveProduct} disabled={saving || uploading}
                className="w-full rounded-full font-black tracking-widest text-blue-900 disabled:opacity-40 transition-transform active:scale-95"
                style={{ height: '56px', backgroundColor: '#BDE0FE', fontSize: '12px' }}>
                {saving ? 'PUBLICANDO...' : 'PUBLICAR PRODUCTO'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB CLUB ── */}
        {activeTab === 'club' && (
          <div className="space-y-6 animate-fade-in">

            {/* Generar Tarjeta de Regalo */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Ticket className="size-5 text-blue-400" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Generar Tarjeta de Regalo</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350" />
                    <Input
                      placeholder="Código (Ej: SB-REGALO-100)"
                      value={giftCardForm.code}
                      onChange={(e) => setGiftCardForm({ ...giftCardForm, code: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-0 pl-11 font-mono font-bold text-xs uppercase"
                    />
                  </div>
                  <button
                    onClick={generateRandomGiftCode}
                    className="px-3 rounded-xl border border-slate-200 text-[10px] font-black tracking-wider uppercase text-slate-505 hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                  >
                    🎲 Aleatorio
                  </button>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350" />
                  <Input
                    placeholder="Monto USD inicial"
                    type="number"
                    value={giftCardForm.balance}
                    onChange={(e) => setGiftCardForm({ ...giftCardForm, balance: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-0 pl-11 font-black text-xs"
                  />
                </div>
                <button
                  onClick={handleCreateGiftCard}
                  disabled={savingGift || !giftCardForm.code || !giftCardForm.balance}
                  className="w-full h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm active:scale-95 disabled:opacity-50 transition-transform cursor-pointer"
                  style={{ backgroundColor: '#BDE0FE' }}
                >
                  {savingGift ? 'GENERANDO...' : 'CREAR TARJETA DE REGALO'}
                </button>
              </div>
            </div>

            {/* Registrar Premio del Club */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="size-5 text-blue-400" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Publicar Premio del Club</h3>
              </div>
              <div className="space-y-4">
                {/* Reward Image Upload */}
                <div className="relative border-2 border-dashed border-slate-100 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center aspect-video overflow-hidden">
                  {rewardForm.image_url ? (
                    <img src={rewardForm.image_url} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="bg-white p-3 rounded-2xl shadow-xs mb-2"><Camera className="text-blue-400 size-5" /></div>
                      <span className="text-slate-400 font-bold text-xs">Foto del Premio</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleRewardImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingRewardImg} />
                  {uploadingRewardImg && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin text-blue-400 size-6" /></div>}
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                    <Input
                      placeholder="Título del Premio (Ej: Lazo de regalo)"
                      value={rewardForm.title}
                      onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-0 pl-11 text-xs font-semibold text-slate-700"
                    />
                  </div>
                  <div className="relative">
                    <Info className="absolute left-4 top-4 size-4 text-slate-350 pointer-events-none" />
                    <textarea
                      placeholder="Descripción / Restricciones del premio"
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                      className="w-full min-h-[80px] rounded-xl bg-slate-50 border-0 pl-11 pt-3.5 text-xs font-medium outline-none resize-none placeholder:text-slate-400 text-slate-750"
                    />
                  </div>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                    <Input
                      placeholder="Puntos requeridos (Ej: 100)"
                      type="number"
                      value={rewardForm.pointsRequired}
                      onChange={(e) => setRewardForm({ ...rewardForm, pointsRequired: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-0 pl-11 text-xs font-black text-slate-700"
                    />
                  </div>
                  <button
                    onClick={handleSaveReward}
                    disabled={savingReward || uploadingRewardImg || !rewardForm.title || !rewardForm.pointsRequired || !rewardForm.image_url}
                    className="w-full h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm active:scale-95 disabled:opacity-50 transition-transform cursor-pointer"
                    style={{ backgroundColor: '#BDE0FE' }}
                  >
                    {savingReward ? 'PUBLICANDO...' : 'PUBLICAR PREMIO'}
                  </button>
                </div>
              </div>
            </div>

            {/* Listado de Miembros del Club */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Miembros del Club ({loyaltyMembers.length})</p>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-slate-300" /></div>
              ) : loyaltyMembers.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center text-slate-350 text-xs font-bold">No hay miembros registrados aún</div>
              ) : (
                loyaltyMembers.map(m => (
                  <div key={m.id} className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{m.name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{m.phone} · Unido el {new Date(m.created_at).toLocaleDateString('es-VE')}</p>
                    </div>
                    <div className="bg-[#BDE0FE40] border border-[#BDE0FE80] px-3 py-1 rounded-xl text-center flex-shrink-0">
                      <span className="text-xs font-black text-blue-900 font-['Poppins']">{m.points}</span>
                      <span className="text-[7px] font-black text-blue-800 uppercase block tracking-wider">PTS</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
