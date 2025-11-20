import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { GlobalLoadingProvider } from '@/components/providers/global-loading-provider';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowZenit',
  description: 'Gestão Integrada GTD GUT PDCA MASP',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen')}>
        <AuthProvider>
          <GlobalLoadingProvider>
            {children}
          </GlobalLoadingProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
