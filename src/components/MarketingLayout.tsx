import TopNav from "@/components/TopNav";
import LanguageToggle from "@/components/LanguageToggle";
import logo from "@/assets/superfans-logo.png";

const GREEN = "#00C853";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main>{children}</main>
      <footer className="border-t border-border py-8 px-4 text-center">
        <img src={logo} alt="SuperFans" className="h-8 mx-auto object-contain" />
        <p className="text-sm text-muted-foreground mt-2">Built for padel athletes and their fans</p>
        <p className="text-xs text-muted-foreground mt-1">© 2026 SuperFans. All rights reserved.</p>
        <div className="mt-3 flex justify-center">
          <LanguageToggle />
        </div>
      </footer>
    </div>
  );
}
