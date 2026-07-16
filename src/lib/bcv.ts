export async function fetchBCVRate(): Promise<number> {
  try {
    // Revalidar en cache si se usa en SSR, o ignorar si es client side puro
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 3600 } // Cache por 1 hora en server components
    });
    const data = await res.json();
    if (data && data.promedio) {
      return Number(data.promedio);
    }
    return 36.50; // Fallback
  } catch (error) {
    console.error("Error obteniendo BCV", error);
    return 36.50; // Fallback de seguridad
  }
}
