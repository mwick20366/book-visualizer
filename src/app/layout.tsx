import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Special_Elite } from "next/font/google";

const specialElite = Special_Elite({
  subsets: ["latin"],

  weight: "400",

  variable: "--font-typewriter",
});

export const metadata: Metadata = {
  title: "SceneWoven",
  description: "A platform for visualizing scenes from your favorite books",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className={specialElite.variable}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
