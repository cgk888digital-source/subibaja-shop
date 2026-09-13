import { supabase } from "@/lib/supabase"
import AdultosClient from "./AdultosClient"
import { fetchBCVRate } from "@/lib/bcv"

export const revalidate = 60 // Revalidate cache every 60 seconds

export const metadata = {
  title: "Subibaja Adultos | Calzado y Accesorios Exclusivos",
  description: "Descubre la colección de calzado y accesorios Subibaja Adultos. Estilo, confort y confección europea de primera calidad.",
}

export default async function AdultosPage() {
  const [exchangeRate, { data: products }, { data: categories }] = await Promise.all([
    fetchBCVRate(),
    supabase.from('products').select('*').or('stock_status.eq.in_stock,badge.eq.agotado,badge.eq.agotado_rojo').order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
  ])
  
  return (
    <AdultosClient 
      initialProducts={products || []}
      initialCategories={categories || []}
      initialExchangeRate={exchangeRate}
    />
  )
}
