import "./globals.css";
import Link from "next/link";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-black text-white p-6">
            <h1 className="text-2xl font-bold mb-10">
              MFI Motor Group
            </h1>

            <ul className="space-y-4">
        <li>
  <Link href="/" className="hover:text-gray-300">
    Dashboard
  </Link>
</li>
              <li>
  <Link href="/vehicles" className="hover:text-gray-300">
    Vehicles
  </Link>
</li>
             <li>
  <Link href="/jobcards" className="hover:text-gray-300">
    Job Cards
  </Link>
</li>
              <li className="hover:text-gray-300 cursor-pointer">
                Invoices
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}