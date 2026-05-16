import { useEffect, useState } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";
import { useActiveCampaign } from "@/hooks/use-campaign";
import { useAuth } from "@/hooks/use-auth";

export function SummerPopup() {
  const { data: campaign } = useActiveCampaign();
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!campaign || !isLoggedIn) return;
    const key = `besta-summer-popup-seen-${campaign.id}`;
    if (localStorage.getItem(key) === "1") return;
    const t = setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(t);
  }, [campaign?.id, isLoggedIn]);

  const close = () => {
    setOpen(false);
    if (campaign) localStorage.setItem(`besta-summer-popup-seen-${campaign.id}`, "1");
  };

  if (!campaign || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4"
      onClick={close}
      data-testid="summer-popup-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-background w-full max-w-md relative shadow-2xl"
        data-testid="summer-popup"
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 p-1.5 bg-background/80 hover:bg-background"
          data-testid="button-close-summer-popup"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="aspect-[4/3] bg-secondary overflow-hidden">
          <img
            src={campaign.heroImageUrl || "/marketing/summer/banner-1x1-01.svg"}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 md:p-8 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
            {campaign.eyebrow || "Welcome Back"}
          </span>
          <h2 className="font-display font-bold tracking-tighter uppercase text-2xl md:text-3xl mt-2">
            {campaign.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-3">{campaign.subtitle}</p>
          <div className="border border-dashed border-foreground/40 mt-5 py-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Now in store</p>
            <p className="font-display text-xl font-bold tracking-tighter mt-1" data-testid="text-summer-popup-headline">
              The Summer ’26 Range
            </p>
            <p className="text-xs text-muted-foreground mt-1">Free shipping across India · easy 15-day returns</p>
          </div>
          <Link
            href={campaign.ctaLink}
            onClick={close}
            data-testid="link-summer-popup-cta"
            className="mt-5 inline-block w-full bg-foreground text-background py-3.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90"
          >
            {campaign.ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
