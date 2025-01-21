// frontend/app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/basic/theme-provider";
import Header from "@/components/basic/header";
import Footer from "@/components/basic/footer";
import styles from "./styles/Layout.module.css";
import { ThemeWrapper } from "@/components/basic/theme-wrapper";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ClientProvider from "../components/DiscordClientProvider"; // Correct path
import { Toaster } from "sonner"; 


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MetaHive",  
  description: "A dummy project with dark and light mode",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeWrapper>
            <div className={styles.pageContainer}>
              <AuthProvider>
                <ClientProvider>
                  <Header />
                  <main className={`${styles.main} container mx-auto  px-4 py-8`}>
                    {children}
                  </main>
                  <Footer />
                </ClientProvider>
              </AuthProvider>
            </div>
          </ThemeWrapper>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
