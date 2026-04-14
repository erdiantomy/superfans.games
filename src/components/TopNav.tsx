import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/superfans-logo.png";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/sessions", label: "Sessions" },
  
  { to: "/gamification", label: "Gamification" },
  { to: "/venues", label: "Venues" },
  { to: "/pricing", label: "Pricing" },
  { to: "/top-players", label: "Top Players" },
];

export default function TopNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="SuperFans" className="h-8 object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-primary-foreground font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          )}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === l.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
