import React, { useState, useEffect } from 'react';
import { Play, Eye, Bell, Heart, Zap, Clock, TrendingUp, ChevronRight, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function LiveDropFeed() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 45 });
  const [viewers, setViewers] = useState(1240);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
      setViewers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ccff00] selection:text-black pb-24">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .font-display { font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 20s linear infinite;
        }
        
        .neon-border {
          box-shadow: 0 0 10px rgba(204, 255, 0, 0.5), inset 0 0 10px rgba(204, 255, 0, 0.2);
          border: 1px solid #ccff00;
        }
        
        .neon-text {
          text-shadow: 0 0 10px rgba(204, 255, 0, 0.8);
        }
        
        .glitch-hover:hover {
          animation: glitch 0.2s linear infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 1px) }
          40% { transform: translate(-1px, -1px) }
          60% { transform: translate(2px, 1px) }
          80% { transform: translate(1px, -1px) }
          100% { transform: translate(0) }
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />

      {/* Ticker Navbar */}
      <div className="fixed top-0 w-full z-50 bg-[#ccff00] text-black font-mono text-xs uppercase font-bold tracking-widest overflow-hidden h-8 flex items-center">
        <div className="whitespace-nowrap animate-ticker flex items-center">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-4 flex items-center">
              <Zap size={12} className="mr-2" />
              Aanya in Mumbai just bought Drop 06 Cord Set
              <span className="mx-4">///</span>
              Rohan in Delhi grabbed the Chunky Sneakers
              <span className="mx-4">///</span>
              Priya in Bengaluru secured the Silver Chain
              <span className="mx-4">///</span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-8 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">Live</span>
        </div>
        <h1 className="font-display text-4xl tracking-tighter">BESTA</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-none font-mono text-xs">
            <Eye size={12} className="text-[#ccff00]" />
            <span>{viewers.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Hero Event */}
      <section className="pt-24 pb-8 px-4 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src="/__mockup/images/besta-runway-drop.png" alt="Runway" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center mt-12 mb-8">
          <Badge className="bg-[#ccff00] text-black hover:bg-[#ccff00] rounded-none font-mono text-xs uppercase tracking-widest mb-6 border-none">
            Next Drop
          </Badge>
          <h2 className="font-display text-6xl md:text-8xl uppercase leading-none mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
            Drop 07
          </h2>
          <p className="font-mono text-white/60 mb-8 uppercase tracking-widest text-sm">Friday 8:00 PM IST</p>
          
          <div className="flex gap-4 font-display text-4xl md:text-5xl mb-8">
            <div className="flex flex-col items-center">
              <span className="w-16 md:w-20 bg-white/5 border border-white/10 py-2">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-[10px] font-mono text-white/40 mt-2 uppercase">Hrs</span>
            </div>
            <span className="text-[#ccff00] neon-text">:</span>
            <div className="flex flex-col items-center">
              <span className="w-16 md:w-20 bg-white/5 border border-white/10 py-2">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-[10px] font-mono text-white/40 mt-2 uppercase">Min</span>
            </div>
            <span className="text-[#ccff00] neon-text">:</span>
            <div className="flex flex-col items-center">
              <span className="w-16 md:w-20 bg-white/5 border border-white/10 py-2">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="text-[10px] font-mono text-white/40 mt-2 uppercase">Sec</span>
            </div>
          </div>
          
          <Button className="w-full max-w-sm rounded-none bg-[#ccff00] hover:bg-white text-black font-mono font-bold uppercase tracking-widest text-lg h-14 glitch-hover">
            <Bell className="mr-2" size={18} /> Notify Me
          </Button>
        </div>
      </section>

      {/* City Hot Strip */}
      <div className="border-b border-white/10 bg-white/5 py-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center px-4 gap-4 min-w-max">
          <div className="flex items-center text-xs font-mono uppercase text-white/50 tracking-widest mr-2">
            <TrendingUp size={14} className="mr-2 text-[#ccff00]" />
            Trending City
          </div>
          {['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad'].map((city, i) => (
            <button key={city} className={`px-4 py-1.5 text-xs font-mono uppercase tracking-widest border rounded-none whitespace-nowrap transition-colors ${i === 0 ? 'border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10' : 'border-white/20 text-white/70 hover:border-white/50'}`}>
              {city} {i === 0 && <span className="ml-2 text-xs">🔥</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feed */}
      <div className="px-4 py-8 max-w-3xl mx-auto">
        <Tabs defaultValue="now" className="w-full mb-8">
          <TabsList className="w-full grid grid-cols-3 bg-white/5 rounded-none p-1 border border-white/10 h-auto">
            <TabsTrigger value="past" className="rounded-none font-mono text-xs uppercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white py-3">Past Drops</TabsTrigger>
            <TabsTrigger value="now" className="rounded-none font-mono text-xs uppercase tracking-widest data-[state=active]:bg-[#ccff00] data-[state=active]:text-black py-3">Live Now</TabsTrigger>
            <TabsTrigger value="next" className="rounded-none font-mono text-xs uppercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-white py-3">Next Up</TabsTrigger>
          </TabsList>

          <TabsContent value="now" className="space-y-6 mt-6">
            
            {/* Drop Card 1 */}
            <div className="border border-white/20 bg-zinc-900/50 p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 z-20 flex gap-2">
                <Badge className="bg-red-500 text-white rounded-none border-none font-mono text-[10px] uppercase font-bold px-2 py-1 animate-pulse">
                  Only 12 Left
                </Badge>
              </div>
              
              <div className="aspect-[3/4] sm:aspect-[16/9] relative mb-4 overflow-hidden border border-white/10 bg-black">
                <img src="/__mockup/images/besta-cordset-neon.png" alt="Cyber Cord Set" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Video Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Play className="text-white ml-1" fill="currentColor" size={24} />
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="font-display text-2xl uppercase">Neon Edge Cord Set</h3>
                      <p className="font-mono text-xs text-white/60 uppercase">Ladies • Edition of 500</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-bold text-[#ccff00]">₹3,499</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between font-mono text-[10px] uppercase text-white/60">
                  <span>Claimed: 97%</span>
                  <span className="text-red-400">12 Remaining</span>
                </div>
                <Progress value={97} className="h-1.5 rounded-none bg-white/10 [&>div]:bg-red-500" />
                
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 rounded-none bg-white text-black hover:bg-[#ccff00] font-mono uppercase tracking-widest font-bold">
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-none border-white/20 hover:bg-white/10 text-white shrink-0">
                    <Heart size={18} />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-none border-white/20 hover:bg-white/10 text-white shrink-0">
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Drop Card 2 */}
            <div className="border border-[#ccff00]/30 neon-border bg-black p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 z-20">
                <Badge className="bg-[#ccff00] text-black rounded-none border-none font-mono text-[10px] uppercase font-bold px-2 py-1">
                  Selling Fast
                </Badge>
              </div>
              
              <div className="aspect-[3/4] sm:aspect-[16/9] relative mb-4 overflow-hidden border border-white/10 bg-black">
                <img src="/__mockup/images/besta-muscle-tee-neon.png" alt="Muscle Tee" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="font-display text-2xl uppercase">Void Muscle Tee</h3>
                      <p className="font-mono text-xs text-white/60 uppercase">Mens • Core Collection</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-bold text-[#ccff00]">₹1,299</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between font-mono text-[10px] uppercase text-white/60">
                  <span>Claimed: 45%</span>
                  <span>High Demand</span>
                </div>
                <Progress value={45} className="h-1.5 rounded-none bg-white/10 [&>div]:bg-[#ccff00]" />
                
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 rounded-none bg-white text-black hover:bg-[#ccff00] font-mono uppercase tracking-widest font-bold">
                    Select Size
                  </Button>
                </div>
              </div>
            </div>
            
            {/* 2-Column Grid for smaller items */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-white/20 bg-zinc-900/50 p-3 flex flex-col">
                <div className="aspect-square relative mb-3 bg-black border border-white/5">
                  <img src="/__mockup/images/besta-sneakers-neon.png" alt="Sneakers" className="w-full h-full object-cover" />
                  <Badge className="absolute top-2 right-2 bg-black/80 backdrop-blur text-white rounded-none border border-white/20 font-mono text-[9px] uppercase px-1.5 py-0.5">
                    Low Stock
                  </Badge>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-lg uppercase leading-tight mb-1">Volt Chunky Kicks</h4>
                    <p className="font-mono text-[10px] text-white/50 uppercase mb-2">Footwear</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm mb-3">₹4,999</p>
                    <Button size="sm" className="w-full rounded-none bg-white/10 text-white hover:bg-white hover:text-black font-mono text-[10px] uppercase">Quick Add</Button>
                  </div>
                </div>
              </div>
              
              <div className="border border-white/20 bg-zinc-900/50 p-3 flex flex-col">
                <div className="aspect-square relative mb-3 bg-black border border-white/5">
                  <img src="/__mockup/images/besta-jewellery-neon.png" alt="Jewellery" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-lg uppercase leading-tight mb-1">Heavy Link Chain</h4>
                    <p className="font-mono text-[10px] text-white/50 uppercase mb-2">Accessories</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm mb-3">₹1,899</p>
                    <Button size="sm" className="w-full rounded-none bg-white/10 text-white hover:bg-white hover:text-black font-mono text-[10px] uppercase">Quick Add</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Post */}
            <div className="border border-white/20 bg-black relative overflow-hidden group mt-6">
              <div className="aspect-[9/16] relative">
                <img src="/__mockup/images/besta-kids-streetwear.png" alt="Kids Streetwear Video" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Always-on Play Overlay for Video Vibe */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                    <Play className="text-white ml-2" fill="currentColor" size={32} />
                  </div>
                </div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-red-600/90 backdrop-blur-sm text-white rounded-none border-none font-mono text-[10px] uppercase px-2 py-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                    Live Try-On
                  </Badge>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-24">
                  <h3 className="font-display text-3xl uppercase mb-2">Kids Cypher Collection</h3>
                  <p className="font-mono text-xs text-white/70 uppercase mb-4 max-w-[80%] leading-relaxed">Watch the street crew style the new oversized drop. Shop the looks straight from the video.</p>
                  <Button className="w-full rounded-none bg-transparent border border-white text-white hover:bg-white hover:text-black font-mono uppercase tracking-widest">
                    Shop The Look
                  </Button>
                </div>
              </div>
            </div>

          </TabsContent>
          
          <TabsContent value="past" className="pt-8 text-center text-white/40 font-mono text-sm uppercase">
            Loading archive...
          </TabsContent>
          
          <TabsContent value="next" className="pt-8 text-center text-white/40 font-mono text-sm uppercase">
            Revealing soon...
          </TabsContent>
        </Tabs>
        
        {/* Footer info */}
        <div className="mt-16 text-center border-t border-white/10 pt-8">
          <p className="font-display text-2xl mb-4 text-white/20">BESTA</p>
          <div className="flex justify-center gap-6 font-mono text-[10px] uppercase text-white/40 tracking-widest mb-12">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
