'use client';

import { ReactNode } from 'react';
import { ProvedorAuth } from './context/AuthContext';
import { ProvedorDestino } from './context/DestinationContext';

// componente que fornece os contextos para a aplicacao
export function Provedores({ children }: { children: ReactNode }) {
  return (
    <ProvedorAuth>
      <ProvedorDestino>
        {children}
      </ProvedorDestino>
    </ProvedorAuth>
  );
} 