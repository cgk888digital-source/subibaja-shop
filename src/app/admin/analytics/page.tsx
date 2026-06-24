"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, DollarSign, TrendingDown, TrendingUp, Plus, Trash2, Loader2, Lock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

const ADMIN_PASSWORD = "SUBIBAJA2024"
const CATEGORIES = ["Zapatos de Niña", "Ropa", "Primera Comunión"]
const CAT_COLORS: Record<string, string> = {
  "Zapatos de Niña": "#8dd5e3",
  "Ropa": "#93c5fd",
  "Primera Comunión": "#60a5fa",
}

type TimeFilter = "today" | "week" | "month" | "year" | "custom"

function getRange(filter: TimeFilter, customStart: string, customEnd: string) {
  const now = new Date()
  const pad = (d: Date) => d.toISOString().split("T")[0]
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (filter === "today") {
    const s = startOfDay(now)
    return { start: pad(s), end: pad(new Date(s.getTime() + 86_400_000)) }
  }
  if (filter === "week") {
    const s = startOfDay(now)
    s.setDate(s.getDate() - s.getDay())
    return { start: pad(s), end: pad(new Date(s.getTime() + 7 * 86_400_000)) }
  }
  if (filter === "month") {
    return { start: pad(new Date(now.getFullYear(), now.getMonth(), 1)), end: pad(new Date(now.getFullYear(), now.getMonth() + 1, 1)) }
  }
  if (filter === "year") {
    return { start: `${now.getFullYear()}-01-01`, end: `${now.getFullYear() + 1}-01-01` }
  }
  return { start: customStart, end: customEnd }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")

  const [sales, setSales] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState<TimeFilter>("today")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", date: new Date().toISOString().split("T")[0] })
  const [savingExpense, setSavingExpense] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchAll()
  }, [isAuthenticated])

  async function fetchAll() {
    try {
      setLoading(true)
      const [{ data: s }, { data: ex }, { data: settings }] = await Promise.all([
        supabase.from("sales").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
        supabase.from("settings").select("*").eq("id", "exchange_rate").single(),
      ])
      if (s) setSales(s)
      if (ex) setExpenses(ex)
      if (settings) setExchangeRate(settings.value)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleSaveExpense = async () => {
    if (!expenseForm.amount || !expenseForm.description) return
    try {
      setSavingExpense(true)
      const amountUsd = parseFloat(expenseForm.amount)
      await supabase.from("expenses").insert([{
        description: expenseForm.description,
        amount_usd: amountUsd,
        amount_bs: amountUsd * exchangeRate,
        expense_date: expenseForm.date,
        exchange_rate: exchangeRate,
      }])
      setExpenseForm({ description: "", amount: "", date: new Date().toISOString().split("T")[0] })
      fetchAll()
    } catch (err) { console.error(err) } finally { setSavingExpense(false) }
  }

  const handleDeleteExpense = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id)
    fetchAll()
  }

  // ── Filtered data ──
  const { start, end } = getRange(filter, customStart, customEnd)

  const filteredSales = sales.filter(s => {
    const d = s.created_at?.split("T")[0]
    return d >= start && d < end
  })
  const filteredExpenses = expenses.filter(e => e.expense_date >= start && e.expense_date < end)

  const totalSalesUsd = filteredSales.reduce((a, s) => a + Number(s.amount_usd), 0)
  const totalExpensesUsd = filteredExpenses.reduce((a, e) => a + Number(e.amount_usd), 0)
  const netUsd = totalSalesUsd - totalExpensesUsd
  const netBs = netUsd * exchangeRate

  // ── Chart: ventas por categoría ──
  const categoryData = CATEGORIES.map(cat => ({
    name: cat === "Primera Comunión" ? "P. Comunión" : cat,
    ventas: filteredSales.filter(s => s.category === cat).reduce((a, s) => a + Number(s.amount_usd), 0),
    color: CAT_COLORS[cat],
  }))

  // ── Chart: ventas diarias (últimos 7 días) ──
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().split("T")[0]
    return {
      name: days[d.getDay()],
      ventas: sales.filter(s => s.created_at?.split("T")[0] === ds).reduce((a, s) => a + Number(s.amount_usd), 0),
    }
  })

  // ── LOGIN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-[40px] shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#8dd5e3" }}>
              <Lock className="text-blue-900 size-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-['Poppins']">Centro de Control</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (password === ADMIN_PASSWORD) setIsAuthenticated(true); else alert("Contraseña incorrecta") }} className="space-y-4">
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl text-center text-lg bg-slate-50 border-0" />
            <button type="submit" className="w-full rounded-full font-bold tracking-widest text-blue-900" style={{ height: "44px", backgroundColor: "#8dd5e3" }}>ENTRAR</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Lato',sans-serif] pb-16">

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-2xl sticky top-0 z-40 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="p-2.5 rounded-2xl bg-slate-50 active:scale-90 transition-transform">
            <ChevronLeft className="size-5 text-slate-700" />
          </button>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Administración</p>
            <h1 className="text-xl font-black text-slate-900 font-['Poppins']">Centro de Control</h1>
          </div>
        </div>
      </div>

      <div className="p-5 max-w-2xl mx-auto space-y-6">

        {/* ── FILTROS DE TIEMPO ── */}
        <div className="bg-white rounded-[28px] shadow-sm p-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Período</p>
          <div className="flex gap-1.5 flex-wrap">
            {(["today", "week", "month", "year", "custom"] as TimeFilter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 rounded-full text-[9px] font-black tracking-widest transition-all"
                style={{
                  height: "24px",
                  backgroundColor: filter === f ? "#8dd5e3" : "#f1f5f9",
                  color: filter === f ? "#1e3a5f" : "#94a3b8",
                }}>
                {f === "today" ? "HOY" : f === "week" ? "SEMANA" : f === "month" ? "MES" : f === "year" ? "AÑO" : "RANGO"}
              </button>
            ))}
          </div>
          {filter === "custom" && (
            <div className="flex gap-3 mt-3">
              <div className="flex-1 space-y-1">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Desde</Label>
                <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-0 text-sm" />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-[9px] font-black text-slate-400 uppercase">Hasta</Label>
                <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-0 text-sm" />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-slate-300" /></div>
        ) : (
          <>
            {/* ── CIERRE DE CAJA ── */}
            <div className="bg-white rounded-[28px] shadow-sm p-5 space-y-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cierre de Caja</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="size-3.5 text-emerald-500" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Ventas</p>
                  </div>
                  <p className="text-xl font-black text-emerald-600">${totalSalesUsd.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{(totalSalesUsd * exchangeRate).toFixed(0)} Bs</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="size-3.5 text-rose-400" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Gastos</p>
                  </div>
                  <p className="text-xl font-black text-rose-500">${totalExpensesUsd.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{(totalExpensesUsd * exchangeRate).toFixed(0)} Bs</p>
                </div>
              </div>
              <div className="rounded-2xl p-4" style={{ backgroundColor: netUsd >= 0 ? "#f0fdf4" : "#fff1f2" }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: netUsd >= 0 ? "#16a34a" : "#e11d48" }}>
                  Neto del período
                </p>
                <p className="text-3xl font-black font-['Poppins']" style={{ color: netUsd >= 0 ? "#15803d" : "#be123c" }}>
                  ${netUsd.toFixed(2)}
                </p>
                <p className="text-sm font-bold mt-0.5" style={{ color: netUsd >= 0 ? "#16a34a" : "#e11d48" }}>
                  {netBs.toFixed(0)} Bs
                </p>
              </div>
            </div>

            {/* ── GRÁFICO DIARIO ── */}
            <div className="bg-white rounded-[28px] shadow-sm p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Ventas — Últimos 7 días</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailyData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 11 }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Ventas"]}
                  />
                  <Bar dataKey="ventas" radius={[8, 8, 0, 0]} fill="#8dd5e3" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── GRÁFICO POR CATEGORÍA ── */}
            <div className="bg-white rounded-[28px] shadow-sm p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Ventas por Categoría</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryData} barSize={36} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 11 }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`, "Ventas"]}
                  />
                  <Bar dataKey="ventas" radius={[8, 8, 0, 0]}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── REGISTRAR GASTO ── */}
            <div className="bg-white rounded-[28px] shadow-sm p-5 space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registrar Gasto</p>
              <Input placeholder="Descripción del gasto" value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="h-12 rounded-xl bg-slate-50 border-0 font-medium" />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                  <Input type="number" placeholder="Monto USD" value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-0 font-bold pl-9" />
                </div>
                <Input type="date" value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-0 w-36 text-sm font-medium" />
              </div>
              <button onClick={handleSaveExpense} disabled={savingExpense || !expenseForm.amount || !expenseForm.description}
                className="w-full rounded-full font-bold tracking-widest text-blue-900 disabled:opacity-40 transition-transform active:scale-95"
                style={{ height: "44px", backgroundColor: "#8dd5e3" }}>
                {savingExpense ? "GUARDANDO..." : "GUARDAR GASTO"}
              </button>
            </div>

            {/* ── HISTORIAL DE GASTOS ── */}
            {filteredExpenses.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Gastos del período</p>
                {filteredExpenses.map(e => (
                  <div key={e.id} className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{e.description}</p>
                      <p className="text-[10px] text-slate-400">{e.expense_date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-rose-500">${Number(e.amount_usd).toFixed(2)}</p>
                      <button onClick={() => handleDeleteExpense(e.id)} className="p-1.5 rounded-xl bg-slate-50 text-slate-300 active:scale-90 transition-transform">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
