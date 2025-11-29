import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";

import ConvexClientProvider from "@/components/convex/ConvexClientProvider";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Romu",
  description: "Save, think, and chat about articles with Romu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSerif.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
