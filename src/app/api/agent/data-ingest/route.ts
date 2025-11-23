import { NextResponse } from "next/server";
import { z } from "zod";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import twilio from "twilio";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { env } from "~/env";

const ingestPayload = z.object({
  agentId: z.number().int().positive(),
  containerId: z.number().int().positive(),
  serviceName: z.string().min(1),
  errorMessage: z.string().min(1).optional(),
  explanation: z.string().min(1).optional(),
  suggestedFix: z.string().min(1).optional(),
  errorLogs: z.string().min(1).optional(),
  occurredAt: z.union([z.string().datetime(), z.number()]).optional(),
});

export async function POST(request: Request) {
  try {
    const payload = ingestPayload.parse(await request.json());

    const occurredAt =
      payload.occurredAt !== undefined
        ? new Date(payload.occurredAt)
        : new Date();

    const errorMessage =
      payload.errorMessage ?? payload.errorLogs ?? "No error message provided";
    const explanation =
      payload.explanation ?? "No explanation provided by the agent.";
    const suggestedFix =
      payload.suggestedFix ?? "No suggested fix provided by the agent.";

    await db.insert(schema.errors).values({
      agentId: payload.agentId,
      containerId: payload.containerId,
      serviceName: payload.serviceName,
      errorMessage:
        payload.errorMessage ??
        payload.errorLogs ??
        "No error message provided",
      explaination:
        payload.explanation ?? "No explanation provided by the agent.",
      suggestedFix:
        payload.suggestedFix ?? "No suggested fix provided by the agent.",
      occurredAt,
    });

    // Generate audio with ElevenLabs
    const elevenlabs = new ElevenLabsClient({
      apiKey: env.ELEVENLABS_API_KEY,
    });

    const alertMessage = `Alert: Container ${payload.containerId} has encountered an error. ${errorMessage}.`;

    const audioStream = await elevenlabs.textToSpeech.convert(
      "21m00Tcm4TlvDq8ikWAM", // Rachel voice ID
      {
        text: alertMessage,
        modelId: "eleven_turbo_v2_5",
      },
    );

    // Convert audio stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString("base64");

    // Make Twilio call
    const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

    const twimlUrl = `data:text/xml;base64,${Buffer.from(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Joanna">${alertMessage}</Say>
      </Response>`,
    ).toString("base64")}`;

    const call = await twilioClient.calls.create({
      to: env.ALERT_PHONE_NUMBER,
      from: env.TWILIO_PHONE_NUMBER,
      url: `http://twimlets.com/message?Message=${encodeURIComponent(alertMessage)}`,
    });

    console.log(`Audio generated (${audioBuffer.length} bytes)`);
    console.log(`Twilio call initiated: ${call.sid}`);

    return NextResponse.json(
      {
        message: "Data ingested successfully",
        audioGenerated: true,
        audioSize: audioBuffer.length,
        callSid: call.sid,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in data-ingest:", error);
    return NextResponse.json(
      {
        error: "Failed to ingest data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
