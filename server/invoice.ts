import type { Order, OrderItem, User, Product } from "@shared/schema";
import { sendSms } from "./sms";

// ---------------------------------------------------------------------------
// Besta GST Configuration
// ---------------------------------------------------------------------------
const BESTA_GSTIN = "24ABGFB7929N1ZY";
const BESTA_STATE = "Gujarat";
const BESTA_STATE_CODE = "24";
const BESTA_ADDRESS = "Besta Fashion, Gujarat, India";
const BESTA_EMAIL = "customercare@bestafashion.in";
const BESTA_PHONE = "+91-9377637787";

// ---------------------------------------------------------------------------
// GST Rate Logic (as per Indian GST slabs for apparel/footwear)
// ---------------------------------------------------------------------------
export interface GSTBreakdown {
  taxableAmount: number;
  gstRate: number;       // e.g. 5, 12, 18
  cgst: number;          // intra-state
  sgst: number;          // intra-state
  igst: number;          // inter-state
  totalGST: number;
  totalWithGST: number;
  hsnCode: string;
  isInterState: boolean;
}

function getGSTRate(category: string, pricePerUnit: number): { rate: number; hsn: string } {
  const cat = category.toLowerCase();

  if (cat === "accessories") return { rate: 18, hsn: "7117" };  // imitation jewellery
  if (cat === "cosmetics")   return { rate: 18, hsn: "3304" };  // beauty products
  if (cat === "footwear")    return pricePerUnit <= 1000 ? { rate: 5, hsn: "6404" } : { rate: 12, hsn: "6404" };

  // Apparel — Ladies, Mens, Kids, all clothing sub-categories
  return pricePerUnit <= 1000 ? { rate: 5, hsn: "6106" } : { rate: 12, hsn: "6106" };
}

export function calculateGST(
  category: string,
  pricePerUnit: number,
  quantity: number,
  customerState: string
): GSTBreakdown {
  const { rate, hsn } = getGSTRate(category, pricePerUnit);
  const isInterState = customerState.trim().toLowerCase() !== BESTA_STATE.toLowerCase();

  // GST is included in displayed price (price shown = price incl. GST)
  // Back-calculate taxable amount
  const totalWithGST = pricePerUnit * quantity;
  const taxableAmount = Math.round((totalWithGST / (1 + rate / 100)) * 100) / 100;
  const totalGST = Math.round((totalWithGST - taxableAmount) * 100) / 100;

  return {
    taxableAmount,
    gstRate: rate,
    cgst: isInterState ? 0 : Math.round((totalGST / 2) * 100) / 100,
    sgst: isInterState ? 0 : Math.round((totalGST / 2) * 100) / 100,
    igst: isInterState ? totalGST : 0,
    totalGST,
    totalWithGST,
    hsnCode: hsn,
    isInterState,
  };
}

// ---------------------------------------------------------------------------
// Invoice Number Generator  (format: BESTA/GJ/25-26/00001)
// ---------------------------------------------------------------------------
let invoiceCounter = parseInt(process.env.INVOICE_START || "1", 10);

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fy = `${String(year).slice(2)}-${String(year + 1).slice(2)}`;
  const seq = String(invoiceCounter++).padStart(5, "0");
  return `BESTA/GJ/${fy}/${seq}`;
}

// ---------------------------------------------------------------------------
// HTML Invoice Template
// ---------------------------------------------------------------------------
export interface InvoiceLineItem {
  name: string;
  category: string;
  size?: string | null;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: string;
  customer: { name: string; mobile: string; email?: string; address: string; state: string; pincode: string };
  items: InvoiceLineItem[];
  subtotalTaxable: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentId?: string;
  isInterState: boolean;
}

