'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/componentes/ui/button';
import Link from 'next/link';

interface NotificacaoAuthProps {
  visivel: boolean;
  onFechar: () => void;
  mensagem?: string;
}

export default function NotificacaoAuth({ 
  visivel, 
  onFechar, 
  mensagem = "Você precisa estar logado para favoritar destinos" 
}: NotificacaoAuthProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visivel) {
      setShow(true);
      // Auto-fechar após 5 segundos
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onFechar, 300); // Esperar animação terminar
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visivel, onFechar]);

  if (!visivel) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ease-in-out ${
          show 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Login Necessário
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {mensagem}
            </p>
            
            <div className="mt-3 flex space-x-2">
              <Button size="sm" asChild>
                <Link href="/auth">
                  Fazer Login
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShow(false);
                  setTimeout(onFechar, 300);
                }}
              >
                Depois
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setShow(false);
              setTimeout(onFechar, 300);
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 