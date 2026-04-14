import { createContext, useContext, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Venue {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  city: string | null;
  country: string | null;
  courts_default: number | null;
  monthly_prize: number | null;
  prize_split_1st: number | null;
  prize_split_2nd: number | null;
  prize_split_3rd: number | null;
  primary_color: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
}

interface VenueCtx {
  venue: Venue | null;
  loading: boolean;
  error: string | null;
  slug: string;
}

const VenueContext = createContext<VenueCtx>({
  venue: null,
  loading: true,
  error: null,
  slug: "",
});

export const useVenue = () => useContext(VenueContext);

export function VenueProvider({ children }: { children: ReactNode }) {
  const { slug = "" } = useParams<{ slug: string }>();

  const { data: venue, isLoading, error } = useQuery({
    queryKey: ["venue", slug],
    queryFn: async () => {
      // venues table exists in DB but may not be in generated types yet
      const { data, error } = await (supabase as any)
        .from("venues")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Venue;
    },
    enabled: !!slug,
  });

  return (
    <VenueContext.Provider
      value={{
        venue: venue ?? null,
        loading: isLoading,
        error: error?.message ?? null,
        slug,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
}
