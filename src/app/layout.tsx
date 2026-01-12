import { CartProvider } from "../context/CartContext";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "My App",
  description: "Clean Next.js starter",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  )
}