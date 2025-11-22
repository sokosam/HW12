import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

const ingestPayload = z.object({
  agentId: z.string().min(1),
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

    return NextResponse.json(
      { message: "Data ingested successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to ingest data" },
      { status: 500 },
    );
  }
}
