import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import SocialSidebar from "@/components/layout/SocialSidebar";
import SmoothScroll from "@/components/SmoothScroll";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5F7263",
};

export const metadata: Metadata = {
  title: "O'Méa | Coffrets Cadeaux Entreprise — RH, CSE & Marque Employeur",
  description:
    "Coffrets cadeaux premium pour entreprises : maternité, naissance, fêtes, événements CSE. Produits naturels Made in France, personnalisables, conformes URSSAF. Devis en 24h.",
  keywords:
    "coffret cadeau entreprise, cadeau CSE, marque employeur, QVT, coffret RH, cadeau collaborateurs, RSE entreprise, coffret naissance entreprise, URSSAF cadeau",
  openGraph: {
    title: "O'Méa | Coffrets Cadeaux Entreprise pour RH & CSE",
    description:
      "Des coffrets naturels et personnalisables pour célébrer vos collaborateurs. Maternité, naissance, fêtes, événements CSE. Conforme URSSAF, livraison clé en main.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        {/* Preload 3D model + draco decoder for instant loading */}
        <link rel="preload" href="/models/tower-optimized.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/draco/draco_decoder.wasm" as="fetch" crossOrigin="anonymous" type="application/wasm" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.add('js-ready');
              (function(){
                var bp=900;
                var wasMobile=window.innerWidth<bp;
                window.matchMedia('(max-width:'+(bp-1)+'px)').addEventListener('change',function(){
                  var isMobile=window.innerWidth<bp;
                  if(isMobile!==wasMobile){window.location.reload();}
                });
              })();
            `,
          }}
        />
        {/* Admin preview sync — only runs inside iframe, after hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if(window.self===window.top)return;
                window.addEventListener('load',function(){
                  var hl=null;
                  window.addEventListener('message',function(e){
                    if(!e.data||!e.data.type)return;
                    if(e.data.type==='omea-scroll-to'){
                      var sel=e.data.selector.split(',');
                      var el=null;
                      for(var i=0;i<sel.length;i++){try{el=document.querySelector(sel[i].trim());if(el)break;}catch(x){}}
                      if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
                    }
                    if(e.data.type==='omea-highlight'){
                      var sel2=e.data.selector.split(',');
                      var el2=null;
                      for(var j=0;j<sel2.length;j++){try{el2=document.querySelector(sel2[j].trim());if(el2)break;}catch(x){}}
                      if(!el2)return;
                      if(e.data.on){
                        el2.style.boxShadow='inset 0 0 0 3px rgba(135,163,141,0.4)';
                      }else{
                        el2.style.boxShadow='';
                      }
                    }
                  });
                });
              })();
            `,
          }}
        />
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `[data-anim], .hero-tag, .hero-title, .hero-subtitle, .hero-keypoints, .hero-ctas, .hero-social, .hero-visual, .hero-strip, .why-header, .bento-card, .why-cta { opacity: 1 !important; transform: none !important; filter: none !important; }`,
            }}
          />
        </noscript>
      </head>
      <body className={`${manrope.variable} ${inter.variable} antialiased`}>
        <SmoothScroll>
          {children}
          <SocialSidebar />
        </SmoothScroll>
      </body>
    </html>
  );
}
