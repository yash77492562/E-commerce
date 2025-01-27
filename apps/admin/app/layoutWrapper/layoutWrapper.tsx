// components/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ 
  children,
  navbar,
  footer 
}: { 
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.includes('/auth/signup') || pathname.includes('/auth/login');

  return (
    <>
      {!isAuthPage && navbar}
      {children}
      {!isAuthPage && footer}
    </>
  );
}