import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        
        {/* Premium Top Navbar */}
        <header className="bg-black text-white shadow-md">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            
            <h1 className="text-xl font-semibold tracking-wide">
              MFI Motor Group
            </h1>

            <nav className="flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-gray-300 transition">
                Dashboard
              </Link>

              <Link href="/vehicles" className="hover:text-gray-300 transition">
                Vehicles
              </Link>

              <Link href="/jobcards" className="hover:text-gray-300 transition">
                Job Cards
              </Link>

              <span className="hover:text-gray-300 cursor-pointer transition">
                Invoices
              </span>
            </nav>
          </div>
        </header>
<main className="w-full">
  {children}
</main>

      </body>
    </html>
  );
}