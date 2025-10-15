'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Trata rota de login (cobre /login e /auth/login)
  const isLoginPage =
    pathname === '/login' || pathname === '/auth/login' || pathname?.startsWith('/auth/login');

  // Redirecionamento cliente/admin quando acessam rota genérica
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    if (!pathname) return;

    // Apenas redireciona quando estiverem na raiz ou na rota genérica /dashboard
    if (pathname === '/' || pathname === '/dashboard') {
      if ((user as any)?.role === 'CLIENT') {
        router.push('/client/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, (user as any)?.role, pathname, router]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </div>
    );
  }

  // Se estiver carregando a sessão, mostra loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Se não estiver autenticado, mostra apenas o conteúdo (para páginas públicas como login)
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Se estiver autenticado, mostra o layout completo com header e sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} user={user} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user?.role} />

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}