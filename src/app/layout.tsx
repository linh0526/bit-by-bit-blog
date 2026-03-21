import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Bit-by-Bit | with Linh",
  description: "Mỗi ngày một chút kiến thức. Blog cá nhân của Linh về cuộc sống, lập trình và sáng tạo.",
  openGraph: {
    title: "Bit-by-Bit | with Linh",
    description: "Mỗi ngày một chút kiến thức.",
    type: "website",
  },
  icons: {
    icon: "https://feyzwofpwuutgbuglaqi.supabase.co/storage/v1/object/public/images/1774099534011-p4ncl14qqu.png",
    apple: "https://feyzwofpwuutgbuglaqi.supabase.co/storage/v1/object/public/images/1774099534011-p4ncl14qqu.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}
