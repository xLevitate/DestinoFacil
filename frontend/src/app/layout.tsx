'use client';

import './globals.css';
import { useEffect, useRef } from 'react';
import { Nunito } from 'next/font/google';
import { Provedores } from './providers';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialized = useRef(false);

  useEffect(() => {
    const initPreline = async () => {
      try {
        if (typeof window !== 'undefined') {
          const { HSStaticMethods } = await import('preline/dist/preline.js');
          if (!initialized.current) {
            HSStaticMethods.autoInit();
            initialized.current = true;
          } else {
            HSStaticMethods.autoInit();
          }
        }
      } catch (error) {
        console.error('Failed to initialize Preline UI', error);
      }
    };
    
    initPreline();
    
    const observer = new MutationObserver((mutations) => {
      const shouldReinit = mutations.some(mutation => {
        return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
      });
      
      if (shouldReinit) {
        initPreline();
      }
    });

    if (typeof window !== 'undefined') {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full scroll-smooth dark`}>
      <body className="font-nunito h-full bg-slate-900">
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