export function buildInvoiceData(
  order: Order,
  orderItems: (OrderItem & { productName?: string; productImage?: string; productCategory?: string })[],
  user: User,
  products: Product[]
): InvoiceData {
  const isInterState = order.shippingState.trim().toLowerCase() !== BESTA_STATE.toLowerCase();
  const lines: InvoiceLineItem[] = [];

  let subtotalTaxable = 0;
  let totalCGST = 0, totalSGST = 0, totalIGST = 0, totalGST = 0;

  for (const item of orderItems) {
    const product = products.find(p => p.id === item.productId);
    const category = product?.category || item.productCategory || "Apparel";
    const unitPrice = Number(item.price);
    const gst = calculateGST(category, unitPrice, item.quantity, order.shippingState);

    subtotalTaxable += gst.taxableAmount;
    totalCGST += gst.cgst;
    totalSGST += gst.sgst;
    totalIGST += gst.igst;
    totalGST += gst.totalGST;

    lines.push({
      name: product?.name || item.productName || "Product",
      category,
      size: item.size,
      hsnCode: gst.hsnCode,
      quantity: item.quantity,
      unitPrice,
      taxableAmount: gst.taxableAmount,
      gstRate: gst.gstRate,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      totalGST: gst.totalGST,
      total: gst.totalWithGST,
    });
  }

  return {
    invoiceNumber: order.invoiceNumber || generateInvoiceNumber(),
    orderNumber: order.orderNumber,
    invoiceDate: new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    customer: {
      name: order.shippingName,
      mobile: order.shippingPhone,
      email: user.email || undefined,
      address: `${order.shippingAddress}, ${order.shippingCity}`,
      state: order.shippingState,
      pincode: order.shippingPincode,
    },
    items: lines,
    subtotalTaxable: Math.round(subtotalTaxable * 100) / 100,
    totalCGST: Math.round(totalCGST * 100) / 100,
    totalSGST: Math.round(totalSGST * 100) / 100,
    totalIGST: Math.round(totalIGST * 100) / 100,
    totalGST: Math.round(totalGST * 100) / 100,
    discount: Number(order.discountAmount),
    grandTotal: Number(order.totalAmount),
    paymentMethod: order.paymentMethod,
    paymentId: order.razorpayPaymentId || undefined,
    isInterState,
  };
}

