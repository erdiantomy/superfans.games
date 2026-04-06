export type UserRole = "player" | "host" | "admin" | "super-admin";

export interface PageContext {
  pageName: string;
  lastUpdated: string;
  actions: string[];
  knowledge: string[];
  suggestions: string[];
  roleOverrides?: Partial<Record<UserRole, Partial<Pick<PageContext, "actions" | "knowledge" | "suggestions">>>>;
}

const registry: Record<string, PageContext> = {
  "/": {
    pageName: "Home",
    lastUpdated: "2026-04-06",
    actions: [
      "View platform introduction and tutorials",
      "Learn about player, venue owner, and host flows",
      "Browse XP rewards table and division system",
    ],
    knowledge: [
      "Landing page for SuperFans Pro fan engagement platform.",
      "Shows onboarding flows for three roles: Player, Venue Owner, and Session Host.",
      "Displays the XP reward table and division tiers.",
    ],
    suggestions: [
      "Bagaimana cara bermain dan mendapatkan XP?",
      "Apa saja divisi yang tersedia?",
      "Bagaimana cara mendaftar sebagai venue?",
    ],
  },
  "/auth": {
    pageName: "Login",
    lastUpdated: "2026-04-06",
    actions: [
      "Sign in with Google OAuth",
      "Sign in or sign up with email and password",
      "Toggle between sign-in and sign-up mode",
    ],
    knowledge: [
      "Authentication page for all users.",
      "Supports Google OAuth and email/password login.",
      "Redirects authenticated users to /fanprize.",
    ],
    suggestions: [
      "Bagaimana cara login?",
      "Apakah bisa login pakai Google?",
      "Saya lupa password, bagaimana?",
    ],
  },
  "/register": {
    pageName: "Venue Registration",
    lastUpdated: "2026-04-06",
    actions: [
      "Fill contact details for venue",
      "Enter venue name, slug, and court count",
      "Configure prize pool amounts and splits",
      "Set admin password",
      "Agree to terms and submit registration",
    ],
    knowledge: [
      "Multi-step registration form for new venues.",
      "Requires venue name, slug, number of courts, and prize configuration.",
      "Admin password is set during registration for venue management.",
    ],
    suggestions: [
      "Apa saja langkah registrasi venue?",
      "Bagaimana cara mengatur prize pool?",
      "Berapa jumlah court minimum?",
    ],
  },
  "/fanprize": {
    pageName: "FanPrize Hub",
    lastUpdated: "2026-04-06",
    actions: [
      "View home screen, match details, wallet, store, and profile",
      "Navigate between sections via bottom navigation",
      "Access notifications",
    ],
    knowledge: [
      "Main app shell for authenticated users.",
      "Contains bottom navigation for home, match, wallet, store, and profile.",
      "Routes to sub-screens based on authentication state.",
    ],
    suggestions: [
      "Bagaimana cara melihat saldo wallet saya?",
      "Di mana saya bisa lihat match yang sedang berlangsung?",
      "Bagaimana cara mengakses profil saya?",
    ],
    roleOverrides: {
      admin: {
        actions: [
          "View home screen, match details, wallet, store, and profile",
          "Navigate between sections via bottom navigation",
          "Access admin panel from navigation",
        ],
      },
    },
  },
  "/topup": {
    pageName: "Top Up Credits",
    lastUpdated: "2026-04-06",
    actions: [
      "Browse credit packages (Starter, Regular, Pro, Elite)",
      "Choose Indonesian payment method (GoPay, OVO, DANA, etc.)",
      "Initiate payment for selected package",
      "View current credit balance",
    ],
    knowledge: [
      "Credit top-up page with multiple package tiers.",
      "Supports Indonesian e-wallet and bank payment methods.",
      "Credits are used to support players in live sessions.",
    ],
    suggestions: [
      "Paket top-up apa saja yang tersedia?",
      "Metode pembayaran apa yang didukung?",
      "Untuk apa kredit digunakan?",
    ],
  },
  "/payment/success": {
    pageName: "Payment Success",
    lastUpdated: "2026-04-06",
    actions: [
      "View payment confirmation and updated balance",
      "Return to game",
    ],
    knowledge: [
      "Confirmation page shown after a successful credit top-up payment.",
      "Displays updated credit balance.",
    ],
    suggestions: [
      "Berapa saldo saya sekarang?",
      "Bagaimana cara menggunakan kredit?",
      "Ke mana saya harus pergi setelah top-up?",
    ],
  },
  "/payment/failed": {
    pageName: "Payment Failed",
    lastUpdated: "2026-04-06",
    actions: [
      "Retry payment",
      "Return to home",
    ],
    knowledge: [
      "Shown when a credit top-up payment fails or is cancelled.",
      "User can retry or navigate back to the main page.",
    ],
    suggestions: [
      "Kenapa pembayaran saya gagal?",
      "Bagaimana cara coba lagi?",
      "Apakah saldo saya terpengaruh?",
    ],
  },
  "/superadmin": {
    pageName: "Super Admin Dashboard",
    lastUpdated: "2026-04-06",
    actions: [
      "Log in with super admin email/password",
      "Manage all venues on the platform",
      "Approve or reject new venue registrations",
      "View analytics charts and revenue data",
      "Manage matches and registrations",
    ],
    knowledge: [
      "Platform-level admin dashboard for super admins only.",
      "Requires separate email authentication.",
      "Shows all venues, revenue data, and registration approvals.",
    ],
    suggestions: [
      "Bagaimana cara menyetujui venue baru?",
      "Di mana saya bisa melihat data revenue?",
      "Bagaimana cara mengelola registrasi?",
    ],
  },
  // Venue-scoped routes use segment matching
  "/:slug": {
    pageName: "Venue Page",
    lastUpdated: "2026-04-06",
    actions: [
      "View live sessions at venue",
      "Browse monthly and lifetime leaderboards",
      "View venue settings and information",
    ],
    knowledge: [
      "Public venue hub page showing live games and player rankings.",
      "Venue-specific leaderboards with monthly and lifetime views.",
    ],
    suggestions: [
      "Siapa pemain terbaik di venue ini?",
      "Apakah ada session yang sedang berlangsung?",
      "Bagaimana cara join session?",
    ],
  },
  "/:slug/dashboard": {
    pageName: "Player Dashboard",
    lastUpdated: "2026-04-06",
    actions: [
      "Edit display name, bio, and social links (Instagram, TikTok, Twitter)",
      "Toggle profile visibility",
      "View donation history",
    ],
    knowledge: [
      "Personal player profile page.",
      "Profile owner can edit; others see a read-only view.",
      "Shows donation and support history.",
    ],
    suggestions: [
      "Bagaimana cara mengedit profil saya?",
      "Bagaimana cara menambahkan link sosial media?",
      "Di mana saya bisa lihat riwayat donasi?",
    ],
  },
  "/:slug/rank": {
    pageName: "Rankings",
    lastUpdated: "2026-04-06",
    actions: [
      "Switch between monthly and lifetime rankings",
      "View top 3 podium visualization",
      "Browse full player rankings",
      "Claim profile banner",
    ],
    knowledge: [
      "Global leaderboard page with monthly and lifetime views.",
      "Shows podium for top 3 players with division badges and win rates.",
    ],
    suggestions: [
      "Bagaimana cara naik peringkat?",
      "Apa bedanya ranking bulanan dan lifetime?",
      "Bagaimana cara claim banner?",
    ],
  },
  "/:slug/host": {
    pageName: "Host Dashboard",
    lastUpdated: "2026-04-06",
    actions: [
      "Create a new session",
      "View list of own sessions",
      "Manage session settings (courts, format)",
    ],
    knowledge: [
      "Session host management page.",
      "Requires a registered padel player account.",
      "Displays host-specific session statistics.",
    ],
    suggestions: [
      "Bagaimana cara membuat session baru?",
      "Bagaimana cara mengatur jumlah court?",
      "Di mana saya bisa lihat session saya?",
    ],
    roleOverrides: {
      host: {
        suggestions: [
          "Bagaimana cara membuat session baru?",
          "Bagaimana cara mengelola format pertandingan?",
          "Bagaimana cara melihat statistik session saya?",
        ],
      },
    },
  },
  "/:slug/admin": {
    pageName: "Venue Admin",
    lastUpdated: "2026-04-06",
    actions: [
      "Approve pending sessions",
      "Verify or reject player scores",
      "Track XP calculations",
      "Manage venue settings (prize pool, splits, courts)",
    ],
    knowledge: [
      "Venue admin control panel, password-protected.",
      "Tabs for overview, sessions, scores, tracker, and settings.",
      "Only accessible by venue admins.",
    ],
    suggestions: [
      "Bagaimana cara approve session?",
      "Bagaimana cara verifikasi skor?",
      "Di mana pengaturan prize pool?",
    ],
    roleOverrides: {
      admin: {
        suggestions: [
          "Bagaimana cara cepat approve semua session pending?",
          "Bagaimana cara mengubah prize pool split?",
          "Di mana saya bisa track XP calculation?",
        ],
      },
    },
  },
  "/:slug/session/:code": {
    pageName: "Live Session",
    lastUpdated: "2026-04-06",
    actions: [
      "Join or request to join a session",
      "Support players with credits",
      "View live leaderboard",
      "Share session link",
    ],
    knowledge: [
      "Live game session detail page.",
      "Players can join and compete; supporters can back players with credits.",
      "Shows pending and approved players.",
    ],
    suggestions: [
      "Bagaimana cara join session ini?",
      "Bagaimana cara support pemain?",
      "Apa keuntungan menjadi supporter?",
    ],
    roleOverrides: {
      host: {
        actions: [
          "Approve or reject join requests",
          "Manage session participants",
          "View live leaderboard",
          "Share session link",
        ],
        suggestions: [
          "Bagaimana cara approve pemain?",
          "Bagaimana cara mengelola peserta?",
          "Bagaimana cara share link session?",
        ],
      },
    },
  },
};

