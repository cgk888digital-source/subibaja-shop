// Pide al servidor que invalide la cache de la tienda.
// No lanza: si falla, el cambio igual esta guardado en Supabase y se vera
// cuando expire el revalidate del segmento.
export async function revalidateStorefront() {
  try {
    await fetch('/api/revalidate', { method: 'POST' })
  } catch (err) {
    console.error('No se pudo refrescar la cache de la tienda:', err)
  }
}
