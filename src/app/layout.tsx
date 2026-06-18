import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subibaja Shop | Boutique de Moda Infantil y Adultos",
  description: "Explora la exclusiva boutique online de Subibaja Shop. Encuentra moda premium para niños y adultos, y únete a nuestro programa de Clientes VIP para obtener increíbles descuentos y beneficios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-100">
        <div className="w-full max-w-md md:max-w-none mx-auto bg-white min-h-screen relative shadow-2xl md:shadow-none overflow-x-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
