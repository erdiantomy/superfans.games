import TopNav from "@/components/TopNav";
import LanguageToggle from "@/components/LanguageToggle";

const GREEN = "#00C853";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main>{children}</main>
      <footer className="border-t border-border py-8 px-4 text-center">
        <span className="font-display text-lg font-black tracking-wide">SUPERFANS</span>
        <span className="text-xs text-muted-foreground tracking-widest">.GAMES</span>
        <p className="text-sm text-muted-foreground mt-2">Built for padel athletes and their fans</p>
        <p className="text-xs text-muted-foreground mt-1">© 2026 SuperFans. All rights reserved.</p>
        <div className="mt-3 flex justify-center">
          <LanguageToggle />
        </div>
      </footer>
    </div>
  );
}
