import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioEnabled =
  accountSid && authToken && fromNumber &&
  accountSid.startsWith("AC") &&
  authToken.length > 10;

export async function sendSms(to: string, message: string): Promise<{ simulated: boolean }> {
  if (!twilioEnabled) {
    console.log(`[WA SIM] To +91${to}: ${message}`);
    return { simulated: true };
  }

  const client = twilio(accountSid, authToken);
  await client.messages.create({
    body: message,
    from: `whatsapp:${fromNumber}`,
    to: `whatsapp:+91${to}`,
  });

  console.log(`[WhatsApp] Sent to +91${to}`);
  return { simulated: false };
}
