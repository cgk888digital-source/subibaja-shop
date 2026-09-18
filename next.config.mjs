import fs from 'fs';
import path from 'path';

// Sincronizar automáticamente el logo oficial de Adultos desde Descargas si existe
try {
  const homeDir = process.env.USERPROFILE || process.env.HOME || '';
  const downloadLogo = path.join(homeDir, 'Downloads', 'Subibaja Adultos logo.jpeg');
  const targetLogo = path.join(process.cwd(), 'public', 'logo-adultos.jpg');
  if (fs.existsSync(downloadLogo)) {
    fs.copyFileSync(downloadLogo, targetLogo);
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

