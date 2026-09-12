import { supabase } from "@/lib/supabase"
import HomeClient from "@/components/HomeClient"
import { fetchBCVRate } from "@/lib/bcv"

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function HomePage() {
  const [exchangeRate, { data: products }, { data: categories }, { data: banners }] = await Promise.all([
    fetchBCVRate(),
    supabase.from('products').select('*').or('stock_status.eq.in_stock,badge.eq.agotado,badge.eq.agotado_rojo').order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order', { ascending: true })
  ])
  
  const heroBanners = banners?.filter(b => (b.position || 'hero') === 'hero') || []
  const middleBanners = banners?.filter(b => b.position === 'middle') || []
  const instagramBanners = banners?.filter(b => b.position === 'instagram') || []
  
  return (
    <HomeClient 
      initialProducts={products || []}
      initialCategories={categories || []}
      initialExchangeRate={exchangeRate}
      initialBanners={heroBanners.length > 0 ? heroBanners : [{ id: 'default', image_url: '/portada.jpg', title: 'Portada Principal' }]}
      initialMiddleBanners={middleBanners.length > 0 ? middleBanners : [{ id: 'default-middle', image_url: '/imagen_home.jpg', title: 'Colección Subibaja' }]}
      initialInstagramPosts={instagramBanners}
    />
  )
}
