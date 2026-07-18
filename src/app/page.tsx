import { supabase } from "@/lib/supabase"
import HomeClient from "@/components/HomeClient"
import { fetchBCVRate } from "@/lib/bcv"

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function HomePage() {
  const [exchangeRate, { data: products }, { data: categories }] = await Promise.all([
    fetchBCVRate(),
    supabase.from('products').select('*').eq('stock_status', 'in_stock').order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
  ])
  
  return (
    <HomeClient 
      initialProducts={products || []}
      initialCategories={categories || []}
      initialExchangeRate={exchangeRate}
    />
  )
}
