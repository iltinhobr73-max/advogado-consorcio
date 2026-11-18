import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

// Grotesca variável com eixo de largura: usamos condensada no display.
const display = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Mono para anotações de margem, numeração e metadados de documento.
const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Advogado de consórcios em Brasília | LGA Advogados",
  description:
    "Análise jurídica de contratos de consórcio: restituição de valores, taxa de administração, multa por desistência, promessa de contemplação e golpes. Atendimento online. OAB/DF 48.163.",
  openGraph: {
    title: "Estava no contrato. Só não estava em destaque.",
    description: "Envie seu contrato de consórcio: lemos cláusula por cláusula e respondemos por escrito.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#142f40",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${mono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Marca que há JS: só então o conteúdo animado começa escondido (ver globals.css). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
