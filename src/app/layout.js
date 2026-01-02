import { Comfortaa, Ubuntu } from "next/font/google";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "University Student Connection Platform",
  description: "Connect with students, showcase projects, and collaborate",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${comfortaa.variable} ${ubuntu.variable} font-comfortaa antialiased bg-cream dark:bg-navy text-navy dark:text-cream`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
