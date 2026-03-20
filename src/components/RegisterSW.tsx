'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RegisterSW() {
  const pathname = usePathname();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const isSensitiveRoute = 
        pathname.startsWith('/admin') || 
        pathname.startsWith('/checkout') || 
        pathname.startsWith('/meus-pedidos');

      if (isSensitiveRoute) {
        // Desregistrar SW se estiver em rota sensível
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log('SW unregistered for sensitive route:', pathname);
          }
        });
        return;
      }

      const register = () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('SW registered:', reg);
        }).catch((err) => {
          console.log('SW registration failed:', err);
        });
      };

      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
      }
    }
  }, [pathname]);

  return null;
}
