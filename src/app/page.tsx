import { supabase } from "@/lib/supabase"
import HomeClient from "@/components/HomeClient"
import { fetchBCVRate } from "@/lib/bcv"
import fs from "fs"
import path from "path"
import os from "os"

// Sincronizar automáticamente el nuevo logo de Subibaja si existe en Descargas
try {
  const downloadKids = path.join(os.homedir(), "Downloads", "Subibaja logo.jpeg")
  const targetKids = path.join(process.cwd(), "public", "logo-principal.jpg")
  if (fs.existsSync(downloadKids)) {
    fs.copyFileSync(downloadKids, targetKids)
  }
  // Sincronizar las 6 imágenes de la guía de tallas desde Descargas si existen
  const tallasDir = path.join(process.cwd(), "public", "tallas")
  if (!fs.existsSync(tallasDir)) {
    fs.mkdirSync(tallasDir, { recursive: true })
  }
  const tallasMap = [
    { src: ["Tallas 1.jpeg", "tallas 1.jpeg"], dest: "guia-talla-1.jpeg" },
    { src: ["tallas 2.jpeg", "Tallas 2.jpeg"], dest: "guia-talla-2.jpeg" },
    { src: ["tallas 3.jpeg", "Tallas 3.jpeg"], dest: "guia-talla-3.jpeg" },
    { src: ["tallas 4.jpeg", "Tallas 4.jpeg"], dest: "guia-talla-4.jpeg" },
    { src: ["tallas 5.jpeg", "Tallas 5.jpeg"], dest: "guia-talla-5.jpeg" },
    { src: ["tallas 6.jpeg", "Tallas 6.jpeg"], dest: "guia-talla-6.jpeg" },
  ]
  for (const item of tallasMap) {
    for (const s of item.src) {
      const srcPath = path.join(os.homedir(), "Downloads", s)
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(tallasDir, item.dest))
        break
      }
    }
  }
} catch {
  // En producción Vercel
}

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
