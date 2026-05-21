/**
 * BESTA AI Stylist — WhatsApp-based conversational fashion assistant
 *
 * Customers message on WhatsApp, describe their occasion/budget/preferences,
 * and receive styled outfit recommendations from the Besta catalog.
 *
 * Uses OpenAI GPT-4o-mini for natural conversation + product matching.
 */

import type { Product, StylistConversation } from "@shared/schema";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SITE_URL = process.env.SITE_URL || "https://bestafashion.in";

export function isAIStylistConfigured(): boolean {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.length > 10;
}

// ---------------------------------------------------------------------------
// System prompt — defines the stylist personality and behavior
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are BESTA's AI Fashion Stylist — a friendly, expert personal shopper on WhatsApp.

PERSONALITY:
- Warm and approachable, like a trusted friend who works in fashion
- Use casual Indian English (mix of professional + friendly)
- Keep messages concise (WhatsApp format — no long paragraphs)
- Use emojis sparingly but naturally ✨👗

CAPABILITIES:
- Recommend complete outfits (top + bottom + accessories) for any occasion
- Work within customer's budget
- Suggest sizes based on customer info
- Know Indian fashion — weddings, festivals, office wear, casual

RULES:
1. ALWAYS ask for: gender/who it's for, occasion, budget — if not provided
2. NEVER make up products. ONLY recommend from the CATALOG provided
3. When recommending, format EXACTLY like this for each product:
   *[Product Name]* — ₹[price]
   Size: [available sizes]
   🔗 ${SITE_URL}/product/[id]
4. Group recommendations as "OUTFIT 1", "OUTFIT 2" etc.
5. Show total outfit price
6. If catalog has no matching products, say so honestly and suggest what categories to check on the website
7. Maximum 2-3 outfit options per response
8. Ask follow-up: "Want to see more options?" or "Should I try a different style?"

CONVERSATION FLOW:
- First message: Warm greeting, ask what they're looking for
- Gathering info: Ask occasion, budget, size/gender if needed
- Recommendation: Show 2-3 styled outfits with links
- Follow-up: Refine based on feedback`;

// ---------------------------------------------------------------------------
// Build product catalog context for the AI
// ---------------------------------------------------------------------------
function buildCatalogContext(products: Product[]): string {
  if (products.length === 0) return "CATALOG: No products available currently.";

  const lines = products.map(
    (p) =>
      `ID:${p.id} | ${p.name} | ₹${p.price} | ${p.category}/${p.subcategory} | Sizes: ${(p.sizes || []).join(", ") || "Free Size"}`
  );
  return `CATALOG (${products.length} products):\n${lines.join("\n")}`;
}

// ---------------------------------------------------------------------------
// Call OpenAI API
// ---------------------------------------------------------------------------
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "I'm having a technical issue right now. Please try again in a few minutes! 🙏";
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[AI Stylist] OpenAI error ${res.status}:`, errText);
      return "Oops, I'm having trouble thinking right now! Try again in a moment 🙏";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (err) {
    console.error("[AI Stylist] OpenAI call failed:", err);
    return "Something went wrong on my end. Please try again! 🙏";
  }
}

// ---------------------------------------------------------------------------
// Extract recommended product IDs from AI response
// ---------------------------------------------------------------------------
function extractProductIds(response: string, products: Product[]): number[] {
  const ids: number[] = [];
  for (const p of products) {
    // Check if product link is in the response
    if (response.includes(`/product/${p.id}`)) {
      ids.push(p.id);
    }
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Main stylist function — process incoming message and generate response
// ---------------------------------------------------------------------------
export async function processStylistMessage(
  mobile: string,
  userMessage: string,
  conversationHistory: StylistConversation[],
  products: Product[]
): Promise<{ reply: string; productIds: number[] }> {
  // Build message history for context
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT + "\n\n" + buildCatalogContext(products),
    },
  ];

  // Add last 10 messages of conversation history
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.message,
    });
  }

  // Add the new user message
  messages.push({ role: "user", content: userMessage });

  // Get AI response
  const reply = await callOpenAI(messages);

  // Extract which products were recommended
  const productIds = extractProductIds(reply, products);

  return { reply, productIds };
}

// ---------------------------------------------------------------------------
// Demo / fallback response when OpenAI is not configured
// ---------------------------------------------------------------------------
export function getDemoResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
    return (
      `Hey there! 👋 Welcome to *BESTA Style Studio* ✨\n\n` +
      `I'm your personal AI stylist. Tell me:\n` +
      `1️⃣ What's the occasion?\n` +
      `2️⃣ Who's it for? (Men/Women/Kids)\n` +
      `3️⃣ What's your budget?\n\n` +
      `For example: "Need a wedding outfit for my husband under ₹5000" 💫`
    );
  }

  return (
    `Thanks for your message! 🙏\n\n` +
    `Our AI Stylist is being set up. In the meantime, browse our collection at ${SITE_URL}\n\n` +
    `We'll be live with personalized styling recommendations soon! ✨`
  );
}
