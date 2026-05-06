import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/providers/Providers";

export const metadata = {
  title: "RemoteFlex",
  description: "Connecting African talent to global remote opportunities",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
