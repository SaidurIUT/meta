import type { Metadata } from 'next';

import { Toaster } from 'sonner';

import Footer from './components/common/footer';
import Header from './components/common/header';


import './globals.css';



export const metadata: Metadata = {
  title: 'JoyBoard',
  description: 'Manage your projects with joy',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        
          <Header />
          {children}
          <Footer />
          <Toaster />
      
      </body>
    </html>
  );
}
