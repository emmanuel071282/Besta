import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  ChevronRight, 
  ShieldCheck, 
  Lock,
  CheckCircle2,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { SiVisa, SiMastercard, SiGooglepay, SiPaytm } from "react-icons/si";
import { FaAmazonPay } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

type PaymentMethod = "card" | "netbanking" | "upi";
type UpiApp = "paytm" | "gpay" | "amazonpay" | "upi_id";

const BANKS = [
  { id: "sbi", name: "State Bank of India" },
  { id: "hdfc", name: "HDFC Bank" },
  { id: "icici", name: "ICICI Bank" },
  { id: "axis", name: "Axis Bank" },
  { id: "kotak", name: "Kotak Mahindra Bank" },
  { id: "pnb", name: "Punjab National Bank" },
  { id: "bob", name: "Bank of Baroda" },
  { id: "canara", name: "Canara Bank" },
  { id: "union", name: "Union Bank of India" },
  { id: "idbi", name: "IDBI Bank" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [selectedBank, setSelectedBank] = useState("");
  const [upiApp, setUpiApp] = useState<UpiApp>("gpay");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");

  const [shipping, setShipping] = useState({
    name: user?.name || "",
    phone: user?.mobile || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const paymentLabel = paymentMethod === "card" ? "card" : paymentMethod === "netbanking" ? `netbanking-${selectedBank}` : upiApp === "upi_id" ? `upi-${upiId}` : `upi-${upiApp}`;
      const res = await apiRequest("POST", "/api/orders", {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          size: item.selectedSize || undefined,
        })),
        shippingName: shipping.name,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPincode: shipping.pincode,
        shippingPhone: shipping.phone,
        paymentMethod: paymentLabel,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setPlacedOrderNumber(data.orderNumber);
      clearCart();
      setOrderPlaced(true);
    },
    onError: () => {
      toast({ title: "Failed to place order", description: "Please try again.", variant: "destructive" });
    },
  });

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center py-20">
          <p className="text-xl font-medium mb-4">Your bag is empty</p>
          <p className="text-muted-foreground mb-8">Add some items before checking out.</p>
          <Link href="/" data-testid="link-continue-shopping" className="inline-block border border-foreground px-8 py-3.5 text-xs uppercase tracking-widest font-semibold">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-lg text-center py-20">
          <CheckCircle2 className="w-20 h-20 mx-auto text-green-600 mb-6" />
          <h1 className="text-3xl font-display font-bold tracking-tighter mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for shopping with BESTA. Your order has been placed successfully.
          </p>
          {placedOrderNumber && (
            <p className="text-sm font-mono text-muted-foreground mb-2" data-testid="text-order-number">
              Order: {placedOrderNumber}
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-8">
            You will receive an order confirmation on your registered email/phone shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" data-testid="link-view-orders" className="inline-block border border-foreground px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-foreground hover:text-background transition-colors">
              View My Orders
            </Link>
            <Link href="/" data-testid="link-back-home" className="inline-block bg-foreground text-background px-8 py-3.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-lg text-center py-20">
          <h1 className="text-2xl font-display font-bold tracking-tighter mb-4">Sign in to continue</h1>
          <p className="text-muted-foreground mb-8">You need to be signed in to place an order.</p>
          <Link href="/login" className="inline-block bg-foreground text-background px-8 py-3.5 text-xs uppercase tracking-widest font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const validateShipping = () => {
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.city || !shipping.state || !shipping.pincode) {
      toast({ title: "Please fill in all shipping details", variant: "destructive" });
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(shipping.phone)) {
      toast({ title: "Please enter a valid 10-digit mobile number", variant: "destructive" });
      return false;
    }
    if (!/^\d{6}$/.test(shipping.pincode)) {
      toast({ title: "Please enter a valid 6-digit pincode", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      toast({ title: "Please fill in all card details", variant: "destructive" });
      return;
    }
    if (paymentMethod === "netbanking" && !selectedBank) {
      toast({ title: "Please select a bank", variant: "destructive" });
      return;
    }
    if (paymentMethod === "upi" && upiApp === "upi_id" && !upiId) {
      toast({ title: "Please enter your UPI ID", variant: "destructive" });
      return;
    }

    placeOrderMutation.mutate();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to shopping
        </Link>

        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter mb-6 uppercase">Checkout</h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setStep("shipping")}
            className={cn(
              "flex items-center gap-2 text-xs uppercase tracking-widest font-semibold pb-2 border-b-2 transition-colors",
              step === "shipping" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            )}
            data-testid="tab-shipping"
          >
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            Shipping
          </button>
          <button
            onClick={() => { if (validateShipping()) setStep("payment"); }}
            className={cn(
              "flex items-center gap-2 text-xs uppercase tracking-widest font-semibold pb-2 border-b-2 transition-colors",
              step === "payment" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            )}
            data-testid="tab-payment"
          >
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            Payment
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          <div className="flex-1">
            {step === "shipping" && (
              <div className="space-y-5" data-testid="section-shipping-form">
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6">Delivery Address</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingName" className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
                    <Input data-testid="input-shipping-name" id="shippingName" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} className="mt-2 rounded-none h-12" />
                  </div>
                  <div>
                    <Label htmlFor="shippingPhone" className="text-xs uppercase tracking-widest text-muted-foreground">Mobile Number</Label>
                    <Input data-testid="input-shipping-phone" id="shippingPhone" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} className="mt-2 rounded-none h-12" placeholder="10-digit mobile" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingAddress" className="text-xs uppercase tracking-widest text-muted-foreground">Address</Label>
                  <Input data-testid="input-shipping-address" id="shippingAddress" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="mt-2 rounded-none h-12" placeholder="House/Flat No., Street, Locality" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shippingCity" className="text-xs uppercase tracking-widest text-muted-foreground">City</Label>
                    <Input data-testid="input-shipping-city" id="shippingCity" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="mt-2 rounded-none h-12" />
                  </div>
                  <div>
                    <Label htmlFor="shippingState" className="text-xs uppercase tracking-widest text-muted-foreground">State</Label>
                    <select data-testid="select-shipping-state" id="shippingState" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className="mt-2 w-full border border-input bg-background px-3 h-12 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="shippingPincode" className="text-xs uppercase tracking-widest text-muted-foreground">Pincode</Label>
                    <Input data-testid="input-shipping-pincode" id="shippingPincode" value={shipping.pincode} onChange={(e) => setShipping({ ...shipping, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className="mt-2 rounded-none h-12" placeholder="6-digit pincode" />
                  </div>
                </div>

                <button
                  onClick={() => { if (validateShipping()) setStep("payment"); }}
                  data-testid="button-continue-to-payment"
                  className="w-full bg-foreground text-background py-4 text-sm uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity mt-4"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === "payment" && (
              <>
                <h2 className="text-sm uppercase tracking-widest font-semibold mb-6">Payment Method</h2>

                <div className="flex border border-border mb-8">
                  <button
                    data-testid="button-payment-card"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 px-3 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2",
                      paymentMethod === "card" ? "border-foreground bg-secondary/50" : "border-transparent text-muted-foreground"
                    )}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden sm:inline">Card</span>
                  </button>
                  <button
                    data-testid="button-payment-netbanking"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 px-3 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2",
                      paymentMethod === "netbanking" ? "border-foreground bg-secondary/50" : "border-transparent text-muted-foreground"
                    )}
                    onClick={() => setPaymentMethod("netbanking")}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Net Banking</span>
                  </button>
                  <button
                    data-testid="button-payment-upi"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 px-3 text-xs uppercase tracking-wider font-semibold transition-colors border-b-2",
                      paymentMethod === "upi" ? "border-foreground bg-secondary/50" : "border-transparent text-muted-foreground"
                    )}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="hidden sm:inline">UPI</span>
                  </button>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-6" data-testid="section-card-form">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-muted-foreground text-xs uppercase tracking-widest">We Accept</span>
                      <div className="flex items-center gap-3">
                        <SiVisa className="w-10 h-7 text-blue-700" />
                        <SiMastercard className="w-8 h-7 text-orange-600" />
                        <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">RuPay</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName" className="text-xs uppercase tracking-widest text-muted-foreground">Name on Card</Label>
                      <Input data-testid="input-card-name" id="cardName" placeholder="Full name as on card" value={cardName} onChange={(e) => setCardName(e.target.value)} className="mt-2 rounded-none h-12" />
                    </div>

                    <div>
                      <Label htmlFor="cardNumber" className="text-xs uppercase tracking-widest text-muted-foreground">Card Number</Label>
                      <Input data-testid="input-card-number" id="cardNumber" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} className="mt-2 rounded-none h-12 font-mono" />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="cardExpiry" className="text-xs uppercase tracking-widest text-muted-foreground">Expiry</Label>
                        <Input data-testid="input-card-expiry" id="cardExpiry" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} className="mt-2 rounded-none h-12 font-mono" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="cardCvv" className="text-xs uppercase tracking-widest text-muted-foreground">CVV</Label>
                        <Input data-testid="input-card-cvv" id="cardCvv" placeholder="123" type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} maxLength={3} className="mt-2 rounded-none h-12 font-mono" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="space-y-3" data-testid="section-netbanking">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Select Your Bank</p>
                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                      {BANKS.map((bank) => (
                        <button
                          key={bank.id}
                          data-testid={`button-bank-${bank.id}`}
                          className={cn(
                            "flex items-center justify-between px-4 py-4 border transition-colors text-left text-sm",
                            selectedBank === bank.id
                              ? "border-foreground bg-secondary/50 font-medium"
                              : "border-border hover:border-foreground/30"
                          )}
                          onClick={() => setSelectedBank(bank.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>{bank.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="space-y-4" data-testid="section-upi">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Choose UPI Option</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <button data-testid="button-upi-gpay" className={cn("flex flex-col items-center gap-3 py-6 px-4 border transition-colors", upiApp === "gpay" ? "border-foreground bg-secondary/50" : "border-border hover:border-foreground/30")} onClick={() => setUpiApp("gpay")}>
                        <SiGooglepay className="w-12 h-8" />
                        <span className="text-xs font-medium">Google Pay</span>
                      </button>
                      <button data-testid="button-upi-paytm" className={cn("flex flex-col items-center gap-3 py-6 px-4 border transition-colors", upiApp === "paytm" ? "border-foreground bg-secondary/50" : "border-border hover:border-foreground/30")} onClick={() => setUpiApp("paytm")}>
                        <SiPaytm className="w-12 h-8 text-blue-600" />
                        <span className="text-xs font-medium">Paytm</span>
                      </button>
                      <button data-testid="button-upi-amazonpay" className={cn("flex flex-col items-center gap-3 py-6 px-4 border transition-colors", upiApp === "amazonpay" ? "border-foreground bg-secondary/50" : "border-border hover:border-foreground/30")} onClick={() => setUpiApp("amazonpay")}>
                        <FaAmazonPay className="w-12 h-8 text-orange-500" />
                        <span className="text-xs font-medium">Amazon Pay</span>
                      </button>
                    </div>

                    <div className="border-t border-border pt-6">
                      <button data-testid="button-upi-id" className={cn("flex items-center gap-3 w-full text-left mb-4 py-3 px-4 border transition-colors", upiApp === "upi_id" ? "border-foreground bg-secondary/50" : "border-border hover:border-foreground/30")} onClick={() => setUpiApp("upi_id")}>
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Pay using UPI ID</span>
                      </button>
                      {upiApp === "upi_id" && (
                        <div>
                          <Label htmlFor="upiId" className="text-xs uppercase tracking-widest text-muted-foreground">Your UPI ID</Label>
                          <Input data-testid="input-upi-id" id="upiId" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="mt-2 rounded-none h-12" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="border border-border p-6 sticky top-32">
              <h2 className="text-sm uppercase tracking-widest font-semibold mb-6">Order Summary</h2>
              
              <ul className="space-y-4 mb-6">
                {items.map((item) => (
                  <li key={item.product.id} className="flex gap-3">
                    <div className="w-14 h-18 bg-secondary shrink-0 overflow-hidden">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.selectedSize && item.selectedSize !== "Free Size" && `Size: ${item.selectedSize} · `}Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">
                      ₹{(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-3 border-t border-border">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {step === "payment" && (
                <Button
                  data-testid="button-place-order"
                  className="w-full rounded-none py-6 text-sm uppercase tracking-widest font-semibold mt-6"
                  onClick={handlePlaceOrder}
                  disabled={placeOrderMutation.isPending}
                >
                  {placeOrderMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Pay ₹{cartTotal.toLocaleString('en-IN')}
                </Button>
              )}

              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Secure Payment</span>
              </div>

              <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border/50">
                <SiVisa className="w-8 h-5 text-blue-700 opacity-60" />
                <SiMastercard className="w-6 h-5 text-orange-600 opacity-60" />
                <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded opacity-60">RuPay</span>
                <SiGooglepay className="w-8 h-5 opacity-60" />
                <SiPaytm className="w-8 h-5 text-blue-600 opacity-60" />
                <FaAmazonPay className="w-8 h-5 text-orange-500 opacity-60" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
