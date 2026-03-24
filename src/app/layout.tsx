import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import StyledJsxRegistry from "./registry";

export const metadata: Metadata = {
  title: "Bit-by-Bit | with Linh",
  description: "Mỗi ngày một chút kiến thức. Blog cá nhân của Linh về cuộc sống, lập trình và sáng tạo.",
    openGraph: {
    title: "Bit-by-Bit | with Linh",
    description: "Mỗi ngày một chút kiến thức.",
    type: "website",
    images: [
      {
        url: "https://feyzwofpwuutgbuglaqi.supabase.co/storage/v1/object/public/blog-images/default-og.png",
        width: 1200,
        height: 630,
        alt: "Bit-by-Bit | with_Linh",
      },
    ],
  },
  icons: {
    icon: "https://feyzwofpwuutgbuglaqi.supabase.co/storage/v1/object/public/images/1774099534011-p4ncl14qqu.png",
    apple: "https://feyzwofpwuutgbuglaqi.supabase.co/storage/v1/object/public/images/1774099534011-p4ncl14qqu.png",
  },
  verification: {
    google: "iTMDpBLk814FLgdy8pmCddV-gaFGGTmw_O3dEWdomeg",
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
        <StyledJsxRegistry>
          {children}
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
