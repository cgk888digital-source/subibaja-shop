export const getColorName = (color: string): string => {
  if (!color) return "";
  const normalized = color.toLowerCase().trim();
  
  // Si no empieza con #, asumimos que ya es un nombre y lo devolvemos tal cual
  if (!normalized.startsWith('#')) {
    return color;
  }

  // Helper para convertir hex a RGB
  const hexToRgb = (hex: string) => {
    // Si es formato corto #abc, convertirlo a formato completo #aabbcc
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  // Paleta de colores base
  const colorPalette = [
    { name: 'Blanco', rgb: { r: 255, g: 255, b: 255 } },
    { name: 'Negro', rgb: { r: 0, g: 0, b: 0 } },
    { name: 'Gris Oscuro', rgb: { r: 80, g: 80, b: 80 } },
    { name: 'Gris', rgb: { r: 128, g: 128, b: 128 } },
    { name: 'Plata', rgb: { r: 192, g: 192, b: 192 } },
    { name: 'Rojo', rgb: { r: 255, g: 0, b: 0 } },
    { name: 'Vino', rgb: { r: 128, g: 0, b: 0 } },
    { name: 'Marrón', rgb: { r: 139, g: 69, b: 19 } },
    { name: 'Marrón Oscuro', rgb: { r: 79, g: 37, b: 3 } }, // #4f2503
    { name: 'Naranja', rgb: { r: 255, g: 165, b: 0 } },
    { name: 'Amarillo', rgb: { r: 255, g: 255, b: 0 } },
    { name: 'Oro', rgb: { r: 255, g: 215, b: 0 } },
    { name: 'Crema / Beige', rgb: { r: 245, g: 245, b: 220 } },
    { name: 'Verde', rgb: { r: 0, g: 128, b: 0 } },
    { name: 'Verde Claro', rgb: { r: 144, g: 238, b: 144 } },
    { name: 'Azul', rgb: { r: 0, g: 0, b: 255 } },
    { name: 'Azul Oscuro', rgb: { r: 0, g: 0, b: 139 } },
    { name: 'Azul Marino', rgb: { r: 29, g: 45, b: 80 } }, // #1d2d50
    { name: 'Celeste', rgb: { r: 135, g: 206, b: 235 } },
    { name: 'Morado', rgb: { r: 128, g: 0, b: 128 } },
    { name: 'Lila', rgb: { r: 200, g: 162, b: 200 } },
    { name: 'Rosado', rgb: { r: 255, g: 192, b: 203 } },
    { name: 'Rosa Pastel', rgb: { r: 250, g: 210, b: 225 } },
    { name: 'Fucsia', rgb: { r: 255, g: 0, b: 255 } }
  ];

  try {
    const targetRgb = hexToRgb(normalized);
    
    // Encontrar el color más cercano calculando la distancia euclidiana en el espacio RGB
    let closestColor = colorPalette[0];
    let minDistance = Infinity;

    for (const colorObj of colorPalette) {
      const dr = targetRgb.r - colorObj.rgb.r;
      const dg = targetRgb.g - colorObj.rgb.g;
      const db = targetRgb.b - colorObj.rgb.b;
      const distance = (dr * dr) + (dg * dg) + (db * db);

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = colorObj;
      }
    }

    return closestColor.name;
  } catch (e) {
    // Si hay algún error en el parseo, devolver el color original
    return color;
  }
};
