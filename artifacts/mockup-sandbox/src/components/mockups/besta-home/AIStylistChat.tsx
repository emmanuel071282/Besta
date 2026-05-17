import React, { useState, useEffect, useRef } from "react";
import { Send, Camera, Sparkles, Mic, MapPin, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_CHAT_HISTORY = [
  {
    id: 1,
    role: "assistant",
    content: "Hi. I'm your BESTA Stylist. Tell me what you're looking for, or choose a prompt below to get started.",
    timestamp: "10:00 AM",
    type: "text"
  },
  {
    id: 2,
    role: "user",
    content: "Style me for a Diwali party",
    timestamp: "10:01 AM",
    type: "text"
  },
  {
    id: 3,
    role: "assistant",
    content: "Perfect. For a modern Diwali look, I'd suggest starting with a bold, embroidered cord set. We can accessorize it to elevate the festive vibe. Here is a curated look for you:",
    timestamp: "10:01 AM",
    type: "text"
  },
  {
    id: 4,
    role: "assistant",
    content: "",
    timestamp: "10:01 AM",
    type: "outfit",
    outfit: {
      title: "THE DIWALI EDIT",
      mainImage: "/__mockup/images/stylist-look-diwali.png",
      totalPrice: "₹4,298",
      items: [
        {
          id: "item1",
          name: "Red Embroidered Cord Set",
          category: "LADIES / CORD SETS",
          price: "₹2,499",
          image: "/__mockup/images/stylist-cord-red.png"
        },
        {
          id: "item2",
          name: "Gold Teardrop Earrings",
          category: "ACCESSORIES / JEWELLERY",
          price: "₹899",
          image: "/__mockup/images/stylist-jewel-teardrop.png"
        }
      ]
    }
  },
  {
    id: 5,
    role: "user",
    content: "I love the cord set! What about options for guys? My brother needs something for college.",
    timestamp: "10:03 AM",
    type: "text"
  },
  {
    id: 6,
    role: "assistant",
    content: "For a relaxed yet sharp college look, layering is key. A muscle tee under a light overshirt pairs perfectly with minimal white sneakers. Here are some top picks:",
    timestamp: "10:03 AM",
    type: "text"
  },
  {
    id: 7,
    role: "assistant",
    content: "",
    timestamp: "10:04 AM",
    type: "carousel",
    carousel: [
      {
        id: "c1",
        name: "Sage Green Muscle Tee",
        category: "MENS / TEES",
        price: "₹799",
        image: "/__mockup/images/stylist-muscle-sage.png"
      },
      {
        id: "c2",
        name: "Minimalist White Sneakers",
        category: "FOOTWEAR / SNEAKERS",
        price: "₹1,999",
        image: "/__mockup/images/stylist-sneaker-white.png"
      },
      {
        id: "c3",
        name: "Layered Campus Look",
        category: "MENS / OUTFITS",
        price: "₹3,499",
        image: "/__mockup/images/stylist-look-college.png"
      }
    ]
  }
];

export function AIStylistChat() {
  const [messages, setMessages] = useState(MOCK_CHAT_HISTORY);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    }]);
    setInputValue("");
    
    // Simulate typing indicator then response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "I'm looking into that for you. Give me just a second to pull up the best options from our latest collections...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text"
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white font-sans text-black relative selection:bg-black selection:text-white">
      {/* Custom fonts */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .font-brand { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.04em; }
        .font-mono-micro { font-family: 'Space Mono', monospace; }
        /* Hide scrollbar for clean look */
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}} />

      {/* Header */}
      <header className="flex-none flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-none">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-brand font-bold text-2xl tracking-tighter uppercase">BESTA</h1>
            <p className="font-mono-micro text-[10px] tracking-widest text-black/50 uppercase">AI Stylist Active</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-none hover:bg-black/5">
            <ShoppingBag className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="rounded-none border-black hover:bg-black hover:text-white transition-colors font-mono-micro text-xs tracking-widest uppercase h-10 px-6">
            Sign In
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-32">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500`} style={{ animationFillMode: 'both', animationDelay: `${index * 100}ms` }}>
              
              {/* Message Meta */}
              <div className="flex items-center gap-2 px-1">
                {msg.role === 'assistant' && (
                  <span className="font-mono-micro text-[10px] tracking-widest text-black/40 uppercase">BESTA STYLIST</span>
                )}
                <span className="font-mono-micro text-[10px] text-black/30">{msg.timestamp}</span>
                {msg.role === 'user' && (
                  <span className="font-mono-micro text-[10px] tracking-widest text-black/40 uppercase">YOU</span>
                )}
              </div>

              {/* Text Message */}
              {msg.type === 'text' && (
                <div className={`max-w-[85%] md:max-w-[75%] p-5 ${
                  msg.role === 'user' 
                    ? 'bg-black text-white rounded-l-2xl rounded-tr-2xl' 
                    : 'bg-black/5 text-black rounded-r-2xl rounded-tl-2xl'
                }`}>
                  <p className={`text-base md:text-lg leading-relaxed ${msg.role === 'assistant' ? 'font-light' : ''}`}>
                    {msg.content}
                  </p>
                </div>
              )}

              {/* Outfit Recommendation Card */}
              {msg.type === 'outfit' && msg.outfit && (
                <div className="w-full max-w-[85%] md:max-w-[75%] mt-2 bg-black/5 p-6 rounded-r-2xl rounded-tl-2xl">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="font-mono-micro text-xs tracking-widest text-black/50 uppercase mb-1">Curated Look</h3>
                      <h2 className="font-brand font-bold text-2xl uppercase">{msg.outfit.title}</h2>
                    </div>
                    <p className="font-mono-micro text-sm font-bold">{msg.outfit.totalPrice}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="aspect-[3/4] relative group overflow-hidden bg-black/10">
                      <img src={msg.outfit.mainImage} alt="Main look" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button className="rounded-none bg-white text-black hover:bg-black hover:text-white">Shop The Look</Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {msg.outfit.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4 bg-white p-3 group cursor-pointer border border-transparent hover:border-black transition-colors">
                          <div className="w-20 h-24 bg-black/5 flex-none overflow-hidden relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex flex-col justify-center flex-1">
                            <p className="font-mono-micro text-[9px] tracking-widest text-black/50 uppercase mb-1">{item.category}</p>
                            <h4 className="text-sm font-medium leading-tight mb-2 group-hover:underline">{item.name}</h4>
                            <p className="font-mono-micro text-xs">{item.price}</p>
                          </div>
                          <div className="flex items-center">
                            <Button size="icon" variant="ghost" className="w-8 h-8 rounded-none opacity-0 group-hover:opacity-100 transition-opacity">
                              <ShoppingBag className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button className="w-full mt-auto rounded-none h-12 bg-black text-white hover:bg-black/90 font-mono-micro tracking-widest uppercase text-xs">
                        Add All To Cart
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Carousel */}
              {msg.type === 'carousel' && msg.carousel && (
                <div className="w-full max-w-[95%] md:max-w-[85%] mt-2 bg-black/5 p-6 rounded-r-2xl rounded-tl-2xl overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-mono-micro text-xs tracking-widest text-black/50 uppercase">Top Recommendations</h3>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="w-8 h-8 rounded-none border-black/20 text-black/50"><ArrowRight className="w-4 h-4 rotate-180" /></Button>
                      <Button size="icon" variant="outline" className="w-8 h-8 rounded-none border-black hover:bg-black hover:text-white"><ArrowRight className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {msg.carousel.map((item: any) => (
                      <div key={item.id} className="min-w-[200px] md:min-w-[240px] flex flex-col group cursor-pointer snap-start">
                        <div className="aspect-[3/4] bg-black/5 mb-3 overflow-hidden relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" className="w-8 h-8 rounded-none bg-white text-black hover:bg-black hover:text-white shadow-sm">
                              <ShoppingBag className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="font-mono-micro text-[9px] tracking-widest text-black/50 uppercase mb-1">{item.category}</p>
                        <h4 className="text-sm font-medium leading-tight mb-1 group-hover:underline">{item.name}</h4>
                        <p className="font-mono-micro text-xs">{item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Prompt Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["Style me for a Diwali party", "Cord sets under ₹1,500", "Sneakers for college", "Casual office wear"].map((prompt) => (
              <Badge 
                key={prompt}
                variant="outline" 
                className="rounded-full px-4 py-2 text-xs font-normal border-black/20 hover:border-black hover:bg-black/5 cursor-pointer bg-white transition-colors"
                onClick={() => {
                  setInputValue(prompt);
                }}
              >
                {prompt}
              </Badge>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="relative flex items-center bg-white border border-black shadow-sm group focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 transition-shadow">
            <Button type="button" variant="ghost" size="icon" className="ml-2 rounded-none hover:bg-black/5 text-black/50 hover:text-black">
              <Camera className="w-5 h-5" />
            </Button>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for an outfit, style, or occasion..." 
              className="flex-1 border-0 focus-visible:ring-0 shadow-none rounded-none text-base h-14 px-4 bg-transparent"
            />
            <Button type="button" variant="ghost" size="icon" className="rounded-none hover:bg-black/5 text-black/50 hover:text-black">
              <Mic className="w-5 h-5" />
            </Button>
            <Button type="submit" disabled={!inputValue.trim()} className="h-14 w-14 rounded-none bg-black text-white hover:bg-black/90 disabled:bg-black/20 disabled:text-white/50 transition-colors">
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <div className="text-center mt-3">
            <p className="font-mono-micro text-[9px] tracking-widest text-black/40 uppercase">AI Stylist may make mistakes. Free shipping on all orders above ₹999.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
