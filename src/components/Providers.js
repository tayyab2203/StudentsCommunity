'use client';

import { SessionProvider } from 'next-auth/react';
import { SocketProvider } from '@/contexts/SocketContext';

export default function Providers({ children }) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <SocketProvider>
        {children}
      </SocketProvider>
    </SessionProvider>
  );
}

