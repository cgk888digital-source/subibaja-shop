import { supabase } from "@/lib/supabase"

export async function fetchBCVRate(): Promise<number> {
  try {
    // 1. Intentamos obtener la tasa automática de la API
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      next: { revalidate: 3600 } // Actualiza cada hora
    });
    const data = await res.json();
    
    if (data && data.promedio) {
      // Guardamos la última tasa automática en la base de datos por seguridad
      await supabase.from('settings').upsert({ id: 'exchange_rate', value: data.promedio.toString() });
      return Number(data.promedio);
    }
  } catch (err) {
    console.error("Error fetching auto BCV rate:", err);
  }
  
  // 2. Fallback: Si la API automática se cae, intentamos leer la última tasa guardada en base de datos
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'exchange_rate')
      .single();
      
    if (!error && data && data.value) {
      return Number(data.value);
    }
  } catch (err) {
    console.error("Error fetching manual BCV rate:", err);
  }
  
  // 3. Fallback absoluto
  return 732.47;
}
