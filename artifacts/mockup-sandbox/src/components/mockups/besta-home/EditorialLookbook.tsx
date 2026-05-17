import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export function EditorialLookbook() {
  useEffect(() => {
    // Add Google Fonts for this component
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=Space+Grotesk:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div 
      className="bg-white text-black w-full min-h-screen antialiased overflow-x-hidden"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .font-serif { font-family: 'Playfair Display', serif; }
        .tracking-widest-plus { letter-spacing: 0.2em; }
        .editorial-border { border: 1px solid #111; }
      `}} />

      {/* Navigation - Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center mix-blend-difference text-white">
        <div className="text-xs uppercase tracking-widest-plus font-medium">Vol. 4</div>
        <h1 className="text-3xl font-bold tracking-tighter uppercase">Besta</h1>
        <div className="text-xs uppercase tracking-widest-plus font-medium">Index</div>
      </nav>

      {/* Cover Section */}
      <section className="relative w-full h-[100svh] flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-end p-8 md:p-16 z-10 bg-white">
          <p className="text-sm uppercase tracking-widest-plus mb-6">The Current Issue</p>
          <h2 className="font-serif text-6xl md:text-8xl leading-[0.9] mb-8">
            New<br/>
            Modern<br/>
            Standard.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-gray-600 mb-12">
            Exploring the intersection of brutalist architecture and soft tailoring. 
            A study in contrasts, designed for the Pan-Indian summer.
          </p>
          <div>
            <Button variant="outline" className="rounded-none border-black hover:bg-black hover:text-white uppercase tracking-widest text-xs h-12 px-8">
              Read the Issue
            </Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-gray-100">
          <img 
            src="/__mockup/images/besta-cover.png" 
            alt="Editorial Cover" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block mix-blend-difference text-white">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Editor's Letter */}
      <section className="py-24 md:py-40 px-6 md:px-16 max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="w-full md:w-1/3">
          <div className="aspect-square w-full md:w-64 max-w-sm mx-auto bg-gray-200 p-2">
             <img 
              src="/__mockup/images/besta-editor.png" 
              alt="Editor" 
              className="w-full h-full object-cover filter grayscale"
            />
          </div>
        </div>
        <div className="w-full md:w-2/3 md:pl-16 border-t md:border-t-0 md:border-l border-black pt-12 md:pt-0">
          <h3 className="text-xs uppercase tracking-widest-plus mb-8">Editor's Note</h3>
          <p className="font-serif text-2xl md:text-4xl leading-relaxed mb-8">
            "Fashion is not just what we wear, it is the dialogue we have with our environment. This season, we strip away the excess to focus on pure form."
          </p>
          <div className="uppercase text-xs tracking-widest font-semibold">
            — The Editorial Team
          </div>
        </div>
      </section>

      {/* Spread 1: Cord Sets */}
      <section className="w-full bg-[#f8f8f8] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row items-end gap-12">
            <div className="w-full md:w-7/12 order-2 md:order-1">
              <img 
                src="/__mockup/images/besta-cord-set.png" 
                alt="Cord Set Collection" 
                className="w-full h-[70vh] object-cover editorial-border p-2 bg-white"
              />
            </div>
            <div className="w-full md:w-5/12 order-1 md:order-2 pb-12">
              <h3 className="font-serif text-5xl md:text-7xl mb-6">The<br/>Cord Set<br/>Diaries</h3>
              <p className="text-sm leading-relaxed text-gray-600 mb-10 max-w-sm">
                Uncomplicated dressing for complex days. Our new linen-blend sets are designed to move with you from the cafe to the gallery.
              </p>
              
              {/* Inline Product Listing */}
              <div className="border-t border-black pt-6 space-y-4">
                <div className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="text-xs opacity-50 w-4">01</span>
                    <span className="text-sm uppercase tracking-wide group-hover:pl-2 transition-all">Olive Linen Set</span>
                  </div>
                  <span className="text-sm">₹2,499</span>
                </div>
                <div className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="text-xs opacity-50 w-4">02</span>
                    <span className="text-sm uppercase tracking-wide group-hover:pl-2 transition-all">Ecru Utility Suit</span>
                  </div>
                  <span className="text-sm">₹2,899</span>
                </div>
                <Button variant="link" className="px-0 uppercase tracking-widest text-xs text-black mt-4 h-auto">
                  View full story <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spread 2: Muscle Tees & Sneakers (Split) */}
      <section className="w-full py-24 md:py-32 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
          {/* Muscle Tee */}
          <div className="flex flex-col">
            <div className="text-xs uppercase tracking-widest-plus mb-6 pb-4 border-b border-black">Menswear</div>
            <h3 className="font-serif text-4xl mb-8">Muscle Tee Mondays</h3>
            <img 
              src="/__mockup/images/besta-muscle-tee.png" 
              alt="Muscle Tee" 
              className="w-full aspect-[3/4] object-cover mb-8"
            />
            <p className="text-sm leading-relaxed text-gray-600 mb-6">
              Reinventing the silhouette. Exaggerated shoulders and dropped armholes create a structural look that commands attention.
            </p>
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
              <span className="text-sm uppercase font-medium">Oversized Raw Edge Tee</span>
              <span className="text-sm">₹1,299</span>
            </div>
          </div>

          {/* Sneakers */}
          <div className="flex flex-col md:pt-40">
            <div className="text-xs uppercase tracking-widest-plus mb-6 pb-4 border-b border-black">Footwear</div>
            <h3 className="font-serif text-4xl mb-8">Ground Control</h3>
            <img 
              src="/__mockup/images/besta-sneakers.png" 
              alt="Sneakers" 
              className="w-full aspect-square object-cover mb-8"
            />
            <p className="text-sm leading-relaxed text-gray-600 mb-6">
              Chunky soles meet minimalist uppers. The foundation of any modern wardrobe starts from the ground up.
            </p>
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
              <span className="text-sm uppercase font-medium">Platform Court Sneaker</span>
              <span className="text-sm">₹3,499</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlight: Jewellery */}
      <section className="w-full h-[80vh] relative flex items-center justify-center bg-black text-white">
        <div className="absolute inset-0 z-0 opacity-60">
          <img 
            src="/__mockup/images/besta-jewellery.png" 
            alt="Jewellery Details" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="z-10 text-center px-6">
          <div className="text-xs uppercase tracking-widest-plus mb-6">Finery</div>
          <h3 className="font-serif text-5xl md:text-7xl mb-8">The Light Catchers</h3>
          <Button variant="outline" className="rounded-none border-white text-white hover:bg-white hover:text-black uppercase tracking-widest text-xs h-12 px-8 bg-transparent">
            Explore Accessories
          </Button>
        </div>
      </section>

      {/* Index Footer */}
      <footer className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-8 border-t border-black pt-16">
          <div className="w-full md:w-1/3">
            <h2 className="text-4xl font-bold tracking-tighter uppercase mb-6">Besta</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest leading-loose">
              Pan-India Fast Fashion<br/>
              Mumbai • Delhi • Bangalore
            </p>
          </div>
          
          <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xs uppercase tracking-widest-plus mb-6 font-bold">Categories</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Mens</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Ladies</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Kids</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Accessories</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Footwear</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest-plus mb-6 font-bold">Stories</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Cord Set Diaries</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Muscle Tee Mondays</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Ground Control</a></li>
                <li><a href="#" className="hover:text-black transition-colors">The Light Catchers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest-plus mb-6 font-bold">Client Care</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest-plus mb-6 font-bold">Social</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Pinterest</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
