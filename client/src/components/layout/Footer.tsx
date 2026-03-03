import { Link } from "wouter";
import logoBesta from "@assets/photo_2025-11-29_23.46.39_copy_1772478243583.jpeg";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16 md:py-24 mt-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold tracking-tighter">BESTA</h3>
            <p className="text-sm text-primary-foreground/60 max-w-xs">
              Defining modern minimalism. Fast fashion that doesn't compromise on aesthetic or quality.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-primary-foreground/80">Shop</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li><Link href="/category/Mens" className="hover:text-white transition-colors">Mens</Link></li>
              <li><Link href="/category/Ladies" className="hover:text-white transition-colors">Ladies</Link></li>
              <li><Link href="/category/Kids" className="hover:text-white transition-colors">Kids</Link></li>
              <li><Link href="/category/Accessories" className="hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-primary-foreground/80">Help</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li><Link href="/exchange-policy" className="hover:text-white transition-colors">Returns & Exchange</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-primary-foreground/80">Newsletter</h4>
            <p className="text-sm text-primary-foreground/60">Subscribe for early access to new arrivals and exclusive offers.</p>
            <form className="flex mt-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent border-b border-primary-foreground/30 px-0 py-2 text-sm w-full focus:outline-none focus:border-primary-foreground transition-colors placeholder:text-primary-foreground/40"
              />
              <button className="text-xs uppercase tracking-widest font-semibold ml-4 hover:text-primary-foreground/70 transition-colors">
                Join
              </button>
            </form>
          </div>

        </div>
        
        <div className="mt-16 md:mt-24 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/40">
          <p>&copy; {new Date().getFullYear()} Besta Fashion. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
