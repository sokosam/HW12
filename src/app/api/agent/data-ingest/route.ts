import { NextResponse } from "next/server";
import { z } from "zod";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import twilio from "twilio";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { env } from "~/env";
import { dataUpdateEmitter } from "~/lib/websocket-server";

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

    console.log("Data inserted successfully, notifying clients...");
    // Notify all connected clients of the data update immediately after DB insert
    dataUpdateEmitter.notify();

    // Optional: Generate audio with ElevenLabs and make Twilio call
    let audioSize = 0;
    let callSid = null;

    try {
      if (
        env.ELEVENLABS_API_KEY &&
        env.TWILIO_ACCOUNT_SID &&
        env.TWILIO_AUTH_TOKEN
      ) {
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
        audioSize = audioBuffer.length;

        console.log(`Audio generated (${audioSize} bytes)`);

        // Make Twilio call if credentials are configured
        if (env.ALERT_PHONE_NUMBER && env.TWILIO_PHONE_NUMBER) {
          const twilioClient = twilio(
            env.TWILIO_ACCOUNT_SID,
            env.TWILIO_AUTH_TOKEN,
          );

          const call = await twilioClient.calls.create({
            to: env.ALERT_PHONE_NUMBER,
            from: env.TWILIO_PHONE_NUMBER,
            url: `http://twimlets.com/message?Message=${encodeURIComponent(alertMessage)}`,
          });

          callSid = call.sid;
          console.log(`Twilio call initiated: ${callSid}`);
        }
      } else {
        console.log("ElevenLabs/Twilio not configured, skipping notifications");
      }
    } catch (notificationError) {
      console.error(
        "Error sending notifications (non-fatal):",
        notificationError,
      );
      // Don't fail the whole request if notifications fail
    }

    return NextResponse.json(
      {
        message: "Data ingested successfully",
        audioGenerated: audioSize > 0,
        audioSize,
        callSid,
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
