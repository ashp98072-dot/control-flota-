import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import NavBar from "./NavBar";
import { contarAlertas } from "@/lib/alertas";
import { obtenerPerfilActual } from "@/lib/perfil";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Control de flota",
  description: "Sistema de control de flota de camiones",
};

// Se ejecuta antes de pintar la página para evitar el parpadeo
// entre el tema guardado y el tema por defecto.
const scriptTema = `
(function () {
  try {
    var guardado = localStorage.getItem('tema');
    var oscuro = guardado ? guardado === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (oscuro) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const perfil = await obtenerPerfilActual();
  const alertas = perfil?.rol === 'admin' ? await contarAlertas() : 0;

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="script-tema" strategy="beforeInteractive">
          {scriptTema}
        </Script>
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NavBar alertas={alertas} rol={perfil?.rol ?? null} />
        {children}
      </body>
    </html>
  );
}
