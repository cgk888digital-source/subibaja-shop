import { supabase } from "@/lib/supabase"
import ProductClient from "@/components/ProductClient"

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [{ data: settings }, { data: product }, { data: categories }] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 'exchange_rate').single(),
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('created_at', { ascending: true })
  ])

  const exchangeRate = settings ? settings.value : 36.50
  
  return (
    <ProductClient 
      initialProduct={product}
      initialCategories={categories || []}
      initialExchangeRate={exchangeRate}
    />
  )
}
