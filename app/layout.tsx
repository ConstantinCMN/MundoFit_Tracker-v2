import type { ReactNode } from 'react';

// Root layout is intentionally minimal.
// The <html> and <body> tags are rendered in app/[locale]/layout.tsx
// so the lang attribute can be set dynamically per locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
