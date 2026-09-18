import fs from 'fs';
import path from 'path';

// Sincronizar automáticamente los logos oficiales desde Descargas si existen
try {
  const homeDir = process.env.USERPROFILE || process.env.HOME || '';
  
  const downloadAdultos = path.join(homeDir, 'Downloads', 'Subibaja Adultos logo.jpeg');
  const targetAdultos = path.join(process.cwd(), 'public', 'logo-adultos.jpg');
  if (fs.existsSync(downloadAdultos)) {
    fs.copyFileSync(downloadAdultos, targetAdultos);
  }

  const downloadKids = path.join(homeDir, 'Downloads', 'Subibaja logo.jpeg');
  const targetKids = path.join(process.cwd(), 'public', 'logo-principal.jpg');
  const tallasFiles = [
    { src: 'Tallas 1.jpeg', dest: 'guia-talla-1.jpeg' },
    { src: 'tallas 2.jpeg', dest: 'guia-talla-2.jpeg' },
    { src: 'tallas 3.jpeg', dest: 'guia-talla-3.jpeg' },
    { src: 'tallas 4.jpeg', dest: 'guia-talla-4.jpeg' },
    { src: 'tallas 5.jpeg', dest: 'guia-talla-5.jpeg' },
    { src: 'tallas 6.jpeg', dest: 'guia-talla-6.jpeg' },
  ];
  const tallasDir = path.join(process.cwd(), 'public', 'tallas');
  if (!fs.existsSync(tallasDir)) {
    fs.mkdirSync(tallasDir, { recursive: true });
  }
  for (const item of tallasFiles) {
    const srcPath = path.join(homeDir, 'Downloads', item.src);
    const destPath = path.join(tallasDir, item.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
} catch (e) {
  // Entorno de producción o sin acceso a Descargas
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nlzgqnkplqldpoghwtzj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;

