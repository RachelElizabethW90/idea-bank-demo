import type { Metadata, Viewport } from "next";
import "./globals.css";
import { IdeaBankProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Idea Bank — Demo",
  description: "A small demo app for capturing content ideas. Data stays in your browser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1210" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <IdeaBankProvider>{children}</IdeaBankProvider>
      </body>
    </html>
  );
}
