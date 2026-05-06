"use client"
import { useState, useEffect } from "react"
import { 
  Camera, Save, Package, Trash2, ExternalLink, Loader2, Lock, Unlock, 
  LayoutDashboard, ListChecks, PlusCircle, TrendingUp, ShoppingBag, 
  Star, DollarSign, RefreshCcw, Wallet, Banknote, Type, Ruler, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ADMIN_PASSWORD = "SUBIBAJA2024"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  
  const [products, setProducts] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({ 
    title: "", price: "", category: "Zapatos de Niña", sizes: "", image_url: "", stock_quantity: "10", description: "" 
  })
  const [saleForm, setSaleForm] = useState({ amount: "", method: "$ Efectivo" })

  useEffect(() => {
    if (isAuthenticated) fetchInitialData()
  }, [isAuthenticated])

  async function fetchInitialData() {
    try {
      setLoading(true)
      const { data: settings } = await supabase.from('settings').select('*').eq('id', 'exchange_rate').single()
      if (settings) setExchangeRate(settings.value)
      const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: true })
      if (salesData) setSales(salesData)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const updateExchangeRate = async (val: string) => {
    const rate = parseFloat(val) || 0
    setExchangeRate(rate)
    await supabase.from('settings').update({ value: rate }).eq('id', 'exchange_rate')
  }

  const handleRegisterSale = async () => {
    if (!saleForm.amount) return
    try {
      const amountUsd = parseFloat(saleForm.amount)
      await supabase.from('sales').insert([{
        amount_usd: amountUsd,
        amount_bs: amountUsd * exchangeRate,
        payment_method: saleForm.method,
        exchange_rate: exchangeRate
      }])
      setSaleForm({ ...saleForm, amount: "" })
      fetchInitialData()
    } catch (err) { console.error(err) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`
      await supabase.storage.from('product-images').upload(`products/${fileName}`, file)
      const { data } = supabase.storage.from('product-images').getPublicUrl(`products/${fileName}`)
      setFormData({ ...formData, image_url: data.publicUrl })
    } catch (err: any) { alert(err.message) } finally { setUploading(false) }
  }

  const handleSaveProduct = async () => {
    if (!formData.title || !formData.price || !formData.image_url) {
      alert("Faltan datos obligatorios")
      return
    }
    try {
      setSaving(true)
      await supabase.from('products').insert([{
        title: formData.title,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        description: formData.description,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s !== ""),
        stock_quantity: parseInt(formData.stock_quantity),
        stock_status: 'in_stock'
      }])
      setFormData({ title: "", price: "", category: "Zapatos de Niña", sizes: "", image_url: "", stock_quantity: "10", description: "" })
      fetchInitialData()
      setActiveTab("inventory")
    } catch (err: any) { alert(err.message) } finally { setSaving(false) }
  }

  const getChartData = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return { dateStr: d.toISOString().split('T')[0], dayName: days[d.getDay()], total: 0 }
    })
    sales.forEach(sale => {
      const saleDate = sale.created_at.split('T')[0]
      const day = last7Days.find(d => d.dateStr === saleDate)
      if (day) day.total += sale.amount_usd
    })
    return last7Days
  }

  const kpis = {
    totalUsd: sales.reduce((acc, s) => acc + s.amount_usd, 0),
    cash: sales.filter(s => s.payment_method === '$ Efectivo').reduce((acc, s) => acc + s.amount_usd, 0),
    zelle: sales.filter(s => s.payment_method === 'Zelle').reduce((acc, s) => acc + s.amount_usd, 0),
    pagoMovil: sales.filter(s => s.payment_method === 'Pago Móvil (Bs)').reduce((acc, s) => acc + s.amount_bs, 0),
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm border-0 shadow-2xl rounded-[40px] p-8 bg-white">
          <div className="text-center space-y-2 mb-8">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="text-blue-500 size-8" /></div>
            <h2 className="text-2xl font-black text-slate-900 font-['Poppins']">Business OS</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if(password === ADMIN_PASSWORD) setIsAuthenticated(true); else alert("Error"); }} className="space-y-4">
            <Input type="password" placeholder="••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl text-center text-lg bg-slate-50 border-0" />
            <Button type="submit" className="w-full h-14 bg-blue-500 text-white rounded-2xl font-black shadow-lg">Entrar</Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Lato',sans-serif] pb-24">
      {/* Header OS */}
      <div className="bg-white/90 backdrop-blur-2xl sticky top-0 z-40 px-6 py-5 border-b border-slate-100 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Administración</p>
            <h1 className="text-2xl font-black text-slate-900 font-['Poppins']">Subibaja OS</h1>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
            <span className="text-[9px] font-black text-blue-500 uppercase">Tasa:</span>
            <input type="number" value={exchangeRate} onChange={(e) => updateExchangeRate(e.target.value)} className="w-12 bg-transparent font-black text-blue-700 outline-none text-sm" />
          </div>
        </div>
        <div className="bg-slate-100/80 p-1 rounded-2xl flex gap-1">
          {['dashboard', 'inventory', 'upload'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>
              {tab === 'dashboard' ? 'Ventas' : tab === 'inventory' ? 'Stock' : 'Cargar'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-sm rounded-[40px] bg-white p-8 relative overflow-hidden">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Caja Total ($)</p>
              <p className="text-4xl font-black text-slate-900 font-['Poppins']">${kpis.totalUsd.toLocaleString()}</p>
              <DollarSign className="absolute -bottom-6 -right-6 size-40 text-slate-50" />
            </Card>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-[32px] shadow-sm text-center border border-slate-50">
                <Banknote className="size-4 text-emerald-500 mx-auto mb-2" />
                <p className="text-[8px] font-black text-slate-400 uppercase">Efectivo</p>
                <p className="text-sm font-black text-slate-800">${kpis.cash}</p>
              </div>
              <div className="bg-white p-4 rounded-[32px] shadow-sm text-center border border-slate-50">
                <RefreshCcw className="size-4 text-sky-500 mx-auto mb-2" />
                <p className="text-[8px] font-black text-slate-400 uppercase">Zelle</p>
                <p className="text-sm font-black text-slate-800">${kpis.zelle}</p>
              </div>
              <div className="bg-white p-4 rounded-[32px] shadow-sm text-center border border-slate-50">
                <Wallet className="size-4 text-indigo-500 mx-auto mb-2" />
                <p className="text-[8px] font-black text-slate-400 uppercase">P. Móvil</p>
                <p className="text-xs font-black text-slate-800 truncate">{kpis.pagoMovil.toLocaleString()} Bs</p>
              </div>
            </div>
            <Card className="border-0 shadow-sm rounded-[40px] bg-white p-6 space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Monto $" type="number" value={saleForm.amount} onChange={(e) => setSaleForm({...saleForm, amount: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-0 font-bold" />
                <Select onValueChange={(v) => setSaleForm({...saleForm, method: v})} defaultValue="$ Efectivo">
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl"><SelectItem value="$ Efectivo">$ Efectivo</SelectItem><SelectItem value="Zelle">Zelle</SelectItem><SelectItem value="Pago Móvil (Bs)">P. Móvil (Bs)</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={handleRegisterSale} className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold">Registrar Venta</Button>
            </Card>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {products.map(product => (
              <Card key={product.id} className="border-0 shadow-sm rounded-[32px] bg-white p-4 flex items-center gap-4">
                <img src={product.image_url} className="size-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 text-sm line-clamp-1">{product.title}</h4>
                  <p className="text-xs font-black text-blue-600">${product.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-2 py-0.5 rounded-full font-black text-[10px] ${product.stock_quantity > 3 ? 'bg-sky-50 text-sky-600' : 'bg-orange-50 text-orange-600'}`}>
                    {product.stock_quantity}
                  </div>
                  <Switch checked={product.stock_status === 'in_stock'} className="scale-75" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[44px] bg-white overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="relative border-2 border-dashed border-slate-100 rounded-[36px] p-12 bg-slate-50 flex flex-col items-center justify-center transition-all aspect-video overflow-hidden">
                  {formData.image_url ? (
                    <img src={formData.image_url} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="bg-white p-5 rounded-3xl shadow-sm mb-4"><Camera className="text-blue-500 size-8" /></div>
                      <span className="text-slate-600 font-black text-sm">Toca para subir foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                  {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-blue-500" /></div>}
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre</Label>
                    <div className="relative"><Type className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input placeholder="Ej: Zapato Gala" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-0 pl-14 font-bold text-lg" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descripción</Label>
                    <div className="relative">
                      <Info className="absolute left-5 top-5 size-4 text-slate-300" />
                      <textarea 
                        placeholder="Detalles del producto..." 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full min-h-[120px] rounded-2xl bg-slate-50 border-0 pl-14 pt-4 font-bold focus:bg-white transition-all outline-none resize-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Precio $</Label>
                      <div className="relative"><DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input type="number" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-0 pl-14 font-black text-lg" /></div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Stock</Label>
                      <div className="relative"><Package className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-0 pl-14 font-black text-lg" /></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tallas</Label>
                    <div className="relative"><Ruler className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input placeholder="24, 25, 26" value={formData.sizes} onChange={(e) => setFormData({...formData, sizes: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-0 pl-14 font-bold" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">Categoría</Label>
                    <Select onValueChange={(val) => setFormData({...formData, category: val})} defaultValue="Zapatos de Niña">
                      <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-0 font-bold px-6 shadow-none"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-xl"><SelectItem value="Zapatos de Niña" className="font-bold">Zapatos de Niña</SelectItem><SelectItem value="Ropa" className="font-bold">Ropa</SelectItem><SelectItem value="Primera Comunión" className="font-bold">Primera Comunión</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveProduct} disabled={saving || uploading} className="w-full h-20 bg-[#BDE0FE] text-blue-900 rounded-[32px] font-black text-xl shadow-2xl transition-all active:scale-95">Publicar</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
