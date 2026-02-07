import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";
import { randomUUID } from "crypto";

const SYSTEM_PROMPT = `You are the Woo-Huahua assistant, a helpful support agent for a UK pet microchip registration database. Your role is to assist users with:

1. **Registration**: How to register a pet's microchip, required information, eligibility
2. **Microchip search**: How to search for a microchip, what the results mean
3. **Lost/found pets**: How to report a lost pet, update status, transfer ownership
4. **General support**: FAQs about microchipping, compliance, legal requirements

Guidelines:
- Be concise, professional, and friendly
- Stick to factual information about the Woo-Huahua database and microchip processes
- If asked about specific pet data (e.g. owner details), explain that users must search the database or contact support; you cannot look up records
- For complex or sensitive issues, suggest connecting to a human agent
- Never invent policies or procedures; if unsure, recommend contacting support
- Use UK English spelling`;

const ESCALATION_MESSAGE =
  "I've connected you to our human support team. A team member will respond shortly. Thank you for your patience.";

export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId(request);
    const body = await request.json();
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const sessionIdInput =
      typeof body.sessionId === "string" ? body.sessionId.trim() : null;
    const requestHumanEscalation =
      body.requestHumanEscalation === true;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey && !requestHumanEscalation) {
      return NextResponse.json(
        { error: "AI service is not configured. Please try again later." },
        { status: 503 }
      );
    }

    let chatSession = sessionIdInput
      ? await prisma.chatSession.findUnique({
          where: { sessionId: sessionIdInput },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      : null;

    if (!chatSession) {
      const newSessionId = sessionIdInput || randomUUID();
      chatSession = await prisma.chatSession.create({
        data: {
          sessionId: newSessionId,
          userId: userId ?? null,
        },
        include: { messages: true },
      });
    }

    // Human escalation: log and return canned message
    if (requestHumanEscalation) {
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { humanEscalationRequested: true },
      });
      await prisma.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          role: "user",
          content: message,
          metadata: { humanEscalationRequested: true },
        },
      });
      await prisma.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          role: "assistant",
          content: ESCALATION_MESSAGE,
          metadata: { escalation: true },
        },
      });

      return NextResponse.json({
        sessionId: chatSession.sessionId,
        reply: ESCALATION_MESSAGE,
        humanEscalationRequested: true,
      });
    }

    // Log user message
    await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: "user",
        content: message,
      },
    });

    // Build messages for OpenAI
    const history = chatSession.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message },
    ];

    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 512,
      temperature: 0.6,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response. Please try again or contact our support team.";

    // Audit log assistant response
    await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: "assistant",
        content: reply,
      },
    });

    return NextResponse.json({
      sessionId: chatSession.sessionId,
      reply,
    });
  } catch (err: unknown) {
    console.error("[chat]", err);
    const status = (err as { status?: number })?.status;
    const code = (err as { code?: string })?.code;
    if (status === 429 || code === "insufficient_quota") {
      return NextResponse.json(
        {
          error:
            "Our AI service is temporarily unavailable (quota limit). Please try the 'Connect to human agent' option or try again later.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
