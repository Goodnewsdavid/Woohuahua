import { NextResponse } from "next/server";
import twilio from "twilio";
import { getOptionalUserId } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId(request);
    const body = await request.json().catch(() => ({}));
    const callerType =
      typeof body.callerType === "string" && ["owner", "organisation", "emergency"].includes(body.callerType)
        ? body.callerType
        : "owner";

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid || !phoneNumber) {
      return NextResponse.json(
        { error: "Voice service is not configured. Please try again later." },
        { status: 503 }
      );
    }

    const identity = `web_${userId || "anon"}_${Date.now()}`.replace(/[^a-zA-Z0-9_]/g, "_");

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      outgoingApplicationParams: { callerType },
      incomingAllow: false,
    });

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity,
      ttl: 3600,
    });
    token.addGrant(voiceGrant);

    return NextResponse.json({
      token: token.toJwt(),
      identity,
      phoneNumber,
    });
  } catch (err) {
    console.error("[voice/token]", err);
    return NextResponse.json(
      { error: "Failed to generate voice token. Please try again." },
      { status: 500 }
    );
  }
}
