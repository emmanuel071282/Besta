import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { useActiveCampaign } from "@/hooks/use-campaign";

export function SummerHeroBanner() {
  const { data: campaign } = useActiveCampaign();
  if (!campaign) return null;

  return (
    <section
      data-testid="section-summer-banner"
      className="container mx-auto px-4 md:px-6 pt-16 md:pt-20"
    >
      <Link
        href={campaign.ctaLink}
        data-testid="link-summer-banner"
        className="group relative block w-full aspect-[16/9] md:aspect-[21/8] overflow-hidden bg-foreground text-background"
      >
        <img
          src={campaign.heroImageUrl || "/marketing/summer/banner-1x1-01.svg"}
          alt={campaign.title}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-2xl">
          <span className="text-white/85 text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> {campaign.eyebrow || "Summer ’26"}
          </span>
          <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tighter leading-[0.95] mb-3 md:mb-5 uppercase">
            {campaign.title}
          </h2>
          <p className="text-white/90 text-sm md:text-base font-medium mb-5 md:mb-7 max-w-md">
            {campaign.subtitle}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-white text-black px-6 md:px-8 py-3 md:py-3.5 text-xs uppercase tracking-widest font-semibold w-fit group-hover:gap-4 transition-all">
              {campaign.ctaLabel} <ArrowRight className="w-4 h-4" />
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/80 font-semibold">
              New In · Free Shipping Pan India
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
