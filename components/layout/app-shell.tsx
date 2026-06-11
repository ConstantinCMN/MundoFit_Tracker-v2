import type { ReactNode } from 'react';
import { Header } from './header';
import { BottomNav } from './bottom-nav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen min-h-dvh bg-[#0a0a0a]">
      {/* Center and constrain on desktop */}
      <div className="app-container flex min-h-screen min-h-dvh flex-col">
        <Header />

        <main
          className="flex-1 overflow-y-auto"
          style={{
            paddingTop: '48px',
            paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
