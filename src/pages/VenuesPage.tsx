import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MarketingLayout from "@/components/MarketingLayout";

const GREEN = "#00C853";

interface Venue {
  id: string; slug: string; name: string; logo_url: string | null;
  city: string | null; primary_color: string | null;
}

export default function VenuesPage() {
  const navigate = useNavigate();
  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["active-venues"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("venues")
        .select("id, slug, name, logo_url, city, primary_color")
        .eq("status", "active")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Venue[];
    },
  });

  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl md:text-4xl font-black text-center mb-3">Active Venues</h1>
        <p className="text-center text-muted-foreground mb-10 max-w-md mx-auto">
          Find a padel venue near you and start playing.
        </p>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading venues…</div>
        ) : venues.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No venues yet. <button onClick={() => navigate("/register")} className="text-primary font-semibold underline">Register yours</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {venues.map(v => (
              <div key={v.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center gap-3">
                {v.logo_url ? (
                  <img src={v.logo_url} alt={v.name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${v.primary_color || GREEN}12` }}>🏟️</div>
                )}
                <div>
                  <div className="font-bold text-base">{v.name}</div>
                  {v.city && <div className="text-xs text-muted-foreground">{v.city}</div>}
                </div>
                <button
                  onClick={() => navigate(`/${v.slug}/rank`)}
                  className="text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                  style={{ background: `${v.primary_color || GREEN}12`, color: v.primary_color || GREEN, border: `1px solid ${v.primary_color || GREEN}30` }}
                >
                  View Rankings →
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/register")}
            className="bg-primary text-primary-foreground font-bold text-sm px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Register Your Venue — Free
          </button>
        </div>
      </section>
    </MarketingLayout>
  );
}
