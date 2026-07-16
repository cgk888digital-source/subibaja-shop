import { supabase } from "@/lib/supabase"
import ProductClient from "@/components/ProductClient"
import { fetchBCVRate } from "@/lib/bcv"

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [exchangeRate, { data: product }, { data: categories }] = await Promise.all([
    fetchBCVRate(),
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('created_at', { ascending: true })
  ])

  
  return (
    <ProductClient 
      initialProduct={product}
      initialCategories={categories || []}
      initialExchangeRate={exchangeRate}
    />
  )
}
