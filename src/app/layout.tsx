import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ProvedorTema } from '@/context/ProvedorTema';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DestinoFácil - Encontre seu próximo destino',
  description: 'Descubra destinos incríveis ao redor do mundo e encontre voos com facilidade',
  keywords: ['viagem', 'destinos', 'voos', 'turismo', 'férias'],
  authors: [{ name: 'Equipe DestinoFácil' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function LayoutRaiz({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ProvedorTema>
          {children}
        </ProvedorTema>
      </body>
    </html>
  );
}
