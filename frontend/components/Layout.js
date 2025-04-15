import Navbar from './Navbar';
import Head from 'next/head';

export default function Layout({ children, title = 'DestinoFacil' }) {
  return (
    <>
      <Head>
        <title>{title} - Seu buscador de destinos</title>
        <meta name="description" content="Encontre os melhores destinos para sua viagem" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} DestinoFacil. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
