import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioEnabled =
  accountSid && authToken && fromNumber &&
  accountSid.startsWith("AC") &&
  authToken.length > 10;

export async function sendSms(
  to: string,
  message: string
): Promise<{ simulated: boolean; error?: string }> {
  if (!twilioEnabled) {
    console.log(`[WA SIM] No Twilio credentials — To +91${to}: ${message}`);
    return { simulated: true };
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:+91${to}`,
    });
    console.log(`[WhatsApp] Sent to +91${to} — SID: ${result.sid} Status: ${result.status}`);
    return { simulated: false };
  } catch (err: any) {
    console.error(`[WhatsApp ERROR] Failed to send to +91${to}:`, err?.message || err);
    console.error(`[WhatsApp ERROR] Twilio code: ${err?.code}, status: ${err?.status}`);
    // Graceful fallback — return OTP in response so it can be shown on screen
    return { simulated: true, error: err?.message };
  }
}
