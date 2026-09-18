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
  if (fs.existsSync(downloadKids)) {
    fs.copyFileSync(downloadKids, targetKids);
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