export function generateInvoiceHTML(inv: InvoiceData): string {
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const itemRows = inv.items.map(item => `
    <tr>
      <td>${item.name}${item.size ? ` <span style="color:#666;font-size:11px">(${item.size})</span>` : ""}</td>
      <td style="text-align:center">${item.hsnCode}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${fmt(item.unitPrice)}</td>
      <td style="text-align:right">${fmt(item.taxableAmount)}</td>
      <td style="text-align:center">${item.gstRate}%</td>
      ${inv.isInterState
        ? `<td style="text-align:right">${fmt(item.igst)}</td>`
        : `<td style="text-align:right">${fmt(item.cgst)}<br/>${fmt(item.sgst)}</td>`
      }
      <td style="text-align:right"><strong>${fmt(item.total)}</strong></td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${inv.invoiceNumber}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; margin: 0; padding: 20px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 16px; }
  .brand { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
  .brand span { color: #555; font-size: 12px; font-weight: 400; display: block; letter-spacing: 2px; margin-top: 2px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { margin: 0 0 4px; font-size: 18px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .box { background: #f8f8f8; padding: 12px 16px; }
  .box h4 { margin: 0 0 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #111; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .totals { margin-left: auto; width: 320px; }
  .totals table td { padding: 5px 10px; }
  .grand-total td { font-size: 15px; font-weight: bold; background: #111; color: #fff; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #666; text-align: center; }
  .paid-badge { display: inline-block; background: #16a34a; color: #fff; padding: 2px 10px; font-size: 11px; font-weight: bold; letter-spacing: 1px; border-radius: 2px; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">BESTA <span>FASHION</span></div>
    <div style="margin-top:8px; font-size:12px; color:#444;">
      ${BESTA_ADDRESS}<br/>
      GSTIN: <strong>${BESTA_GSTIN}</strong><br/>
      ${BESTA_EMAIL} · ${BESTA_PHONE}
    </div>
  </div>
  <div class="invoice-meta">
    <h2>TAX INVOICE</h2>
    <div><strong>${inv.invoiceNumber}</strong></div>
    <div style="color:#666; font-size:12px">Date: ${inv.invoiceDate}</div>
    <div style="margin-top:6px">Order: <strong>${inv.orderNumber}</strong></div>
    ${inv.paymentId ? `<div style="font-size:11px; color:#666;">Payment ID: ${inv.paymentId}</div>` : ""}
    <div style="margin-top:8px"><span class="paid-badge">✓ PAID</span></div>
  </div>
</div>

<div class="grid">
  <div class="box">
    <h4>Bill To</h4>
    <strong>${inv.customer.name}</strong><br/>
    ${inv.customer.address}<br/>
    ${inv.customer.state} – ${inv.customer.pincode}<br/>
    📱 ${inv.customer.mobile}
    ${inv.customer.email ? `<br/>✉ ${inv.customer.email}` : ""}
  </div>
  <div class="box">
    <h4>Sold By</h4>
    <strong>Besta Fashion</strong><br/>
    GSTIN: ${BESTA_GSTIN}<br/>
    State: ${BESTA_STATE} (${BESTA_STATE_CODE})<br/>
    Supply type: ${inv.isInterState ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Item</th>
      <th style="text-align:center">HSN</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Unit Price</th>
      <th style="text-align:right">Taxable</th>
      <th style="text-align:center">GST%</th>
      <th style="text-align:right">${inv.isInterState ? "IGST" : "CGST / SGST"}</th>
      <th style="text-align:right">Total</th>
    </tr>
  </thead>
  <tbody>
    ${itemRows}
  </tbody>
</table>

<div class="totals">
  <table>
    <tr><td>Taxable Amount</td><td style="text-align:right">${fmt(inv.subtotalTaxable)}</td></tr>
    ${inv.isInterState
      ? `<tr><td>IGST</td><td style="text-align:right">${fmt(inv.totalIGST)}</td></tr>`
      : `<tr><td>CGST</td><td style="text-align:right">${fmt(inv.totalCGST)}</td></tr>
         <tr><td>SGST</td><td style="text-align:right">${fmt(inv.totalSGST)}</td></tr>`
    }
    ${inv.discount > 0 ? `<tr><td style="color:#16a34a;">Discount</td><td style="text-align:right; color:#16a34a;">– ${fmt(inv.discount)}</td></tr>` : ""}
    <tr class="grand-total">
      <td>Grand Total</td>
      <td style="text-align:right">${fmt(inv.grandTotal)}</td>
    </tr>
  </table>
</div>

<div style="margin-top:20px; font-size:12px; color:#444;">
  <strong>Payment Method:</strong> ${inv.paymentMethod.toUpperCase()}
</div>

<div class="footer">
  This is a computer-generated invoice and does not require a physical signature.<br/>
  For queries: ${BESTA_EMAIL} · ${BESTA_PHONE}<br/>
  <strong>Thank you for shopping with BESTA!</strong>
</div>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// WhatsApp invoice delivery via Twilio
// ---------------------------------------------------------------------------
export async function sendInvoiceWhatsApp(
  mobile: string,
  invoiceNumber: string,
  orderNumber: string,
  grandTotal: number,
  invoiceHtml: string
): Promise<void> {
  // Send a brief confirmation message (full invoice link can be added later)
  const message =
    `🛍️ *BESTA Fashion*\n\n` +
    `✅ Your order *${orderNumber}* is confirmed!\n\n` +
    `🧾 Invoice No: *${invoiceNumber}*\n` +
    `💳 Amount Paid: *₹${grandTotal.toLocaleString("en-IN")}*\n\n` +
    `Your GST-compliant invoice has been sent to your email.\n\n` +
    `Track your order in the BESTA app. Thank you for shopping with us! 🙏`;

  try {
    await sendSms(mobile, message);
  } catch (err) {
    console.error("Failed to send WhatsApp invoice:", err);
  }
}

// ---------------------------------------------------------------------------
// Email invoice delivery — nodemailer with any SMTP provider
// ---------------------------------------------------------------------------
// Required .env vars (all optional — email is skipped gracefully if unset):
//   SMTP_HOST      e.g. smtp.gmail.com / smtp.sendgrid.net / email-smtp.ap-south-1.amazonaws.com
//   SMTP_PORT      e.g. 587 (TLS) or 465 (SSL)
//   SMTP_USER      your SMTP username / API key username
//   SMTP_PASS      your SMTP password / API key
//   SMTP_FROM      e.g. "BESTA Fashion <customercare@bestafashion.in>"
// ---------------------------------------------------------------------------

let _transporter: any = null;

async function getTransporter() {
  if (_transporter) return _transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  try {
    const mod = await import("nodemailer");
    const nm = mod.default ?? mod;  // handle both ESM and CJS interop
    _transporter = nm.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return _transporter;
  } catch {
    console.warn("[email] nodemailer not installed — run: npm install nodemailer");
    return null;
  }
}

export async function sendInvoiceEmail(
  email: string,
  invoiceNumber: string,
  orderNumber: string,
  invoiceHtml: string
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] Invoice email → ${email}  |  Invoice ${invoiceNumber}  |  Order ${orderNumber}`);
    return;
  }

  const transporter = await getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping invoice email");
    return;
  }

  const from = process.env.SMTP_FROM || "BESTA Fashion <customercare@bestafashion.in>";
  await transporter.sendMail({
    from,
    to: email,
    subject: `Your BESTA Invoice ${invoiceNumber} — Order ${orderNumber}`,
    html: invoiceHtml,
    text: `Thank you for your BESTA order ${orderNumber}. Invoice number: ${invoiceNumber}. Please view this email in an HTML-capable client to see the full invoice.`,
  });
}
