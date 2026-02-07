import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";

/**
 * Twilio Voice webhook. Called when a call connects.
 * Set this URL in your TwiML App: https://your-public-url/api/voice/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get("CallSid")?.toString() || "";
    const callerType = formData.get("callerType")?.toString() || "owner";

    if (!callSid) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, an error occurred.</Say><Hangup/></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    await prisma.callSession.create({
      data: {
        twilioCallSid: callSid,
        callerType: callerType || null,
      },
    });

    const voice = twilio.twiml.VoiceResponse;
    const twiml = new voice();

    twiml.say(
      { voice: "Polly.Joanna", language: "en-GB" },
      "Hello! Thank you for calling Woo-Huahua Database. Our AI assistant can help with microchip registration, pet search, and general support. For complex issues, you'll be connected to a human agent. How can I assist you today?"
    );

    twiml.pause({ length: 2 });

    twiml.say(
      { voice: "Polly.Joanna", language: "en-GB" },
      "For now, please use our online chat or visit our website for immediate support. Thank you for calling. Goodbye."
    );

    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err) {
    console.error("[voice/webhook]", err);
    const voice = twilio.twiml.VoiceResponse;
    const twiml = new voice();
    twiml.say({ voice: "Polly.Joanna" }, "Sorry, we're experiencing technical difficulties. Please try again later.");
    twiml.hangup();
    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
