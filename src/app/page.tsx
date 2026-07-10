import { supabase } from "@/lib/supabase"
import HomeClient from "@/components/HomeClient"

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function HomePage() {
  const [{ data: settings }, { data: products }, { data: categories }] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 'exchange_rate').single(),
    supabase.from('products').select('*').eq('stock_status', 'in_stock').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('created_at', { ascending: true })
  ])

  const exchangeRate = settings ? settings.value : 36.50
  
  return (
    <HomeClient 
      initialProducts={products || []}
      initialCategories={categories || []}
      initialExchangeRate={exchangeRate}
    />
  )
}