const FALLBACK_CONTEXT: PageContext = {
  pageName: "SuperFans Pro",
  lastUpdated: "2026-04-06",
  actions: [
    "Navigate to the main pages using the menu",
    "Access your profile and wallet",
  ],
  knowledge: [
    "SuperFans Pro is a fan engagement platform for padel sports.",
    "You can earn XP, support players, and compete on leaderboards.",
  ],
  suggestions: [
    "Apa itu SuperFans Pro?",
    "Bagaimana cara memulai?",
    "Di mana saya bisa melihat peringkat?",
  ],
};

/**
 * Match a pathname against the registry.
 * Tries exact match → segment pattern match → fallback.
 */
export function getPageContext(
  pathname: string,
  opts?: { userId?: string; role?: UserRole },
): PageContext {
  // 1. Exact match
  if (registry[pathname]) {
    return applyRoleOverrides(registry[pathname], opts?.role);
  }

  // 2. Segment pattern match
  const segments = pathname.split("/").filter(Boolean);
  const patterns = Object.keys(registry).filter((k) => k.includes(":"));

  for (const pattern of patterns) {
    const patternSegments = pattern.split("/").filter(Boolean);
    if (patternSegments.length !== segments.length) continue;

    const match = patternSegments.every(
      (ps, i) => ps.startsWith(":") || ps === segments[i],
    );
    if (match) {
      return applyRoleOverrides(registry[pattern], opts?.role);
    }
  }

  // 3. Fallback
  return FALLBACK_CONTEXT;
}

function applyRoleOverrides(
  ctx: PageContext,
  role?: UserRole,
): PageContext {
  if (!role || !ctx.roleOverrides?.[role]) return ctx;
  const overrides = ctx.roleOverrides[role]!;
  return {
    ...ctx,
    actions: overrides.actions ?? ctx.actions,
    knowledge: overrides.knowledge ?? ctx.knowledge,
    suggestions: overrides.suggestions ?? ctx.suggestions,
  };
}

/** Returns entries where lastUpdated is older than 30 days from now. */
export function getStalenessReport(): Array<{ route: string; pageName: string; lastUpdated: string; daysOld: number }> {
  const now = Date.now();
  const stale: Array<{ route: string; pageName: string; lastUpdated: string; daysOld: number }> = [];

  for (const [route, ctx] of Object.entries(registry)) {
    const updated = new Date(ctx.lastUpdated).getTime();
    const daysOld = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
    if (daysOld > 30) {
      stale.push({ route, pageName: ctx.pageName, lastUpdated: ctx.lastUpdated, daysOld });
    }
  }

  return stale;
}
