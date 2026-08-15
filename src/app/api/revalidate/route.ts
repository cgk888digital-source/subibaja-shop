import { revalidatePath } from 'next/cache'

// Invalida la cache ISR de toda la tienda.
// Se llama desde el admin despues de guardar cambios que afectan al storefront
// (orden de categorias, destacados, altas/bajas), para que el cambio se vea
// en la siguiente visita y no una recarga despues.
export async function POST() {
  // 'layout' sobre la raiz purga tambien el Client Cache y las rutas hijas
  // (/, /producto/[id], /puntos, /tallas, /giftcard).
  revalidatePath('/', 'layout')

  return Response.json({ revalidated: true, now: Date.now() })
}
