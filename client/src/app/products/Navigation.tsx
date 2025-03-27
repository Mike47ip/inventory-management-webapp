// components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/products"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === "/products" ? "text-black" : "text-muted-foreground"
        }`}
      >
        Products
      </Link>
      <Link
        href="/products/archive"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === "/products/archive" ? "text-black" : "text-muted-foreground"
        }`}
      >
        Archive
      </Link>
    </nav>
  );
}