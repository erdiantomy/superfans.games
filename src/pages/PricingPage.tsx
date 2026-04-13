import { useNavigate } from "react-router-dom";
import MarketingLayout from "@/components/MarketingLayout";

const GREEN = "#00C853";

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <MarketingLayout>
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl md:text-4xl font-black text-center mb-3">
          Simple & Transparent Pricing
        </h1>
        <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
          No monthly fees. No hidden costs. Pay only when value is created.
        </p>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">Venue Registration</span>
              <span className="font-display text-2xl font-black text-primary">Free</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full access to leaderboards, XP system, session management, and admin tools. No subscription.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">Platform Fee</span>
              <span className="font-display text-2xl font-black text-primary">10%</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Applied only to support pools. No monthly subscription, no setup fees.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">Credit Packages</span>
              <span className="font-display text-2xl font-black text-primary">Rp 10k+</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buy credits to support players. Bonus credits on larger packages.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Want to discuss a venue partnership?{" "}
          <a href="https://wa.me/6281218153309" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold">
            Contact us on WhatsApp
          </a>
        </p>
      </section>
    </MarketingLayout>
  );
}
