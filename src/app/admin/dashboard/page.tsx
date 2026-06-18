"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, DollarSign, TrendingDown, TrendingUp, Trash2, Loader2, Lock,
  ShoppingBag, Receipt, ChevronDown, ArrowUpRight, ArrowDownRight, X, Tag,
  Footprints, Shirt, Star, Heart, Baby, Gift, Crown, Sparkles, Gem, Flower2, BookOpen, Gamepad2
} from "lucide-react"
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

const ADMIN_PASSWORD = "SUBIBAJA2024"
const CAT_COLORS = ["#BDE0FE", "#60a5fa", "#1d4ed8", "#93c5fd", "#bfdbfe"]
const CAT_ICONS: Record<string, React.ElementType> = {
  Footprints, Shirt, Star, ShoppingBag, Heart, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2, BookOpen, Gamepad2
}

type TFilter = "day" | "week" | "month" | "year"
type DrillBar = { ds: string; type: "ventas" | "gastos" } | null

function getRange(f: TFilter): { start: string; end: string } {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
  if (f === "day")   return { start: `${y}-${p(m+1)}-${p(d)}`, end: `${y}-${p(m+1)}-${p(d+1)}` }
  if (f === "week")  {
    const s = new Date(y, m, d - now.getDay())
    const e = new Date(y, m, d - now.getDay() + 7)
    return { start: iso(s), end: iso(e) }
  }
  if (f === "month") return { start: `${y}-${p(m+1)}-01`, end: `${y}-${p(m+2)}-01` }
  return { start: `${y}-01-01`, end: `${y+1}-01-01` }
}
function p(n: number) { return String(n).padStart(2, "0") }
function iso(d: Date)  { return d.toISOString().split("T")[0] }
function fmtTime(s: string) {
  return new Date(s).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-xl rounded-2xl px-3 py-2 text-xs border border-slate-100">
      <p className="font-black text-slate-700">{payload[0].name}</p>
      <p className="font-black text-blue-900">${Number(payload[0].value).toFixed(2)}</p>
      <p className="text-slate-400">{payload[0].payload.pct}%</p>
    </div>
  )
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-xl rounded-2xl px-3 py-2.5 border border-slate-100 space-y-1.5 min-w-[100px]">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill }} />
          <span className="text-xs font-black text-slate-700">${Number(p.value).toFixed(2)}</span>
          <span className="text-[9px] text-slate-400">{p.dataKey === "ventas" ? "ventas" : "gastos"}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")

  const [sales, setSales]           = useState<any[]>([])
  const [expenses, setExpenses]     = useState<any[]>([])
  const [products, setProducts]     = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<TFilter>("week")

  const [selCat, setSelCat]         = useState("")
  const [selProd, setSelProd]       = useState("")
  const [showCatF, setShowCatF]     = useState(false)
  const [showProdF, setShowProdF]   = useState(false)
  const catFRef  = useRef<HTMLDivElement>(null)
  const prodFRef = useRef<HTMLDivElement>(null)

  const [drillBar, setDrillBar]     = useState<DrillBar>(null)

  const [form, setForm]   = useState({ description: "", amount: "", date: iso(new Date()) })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") setIsAuthenticated(true)
  }, [])
  useEffect(() => { if (isAuthenticated) fetchAll() }, [isAuthenticated])
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (catFRef.current  && !catFRef.current.contains(e.target as Node))  setShowCatF(false)
      if (prodFRef.current && !prodFRef.current.contains(e.target as Node)) setShowProdF(false)
    }
    document.addEventListener("mousedown", outside)
    return () => document.removeEventListener("mousedown", outside)
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: s }, { data: ex }, { data: cfg }, { data: cats }, { data: prods }] = await Promise.all([
      supabase.from("sales").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
      supabase.from("settings").select("*").eq("id", "exchange_rate").single(),
      supabase.from("categories").select("*").order("created_at", { ascending: true }),
      supabase.from("products").select("id,title,category,stock_quantity").order("title"),
    ])
    if (s)     setSales(s)
    if (ex)    setExpenses(ex)
    if (cfg)   setExchangeRate(cfg.value)
    if (cats)  setCategories(cats)
    if (prods) setProducts(prods)
    setLoading(false)
  }

  const loadDemoData = () => {
    const now = new Date()
    const isoDate = (offsetDays: number) => {
      const d = new Date()
      d.setDate(now.getDate() - offsetDays)
      return d.toISOString().split("T")[0]
    }
    const isoDateTime = (offsetDays: number, hour: number, min: number) => {
      const d = new Date()
      d.setDate(now.getDate() - offsetDays)
      d.setHours(hour, min, 0)
      return d.toISOString()
    }

    const mockSales = [
      { id: "s1", amount_usd: 35.00, amount_bs: 35.00 * exchangeRate, payment_method: "$ Efectivo", exchange_rate: exchangeRate, product_title: "Zapato Charol Rosa", category: "Zapatos de Niña", created_at: isoDateTime(0, 10, 30) },
      { id: "s2", amount_usd: 120.00, amount_bs: 120.00 * exchangeRate, payment_method: "Zelle", exchange_rate: exchangeRate, product_title: "Vestido Comunión Gala", category: "Primera Comunión", created_at: isoDateTime(0, 14, 15) },
      { id: "s3", amount_usd: 45.00, amount_bs: 45.00 * exchangeRate, payment_method: "Pago Móvil (Bs)", exchange_rate: exchangeRate, product_title: "Conjunto Lino Bebé", category: "Ropa", created_at: isoDateTime(1, 11, 0) },
      { id: "s4", amount_usd: 28.00, amount_bs: 28.00 * exchangeRate, payment_method: "$ Efectivo", exchange_rate: exchangeRate, product_title: "Sandalia Gladiadora", category: "Zapatos de Niña", created_at: isoDateTime(1, 16, 45) },
      { id: "s5", amount_usd: 95.00, amount_bs: 95.00 * exchangeRate, payment_method: "Zelle", exchange_rate: exchangeRate, product_title: "Tocado Flor Comunión", category: "Primera Comunión", created_at: isoDateTime(2, 9, 15) },
      { id: "s6", amount_usd: 30.00, amount_bs: 30.00 * exchangeRate, payment_method: "$ Efectivo", exchange_rate: exchangeRate, product_title: "Blusa Encaje Infantil", category: "Ropa", created_at: isoDateTime(2, 15, 30) },
      { id: "s7", amount_usd: 40.00, amount_bs: 40.00 * exchangeRate, payment_method: "Pago Móvil (Bs)", exchange_rate: exchangeRate, product_title: "Mocasín Cuero Niño", category: "Zapatos de Niña", created_at: isoDateTime(3, 12, 0) },
      { id: "s8", amount_usd: 150.00, amount_bs: 150.00 * exchangeRate, payment_method: "Zelle", exchange_rate: exchangeRate, product_title: "Vestido Encaje Importado", category: "Primera Comunión", created_at: isoDateTime(3, 16, 20) },
      { id: "s9", amount_usd: 55.00, amount_bs: 55.00 * exchangeRate, payment_method: "$ Efectivo", exchange_rate: exchangeRate, product_title: "Chaqueta Jean Parches", category: "Ropa", created_at: isoDateTime(4, 10, 45) },
      { id: "s10", amount_usd: 35.00, amount_bs: 35.00 * exchangeRate, payment_method: "Pago Móvil (Bs)", exchange_rate: exchangeRate, product_title: "Zapato Tenis Blanco", category: "Zapatos de Niña", created_at: isoDateTime(4, 14, 0) },
      { id: "s11", amount_usd: 110.00, amount_bs: 110.00 * exchangeRate, payment_method: "Zelle", exchange_rate: exchangeRate, product_title: "Vestido Organza Premium", category: "Primera Comunión", created_at: isoDateTime(5, 11, 30) },
      { id: "s12", amount_usd: 25.00, amount_bs: 25.00 * exchangeRate, product_title: "Venta Directa Manual", category: "Ropa", payment_method: "$ Efectivo", exchange_rate: exchangeRate, created_at: isoDateTime(5, 17, 10) },
      { id: "s13", amount_usd: 42.00, amount_bs: 42.00 * exchangeRate, payment_method: "$ Efectivo", exchange_rate: exchangeRate, product_title: "Bota Charol Hebilla", category: "Zapatos de Niña", created_at: isoDateTime(6, 13, 15) },
      { id: "s14", amount_usd: 60.00, amount_bs: 60.00 * exchangeRate, payment_method: "Zelle", exchange_rate: exchangeRate, product_title: "Vestido Bordado Punto Cruz", category: "Ropa", created_at: isoDateTime(6, 15, 50) }
    ]

    const mockExpenses = [
      { id: "e1", description: "Compra de mercancía calzado Caracas", amount_usd: 180.00, amount_bs: 180.00 * exchangeRate, expense_date: isoDate(1), exchange_rate: exchangeRate },
      { id: "e2", description: "Flete / Transporte nacional", amount_usd: 45.00, amount_bs: 45.00 * exchangeRate, expense_date: isoDate(2), exchange_rate: exchangeRate },
      { id: "e3", description: "Bolsas boutique personalizadas x100", amount_usd: 25.00, amount_bs: 25.00 * exchangeRate, expense_date: isoDate(3), exchange_rate: exchangeRate },
      { id: "e4", description: "Servicio de publicidad Instagram Ads", amount_usd: 50.00, amount_bs: 50.00 * exchangeRate, expense_date: isoDate(5), exchange_rate: exchangeRate },
      { id: "e5", description: "Pago de servicios / Limpieza local", amount_usd: 30.00, amount_bs: 30.00 * exchangeRate, expense_date: isoDate(6), exchange_rate: exchangeRate }
    ]

    setSales(mockSales)
    setExpenses(mockExpenses)
  }

  const deleteExpense = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id)
    fetchAll()
  }

  const saveExpense = async () => {
    if (!form.amount || !form.description) return
    setSaving(true)
    const usd = parseFloat(form.amount)
    await supabase.from("expenses").insert([{
      description: form.description, amount_usd: usd,
      amount_bs: usd * exchangeRate, expense_date: form.date, exchange_rate: exchangeRate,
    }])
    setForm({ description: "", amount: "", date: iso(new Date()) })
    fetchAll()
    setSaving(false)
  }

  // ── Período + filtros globales ──
  const { start, end } = getRange(filter)
  const inRange = (ds: string) => ds >= start && ds < end
  const matchesFilters = (s: any) => {
    if (selCat  && s.category       !== selCat)  return false
    if (selProd && s.product_title  !== selProd) return false
    return true
  }

  const fSales    = sales.filter(s => inRange(s.created_at?.split("T")[0] ?? "") && matchesFilters(s))
  const fExpenses = expenses.filter(e => inRange(e.expense_date ?? ""))

  const totalVentas = fSales.reduce((a, s) => a + Number(s.amount_usd), 0)
  const totalGastos = fExpenses.reduce((a, e) => a + Number(e.amount_usd), 0)
  const neto        = totalVentas - totalGastos
  const netoBs      = neto * exchangeRate
  const numVentas   = fSales.length
  const avgVenta    = numVentas > 0 ? totalVentas / numVentas : 0

  // ── Donut dinámico ──
  const catData = Object.entries(
    fSales.reduce((acc: Record<string, number>, s) => {
      const cat = s.category || "Sin categoría"
      acc[cat] = (acc[cat] || 0) + Number(s.amount_usd)
      return acc
    }, {})
  ).map(([name, value], i) => {
    const dbCat = categories.find(c => c.name === name)
    return {
      name, value,
      icon: dbCat?.icon || "Tag",
      color: CAT_COLORS[i % CAT_COLORS.length],
      pct: totalVentas > 0 ? ((value / totalVentas) * 100).toFixed(0) : "0",
    }
  }).filter(d => d.value > 0)

  // ── Barras 7 días ──
  const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const barData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = iso(d)
    return {
      name: DAYS[d.getDay()], ds,
      ventas: sales.filter(s => s.created_at?.split("T")[0] === ds && matchesFilters(s)).reduce((a, s) => a + Number(s.amount_usd), 0),
      gastos: expenses.filter(e => e.expense_date === ds).reduce((a, e) => a + Number(e.amount_usd), 0),
    }
  })

  // ── Drill-down ──
  const drillItems = drillBar
    ? drillBar.type === "ventas"
      ? sales.filter(s => s.created_at?.split("T")[0] === drillBar.ds && matchesFilters(s))
      : expenses.filter(e => e.expense_date === drillBar.ds)
    : []

  // ── Actividad reciente ──
  const recentActivity = [
    ...fSales.map(s => ({ ...s, _type: "venta" as const, _sort: s.created_at || "" })),
    ...fExpenses.map(e => ({ ...e, _type: "gasto" as const, _sort: e.expense_date || "" })),
  ].sort((a, b) => b._sort.localeCompare(a._sort)).slice(0, 12)

  const filteredProdsForSelect = selCat ? products.filter(p => p.category === selCat) : products

  // ── LOGIN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-[40px] shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#BDE0FE" }}>
              <Lock className="text-blue-900 size-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 font-['Poppins']">Panel Financiero</h2>
            <p className="text-xs text-slate-400 mt-1">Subibaja Business OS</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); if (password === ADMIN_PASSWORD) setIsAuthenticated(true); else alert("Contraseña incorrecta") }} className="space-y-3">
            <Input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="h-12 rounded-2xl text-center bg-slate-50 border-0 font-bold" />
            <button type="submit" className="w-full rounded-full font-bold tracking-widest text-blue-900" style={{ height: "44px", backgroundColor: "#BDE0FE" }}>
              ACCEDER
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Lato',sans-serif] pb-16">

      {/* ── HEADER ── */}
      <div className="bg-white/95 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 no-print">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2.5 rounded-2xl bg-slate-50 transition-transform active:scale-90">
              <ChevronLeft className="size-5 text-slate-700" />
            </button>
            <div>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Subibaja OS</p>
              <h1 className="text-lg font-black text-slate-900 font-['Poppins'] leading-none">Panel Financiero</h1>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full text-[9px] font-black text-blue-800 uppercase tracking-widest" style={{ backgroundColor: "#BDE0FE40" }}>
            Tasa: {exchangeRate} Bs
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-4">
          <div className="bg-slate-100/70 p-1 rounded-2xl flex gap-1">
            {(["day", "week", "month", "year"] as TFilter[]).map(f => (
              <button key={f} onClick={() => { setFilter(f); setDrillBar(null) }}
                className={`flex-1 py-2 text-[9px] font-black rounded-xl transition-all uppercase tracking-widest ${filter === f ? "bg-white shadow text-blue-700" : "text-slate-400"}`}>
                {f === "day" ? "Día" : f === "week" ? "Semana" : f === "month" ? "Mes" : "Año"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="size-7 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-5 space-y-5">

          {/* ── FILTROS GLOBALES ── */}
          <div className="bg-white rounded-[28px] shadow-sm p-4 space-y-3 no-print">
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filtrar análisis</p>
              <div className="flex gap-2">
                <button
                  onClick={loadDemoData}
                  className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[9px] font-black tracking-wider hover:bg-amber-100 transition-all uppercase active:scale-95 cursor-pointer"
                >
                  ⚡ Cargar Demo
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[9px] font-black tracking-wider hover:bg-slate-100 transition-all uppercase active:scale-95 cursor-pointer"
                >
                  🖨️ PDF / IMPRIMIR
                </button>
              </div>
            </div>
            <div className="flex gap-2">

              {/* Categoría */}
              <div className="relative flex-1" ref={catFRef}>
                <button
                  onClick={() => { setShowCatF(v => !v); setShowProdF(false) }}
                  className="w-full h-10 rounded-2xl px-4 flex items-center justify-between text-xs font-bold transition-all"
                  style={{ backgroundColor: selCat ? "#BDE0FE40" : "#f8fafc", color: selCat ? "#1e3a5f" : "#94a3b8" }}
                >
                  <span className="truncate">{selCat || "Categoría"}</span>
                  <ChevronDown className={`size-3 text-slate-400 flex-shrink-0 ml-1 transition-transform ${showCatF ? "rotate-180" : ""}`} />
                </button>
                {showCatF && (
                  <div className="absolute z-30 w-full bg-white shadow-xl rounded-2xl mt-1 border border-slate-100 overflow-hidden">
                    <button onClick={() => { setSelCat(""); setSelProd(""); setShowCatF(false) }}
                      className="w-full px-4 py-3 text-left text-xs font-bold text-slate-400 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                      <X className="size-3" /> Todas
                    </button>
                    {categories.map(cat => {
                      const IconComp = CAT_ICONS[cat.icon] || Tag
                      return (
                        <button key={cat.id} onClick={() => { setSelCat(cat.name); setSelProd(""); setShowCatF(false) }}
                          className={`w-full px-4 py-3 text-left text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 ${selCat === cat.name ? "bg-blue-50 text-blue-700" : "text-slate-600"}`}>
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: selCat === cat.name ? "#BDE0FE" : "#f1f5f9" }}>
                            <IconComp className="size-3" />
                          </div>
                          {cat.name}
                          {selCat === cat.name && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Producto */}
              <div className="relative flex-1" ref={prodFRef}>
                <button
                  onClick={() => { setShowProdF(v => !v); setShowCatF(false) }}
                  className="w-full h-10 rounded-2xl px-4 flex items-center justify-between text-xs font-bold transition-all"
                  style={{ backgroundColor: selProd ? "#BDE0FE40" : "#f8fafc", color: selProd ? "#1e3a5f" : "#94a3b8" }}
                >
                  <span className="truncate">{selProd || "Producto"}</span>
                  <ChevronDown className={`size-3 text-slate-400 flex-shrink-0 ml-1 transition-transform ${showProdF ? "rotate-180" : ""}`} />
                </button>
                {showProdF && (
                  <div className="absolute z-30 w-56 right-0 bg-white shadow-xl rounded-2xl mt-1 border border-slate-100 overflow-hidden max-h-52 overflow-y-auto">
                    <button onClick={() => { setSelProd(""); setShowProdF(false) }}
                      className="w-full px-4 py-3 text-left text-xs font-bold text-slate-400 hover:bg-slate-50 sticky top-0 bg-white border-b border-slate-50">
                      Todos
                    </button>
                    {filteredProdsForSelect.length === 0
                      ? <p className="px-4 py-3 text-xs text-slate-300 font-bold">Sin productos</p>
                      : filteredProdsForSelect.map(prod => (
                        <button key={prod.id} onClick={() => { setSelProd(prod.title); setShowProdF(false) }}
                          className={`w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 ${selProd === prod.title ? "bg-blue-50 text-blue-700" : "text-slate-600"}`}>
                          {prod.title}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Chips activos */}
            {(selCat || selProd) && (
              <div className="flex flex-wrap gap-2">
                {selCat && (
                  <button onClick={() => { setSelCat(""); setSelProd("") }}
                    className="flex items-center gap-1.5 h-6 px-3 rounded-full text-[9px] font-black text-blue-900 border border-blue-200"
                    style={{ backgroundColor: "#BDE0FE60" }}>
                    {selCat} <X className="size-2.5" />
                  </button>
                )}
                {selProd && (
                  <button onClick={() => setSelProd("")}
                    className="flex items-center gap-1.5 h-6 px-3 rounded-full text-[9px] font-black text-blue-900 border border-blue-200"
                    style={{ backgroundColor: "#BDE0FE60" }}>
                    {selProd.length > 22 ? selProd.slice(0, 22) + "…" : selProd} <X className="size-2.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body {
                background-color: white !important;
                color: black !important;
                font-size: 11px !important;
              }
              nav, button, input, select, header, .sticky, .no-print, .relative button, .relative svg, button svg, .absolute {
                display: none !important;
              }
              .max-w-2xl {
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
              }
              .shadow-sm, .shadow-xl {
                box-shadow: none !important;
                border: 1px solid #cbd5e1 !important;
              }
              .bg-white {
                background-color: white !important;
              }
              .text-slate-900, .text-slate-800 {
                color: black !important;
              }
            }
          `}} />

          {/* ── ALERTA DE STOCK BAJO ── */}
          {(() => {
            const lowStockCount = products.filter(p => p.stock_quantity !== undefined && p.stock_quantity !== null && p.stock_quantity <= 3).length;
            if (lowStockCount > 0) {
              return (
                <div className="bg-amber-50/50 border border-amber-100 rounded-[28px] p-4 flex items-center justify-between no-print">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100/50 flex items-center justify-center text-amber-600 text-sm">⚠️</div>
                    <div>
                      <p className="text-xs font-black text-amber-800">Alerta de Inventario Bajo</p>
                      <p className="text-[10px] text-amber-600 font-bold">{lowStockCount} {lowStockCount === 1 ? 'producto tiene' : 'productos tienen'} 3 unidades o menos.</p>
                    </div>
                  </div>
                  <Link href="/admin">
                    <button className="text-[9px] font-black text-amber-700 bg-amber-200/50 px-3 py-1.5 rounded-xl uppercase tracking-wider active:scale-95 transition-transform cursor-pointer">
                      Ver Stock
                    </button>
                  </Link>
                </div>
              )
            }
            return null;
          })()}

          {/* ── RESULTADO NETO ── */}
          <div className="rounded-[32px] p-6 relative overflow-hidden"
            style={{ backgroundColor: neto >= 0 ? "#f0fdf4" : "#fff1f2" }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1"
              style={{ color: neto >= 0 ? "#16a34a" : "#e11d48" }}>
              Resultado Neto · {filter === "day" ? "Hoy" : filter === "week" ? "Esta semana" : filter === "month" ? "Este mes" : "Este año"}
            </p>
            <p className="text-5xl font-black font-['Poppins'] leading-none"
              style={{ color: neto >= 0 ? "#15803d" : "#be123c" }}>
              ${neto.toFixed(2)}
            </p>
            <p className="text-lg font-bold mt-1.5" style={{ color: neto >= 0 ? "#16a34a" : "#e11d48" }}>
              {netoBs.toFixed(0)} Bs
            </p>
            <div className={`absolute -bottom-6 -right-6 text-[120px] font-black leading-none select-none ${neto >= 0 ? "text-green-100" : "text-rose-100"}`}>
              {neto >= 0 ? "+" : "−"}
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[28px] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-4 text-emerald-500" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ventas</p>
              </div>
              <p className="text-2xl font-black text-slate-900">${totalVentas.toFixed(2)}</p>
              <p className="text-[10px] text-slate-400 font-bold">{(totalVentas * exchangeRate).toFixed(0)} Bs</p>
              <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between">
                <span className="text-[9px] text-slate-400 font-bold">{numVentas} ventas</span>
                <span className="text-[9px] text-slate-400 font-bold">avg ${avgVenta.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-white rounded-[28px] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="size-4 text-rose-400" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gastos</p>
              </div>
              <p className="text-2xl font-black text-slate-900">${totalGastos.toFixed(2)}</p>
              <p className="text-[10px] text-slate-400 font-bold">{(totalGastos * exchangeRate).toFixed(0)} Bs</p>
              <div className="mt-3 pt-3 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 font-bold">{fExpenses.length} egresos</span>
              </div>
            </div>
          </div>

          {/* ── DONUT: Ventas por categoría ── */}
          <div className="bg-white rounded-[28px] shadow-sm p-5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Ventas por Categoría</p>
            {catData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0" style={{ width: 160, height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                        paddingAngle={3} dataKey="value" stroke="none">
                        {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {catData.map((d, i) => {
                    const IconComp = CAT_ICONS[d.icon] || Tag
                    return (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: d.color + "40" }}>
                            <IconComp className="size-3.5" style={{ color: d.color === "#BDE0FE" ? "#1e3a5f" : d.color }} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 truncate">{d.name}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-black text-slate-800">${d.value.toFixed(0)}</p>
                          <p className="text-[9px] text-slate-400">{d.pct}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                <ShoppingBag className="size-8 mb-2" />
                <p className="text-xs font-bold">Sin ventas en este período</p>
              </div>
            )}
          </div>

          {/* ── BARRAS 7 DÍAS + DRILL-DOWN ── */}
          <div className="bg-white rounded-[28px] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tendencia — 7 días</p>
              {drillBar && (
                <button onClick={() => setDrillBar(null)}
                  className="flex items-center gap-1 h-6 px-2.5 rounded-full text-[9px] font-black text-slate-400 border border-slate-200">
                  <X className="size-2.5" /> cerrar
                </button>
              )}
            </div>
            <p className="text-[9px] text-slate-300 font-bold mb-3">Toca una barra para ver el desglose</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={barData} barSize={18} barGap={2} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="ventas" radius={[6, 6, 0, 0]} cursor="pointer"
                  onClick={(data: any) => setDrillBar(d => (d !== null && d.ds === data.ds && d.type === "ventas") ? null : { ds: data.ds, type: "ventas" })}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={drillBar?.ds === entry.ds && drillBar?.type === "ventas" ? "#93c5fd" : "#BDE0FE"} />
                  ))}
                </Bar>
                <Bar dataKey="gastos" radius={[6, 6, 0, 0]} cursor="pointer"
                  onClick={(data: any) => setDrillBar(d => (d !== null && d.ds === data.ds && d.type === "gastos") ? null : { ds: data.ds, type: "gastos" })}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={drillBar?.ds === entry.ds && drillBar?.type === "gastos" ? "#f43f5e" : "#fda4af"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#BDE0FE]" /><span className="text-[9px] font-bold text-slate-400 uppercase">Ventas</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#fda4af]" /><span className="text-[9px] font-bold text-slate-400 uppercase">Gastos</span></div>
            </div>

            {/* Drill-down card */}
            {drillBar && (
              <div className="mt-5 pt-4 border-t border-slate-50 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${drillBar.type === "ventas" ? "bg-blue-100" : "bg-rose-100"}`}>
                    {drillBar.type === "ventas"
                      ? <ArrowUpRight className="size-3.5 text-blue-600" />
                      : <ArrowDownRight className="size-3.5 text-rose-500" />}
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {drillBar.type === "ventas" ? "Ventas" : "Gastos"} del {drillBar.ds}
                  </p>
                </div>
                {drillItems.length === 0
                  ? <p className="text-xs text-slate-300 font-bold py-2 text-center">Sin registros para este día</p>
                  : drillItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3.5 rounded-2xl"
                      style={{ backgroundColor: drillBar.type === "ventas" ? "#EFF6FF" : "#FFF1F2" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {drillBar.type === "ventas" ? (item.product_title || "Venta manual") : item.description}
                        </p>
                        <p className="text-[9px] font-bold mt-0.5" style={{ color: drillBar.type === "ventas" ? "#60a5fa" : "#fb7185" }}>
                          {drillBar.type === "ventas"
                            ? `${item.payment_method} · ${fmtTime(item.created_at)}`
                            : item.expense_date}
                        </p>
                      </div>
                      <p className={`text-sm font-black flex-shrink-0 ${drillBar.type === "ventas" ? "text-blue-900" : "text-rose-500"}`}>
                        ${Number(item.amount_usd).toFixed(2)}
                      </p>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* ── ACTIVIDAD RECIENTE ── */}
          {recentActivity.length > 0 && (
            <div className="bg-white rounded-[28px] shadow-sm p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Actividad Reciente</p>
              <div className="space-y-1">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 ${item._type === "venta" ? "bg-blue-50" : "bg-rose-50"}`}>
                      {item._type === "venta"
                        ? <ArrowUpRight className="size-4 text-blue-400" />
                        : <ArrowDownRight className="size-4 text-rose-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {item._type === "venta" ? (item.product_title || "Venta manual") : item.description}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                        {item._type === "venta"
                          ? `${item.category || "—"} · ${item.payment_method}`
                          : `Gasto · ${item.expense_date}`}
                      </p>
                    </div>
                    <p className={`text-sm font-black flex-shrink-0 ${item._type === "venta" ? "text-slate-800" : "text-rose-400"}`}>
                      {item._type === "venta" ? "+" : "−"}${Number(item.amount_usd).toFixed(2)}
                    </p>
                    {i < recentActivity.length - 1 && (
                      <div className="absolute left-[52px] right-5 h-px bg-slate-50 pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REGISTRAR GASTO ── */}
          <div className="bg-white rounded-[28px] shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="size-4 text-slate-300" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registrar Gasto</p>
            </div>
            <Input placeholder="Concepto (ej: Transporte, Bolsas...)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="h-11 rounded-xl bg-slate-50 border-0 text-sm font-medium" />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-300" />
                <Input type="number" placeholder="Monto USD" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 border-0 font-bold pl-8 text-sm" />
              </div>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="h-11 rounded-xl bg-slate-50 border-0 w-36 text-xs font-medium" />
            </div>
            <button onClick={saveExpense} disabled={saving || !form.amount || !form.description}
              className="w-full rounded-full font-bold tracking-widest text-slate-500 border border-slate-200 bg-white disabled:opacity-40 transition-transform active:scale-95"
              style={{ height: "44px" }}>
              {saving ? "GUARDANDO..." : "REGISTRAR GASTO"}
            </button>
          </div>

          {/* ── HISTORIAL GASTOS ── */}
          {fExpenses.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                Gastos del período ({fExpenses.length})
              </p>
              {fExpenses.map(e => (
                <div key={e.id} className="bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-bold text-slate-700 truncate">{e.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{e.expense_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-black text-rose-500">${Number(e.amount_usd).toFixed(2)}</p>
                      <p className="text-[9px] text-slate-300 font-bold">{Number(e.amount_bs).toFixed(0)} Bs</p>
                    </div>
                    <button onClick={() => deleteExpense(e.id)} className="p-2 rounded-xl bg-slate-50 text-slate-300 transition-transform active:scale-90">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
