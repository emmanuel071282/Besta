import { useEffect, useState } from "react";
import { Link } from "wouter";
import { X, Sparkles } from "lucide-react";
import { useActiveCampaign } from "@/hooks/use-campaign";

export function SummerHeaderStrip() {
  const { data: campaign } = useActiveCampaign();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!campaign) return;
    const key = `besta-summer-strip-dismissed-${campaign.id}`;
    setDismissed(localStorage.getItem(key) === "1");
  }, [campaign?.id]);

  if (!campaign || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(`besta-summer-strip-dismissed-${campaign.id}`, "1");
  };

  return (
    <div
      data-testid="summer-header-strip"
      className="fixed top-0 inset-x-0 z-[60] bg-foreground text-background"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container mx-auto px-4 md:px-6 py-2 flex items-center justify-between gap-3">
        <Link
          href={campaign.ctaLink}
          data-testid="link-summer-strip"
          className="flex items-center gap-2 flex-1 min-w-0 text-[10px] sm:text-xs uppercase tracking-widest font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {campaign.eyebrow || "Summer ’26"} · {campaign.title} — <span className="underline">{campaign.ctaLabel || "Explore the range"}</span>
          </span>
        </Link>
        <button
          onClick={dismiss}
          data-testid="button-dismiss-summer-strip"
          className="p-1 shrink-0 hover:opacity-80"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
