import React, { useState } from "react";
import { Heart, MessageCircle, Share2, ShoppingBag, Plus, MoreHorizontal, Search, Home, PlaySquare, User, Maximize2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReelData {
  id: string;
  videoUrl?: string; // If we had actual video
  imageUrl: string;
  handle: string;
  description: string;
  productName: string;
  price: string;
  category: string;
  likes: string;
  comments: string;
}

const reels: ReelData[] = [
  {
    id: "r1",
    imageUrl: "/__mockup/images/reel-ladies-cord-set.png",
    handle: "@aanya.styles",
    description: "Obsessed with this fit for the weekend brunch. Perfect transitional piece. ✨ #BestaLooks #CordSet",
    productName: "BEIGE LINEN CORD SET",
    price: "₹3,499",
    category: "LADIES / CORD SETS",
    likes: "12.4K",
    comments: "342",
  },
  {
    id: "r2",
    imageUrl: "/__mockup/images/reel-mens-muscle-tee.png",
    handle: "@karan_fits",
    description: "Street ready. The new oversized fit is exactly what I've been looking for. 🖤",
    productName: "OVERSIZED MUSCLE TEE",
    price: "₹1,299",
    category: "MENS / TEES",
    likes: "8.9K",
    comments: "156",
  },
  {
    id: "r3",
    imageUrl: "/__mockup/images/reel-ladies-jewellery.png",
    handle: "@riya.gems",
    description: "Statement pieces only. Elevating the basic black tee. 💫 #Minimalist #Gold",
    productName: "GEOMETRIC DROP EARRINGS",
    price: "₹899",
    category: "ACCESSORIES / JEWELLERY",
    likes: "21.1K",
    comments: "503",
  },
  {
    id: "r4",
    imageUrl: "/__mockup/images/reel-mens-sneakers.png",
    handle: "@sneakerhead_in",
    description: "Chunky soles for the win. Comfort + aesthetic. 👟🔥",
    productName: "CHUNKY PLATFORM SNEAKERS",
    price: "₹4,599",
    category: "FOOTWEAR / SNEAKERS",
    likes: "15.2K",
    comments: "89",
  },
  {
    id: "r5",
    imageUrl: "/__mockup/images/reel-ladies-street.png",
    handle: "@thefashionedit",
    description: "City walks in the new trench. Unbeatable silhouette. 🏙️",
    productName: "STRUCTURED TRENCH COAT",
    price: "₹5,999",
    category: "LADIES / OUTERWEAR",
    likes: "34.5K",
    comments: "1.2K",
  }
];

export function ForYouReel() {
  const [activeTab, setActiveTab] = useState("for-you");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSaved(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black font-sans w-full">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-y-mandatory { scroll-snap-type: y mandatory; }
        .snap-start { scroll-snap-align: start; }
      `}} />
      
      {/* Mobile App Container */}
      <div className="relative w-full max-w-[480px] h-[900px] max-h-[100dvh] bg-zinc-950 overflow-hidden flex flex-col shadow-2xl border-x border-zinc-900">
        
        {/* Top Navigation */}
        <div className="absolute top-0 w-full z-20 px-4 pt-12 pb-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-none">
          <div className="text-xl font-bold tracking-tighter text-white">BESTA</div>
          
          <div className="flex gap-6 pointer-events-auto">
            <button 
              onClick={() => setActiveTab("following")}
              className={`text-sm font-medium transition-colors ${activeTab === "following" ? "text-white" : "text-white/60"}`}
            >
              Following
            </button>
            <button 
              onClick={() => setActiveTab("for-you")}
              className={`text-sm font-medium transition-colors relative ${activeTab === "for-you" ? "text-white" : "text-white/60"}`}
            >
              For You
              {activeTab === "for-you" && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-white rounded-full" />}
            </button>
          </div>
          
          <div className="w-8 flex justify-end pointer-events-auto">
            <Search className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Reels Feed */}
        <div className="flex-1 overflow-y-scroll hide-scrollbar snap-y-mandatory h-full bg-zinc-950">
          {reels.map((reel) => (
            <div key={reel.id} className="relative w-full h-full snap-start bg-zinc-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {/* Main Image */}
              <img 
                src={reel.imageUrl} 
                alt={reel.description}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              
              {/* Gradient Overlays for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

              {/* Right Action Bar */}
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border border-white/40 overflow-hidden relative mb-2">
                    <img src={reel.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white rounded-full p-0.5">
                      <Plus className="w-3 h-3 text-black" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => toggleLike(reel.id)} className="p-2 transition-transform active:scale-90">
                    <Heart className={`w-8 h-8 ${liked[reel.id] ? "fill-red-500 text-red-500" : "text-white"}`} />
                  </button>
                  <span className="text-white text-xs font-medium">{liked[reel.id] ? (parseFloat(reel.likes) + 0.1).toFixed(1) + "K" : reel.likes}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <button className="p-2 transition-transform active:scale-90">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </button>
                  <span className="text-white text-xs font-medium">{reel.comments}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => toggleSave(reel.id)} className="p-2 transition-transform active:scale-90">
                    <Bookmark className={`w-8 h-8 ${saved[reel.id] ? "fill-white text-white" : "text-white"}`} />
                  </button>
                  <span className="text-white text-xs font-medium">Save</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <button className="p-2 transition-transform active:scale-90">
                    <Share2 className="w-8 h-8 text-white" />
                  </button>
                  <span className="text-white text-xs font-medium">Share</span>
                </div>
              </div>

              {/* Bottom Info Area */}
              <div className="absolute left-4 bottom-20 pr-20 pb-4 z-10 w-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white font-bold text-base">{reel.handle}</span>
                  <button className="border border-white/30 rounded px-2 py-0.5 text-xs text-white font-medium">
                    Follow
                  </button>
                </div>
                
                <p className="text-white/90 text-sm mb-4 line-clamp-2 pr-4">
                  {reel.description}
                </p>

                {/* Product Card Overlay */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 w-full max-w-[320px] flex gap-3 items-center">
                  <div className="w-16 h-20 rounded-md overflow-hidden bg-black/20 flex-shrink-0">
                    <img src={reel.imageUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-1">{reel.category}</span>
                    <span className="text-white font-bold text-sm leading-tight mb-1 line-clamp-1">{reel.productName}</span>
                    <span className="text-white text-sm">{reel.price}</span>
                  </div>
                  <Button size="icon" className="rounded-full bg-white text-black hover:bg-zinc-200 w-10 h-10 flex-shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 w-full h-20 bg-black border-t border-zinc-900 px-6 flex justify-between items-center pb-safe">
          <button className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Shop</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors">
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-medium">Explore</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white">
            <PlaySquare className="w-6 h-6 fill-white" />
            <span className="text-[10px] font-medium">Reels</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[10px] font-medium">Bag</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              2
            </div>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
}
