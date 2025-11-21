import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MainLayout } from '@/components/layout/main-layout';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/providers/auth-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mente Aberta',
  description: 'Sistema moderno para gerenciamento de biblioteca',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster position="top-right" richColors closeButton expand={false}/>
        </AuthProvider>
      </body>
    </html>
  );
}