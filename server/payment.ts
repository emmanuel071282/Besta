import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_API = "https://api.razorpay.com/v1";

// Base64 encoded credentials for Basic Auth
function authHeader() {
  return "Basic " + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
}

export interface RazorpayOrder {
  id: string;
  amount: number;      // paise
  currency: string;
  receipt: string;
  status: string;
}

/**
 * Create a Razorpay order — must be called server-side.
 * @param amountInRupees  Final order amount in INR (after discount + GST)
 * @param receipt         Your internal order reference (e.g. "BESTA-1234")
 */
export async function createRazorpayOrder(
  amountInRupees: number,
  receipt: string
): Promise<RazorpayOrder> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    // Demo mode — return a fake order so the app still works without live keys
    return {
      id: `demo_order_${Date.now()}`,
      amount: Math.round(amountInRupees * 100),
      currency: "INR",
      receipt,
      status: "created",
    };
  }

  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amountInRupees * 100), // convert to paise
      currency: "INR",
      receipt,
      payment_capture: 1,                       // auto-capture
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.description || "Failed to create Razorpay order");
  }

  return res.json() as Promise<RazorpayOrder>;
}

/**
 * Verify Razorpay payment signature — prevents tampered callbacks.
 * The signature is HMAC-SHA256 of "razorpayOrderId|razorpayPaymentId" using the key secret.
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  if (!RAZORPAY_KEY_SECRET) return true; // demo mode — skip verification

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/** Returns true if Razorpay keys are configured */
export function isRazorpayConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
}

/** Expose the public Key ID to the frontend */
export function getRazorpayKeyId(): string {
  return RAZORPAY_KEY_ID;
}
