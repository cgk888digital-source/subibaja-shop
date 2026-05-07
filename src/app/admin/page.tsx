"use client"
import { useState, useEffect, useRef } from "react"
import {
  Camera, Package, Loader2, Lock, DollarSign, RefreshCcw, Wallet, Banknote,
  Type, Ruler, Info, Search, X, Plus, ChevronDown, Palette,
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
    title: "", price: "", category: "Zapatos de Niña", sizes: "",
    image_url: "", stock_quantity: "10", description: ""
  })
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
  const [savingCat, setSavingCat] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const catDropdownRef = useRef<HTMLDivElement>(null)

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
        if (cats.length > 0 && !formData.category) setFormData(f => ({ ...f, category: cats[0].name }))
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  async function handleSaveCategory() {
    if (!newCatName.trim()) return
    try {
      setSavingCat(true)
      await supabase.from('categories').insert([{ name: newCatName.trim(), icon: newCatIcon }])
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
      if (cats) setCategories(cats)
      setFormData(f => ({ ...f, category: newCatName.trim() }))
      setNewCatName("")
      setNewCatIcon("Tag")
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
      setSaleForm({ productId: "", productTitle: "", productCategory: "", amount: "", method: "$ Efectivo" })
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

  const handleSaveProduct = async () => {
    if (!formData.title || !formData.price || !formData.image_url) { alert("Faltan datos"); return }
    try {
      setSaving(true)
      await supabase.from('products').insert([{
        title: formData.title, price: parseFloat(formData.price),
        category: formData.category, image_url: formData.image_url,
        description: formData.description,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors,
        stock_quantity: parseInt(formData.stock_quantity), stock_status: 'in_stock'
      }])
      setFormData({ title: "", price: "", category: "Zapatos de Niña", sizes: "", image_url: "", stock_quantity: "10", description: "" })
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
          {['dashboard', 'inventory', 'upload'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>
              {tab === 'dashboard' ? 'Ventas' : tab === 'inventory' ? 'Stock' : 'Cargar'}
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
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${(product.stock_quantity || 0) > 3 ? 'bg-sky-50 text-sky-600' : 'bg-orange-50 text-orange-500'}`}>
                    {product.stock_quantity ?? 0}
                  </span>
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
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Colores disponibles</Label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Palette className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 pointer-events-none z-10" />
                      <input
                        type="color"
                        value={colorPick}
                        onChange={e => setColorPick(e.target.value)}
                        className="h-14 w-24 rounded-2xl bg-slate-50 border-0 pl-12 cursor-pointer opacity-0 absolute inset-0"
                      />
                      <div
                        className="h-14 w-24 rounded-2xl flex items-center justify-end pr-3 border-2 border-transparent"
                        style={{ backgroundColor: colorPick + '30', borderColor: colorPick }}
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: colorPick }} />
                      </div>
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
                      className="h-14 flex-1 rounded-2xl font-black text-[10px] tracking-widest transition-transform active:scale-95"
                      style={{ backgroundColor: '#BDE0FE', color: '#1e3a5f' }}
                    >
                      + AGREGAR
                    </button>
                  </div>
                  {colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {colors.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColors(colors.filter(x => x !== c))}
                          className="flex items-center gap-2 h-8 pl-2 pr-3 rounded-full border-2 text-[10px] font-black transition-transform active:scale-95"
                          style={{ borderColor: c, color: '#475569' }}
                        >
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                          <X className="size-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</Label>
                  <div className="relative" ref={catDropdownRef}>
                    {/* Trigger */}
                    <button
                      type="button"
                      onClick={() => { setShowCatDropdown(v => !v); setShowNewCatForm(false) }}
                      className="w-full h-14 rounded-2xl bg-slate-50 px-5 flex items-center justify-between font-bold text-sm text-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const cat = categories.find(c => c.name === formData.category)
                          const IconComp = cat ? (CAT_ICONS[cat.icon] || Tag) : Tag
                          return <><IconComp className="size-4 text-blue-400" /><span>{formData.category || 'Selecciona categoría'}</span></>
                        })()}
                      </div>
                      <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${showCatDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown list */}
                    {showCatDropdown && (
                      <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100">
                        {categories.map(cat => {
                          const IconComp = CAT_ICONS[cat.icon] || Tag
                          return (
                            <button key={cat.id} type="button"
                              onClick={() => { setFormData({ ...formData, category: cat.name }); setShowCatDropdown(false) }}
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
              </div>

              <button onClick={handleSaveProduct} disabled={saving || uploading}
                className="w-full rounded-full font-black tracking-widest text-blue-900 disabled:opacity-40 transition-transform active:scale-95"
                style={{ height: '56px', backgroundColor: '#BDE0FE', fontSize: '12px' }}>
                {saving ? 'PUBLICANDO...' : 'PUBLICAR PRODUCTO'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
