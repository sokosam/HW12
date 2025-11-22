
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

const heartbeatPayload = z.object({
  containerId: z.number().int().positive(),
  checkedInAt: z.union([z.string().datetime(), z.number()]).optional(),
});

export async function POST(request: Request) {
  try {
    const payload = heartbeatPayload.parse(await request.json());

  const checkedInAt =
      payload.checkedInAt !== undefined
        ? new Date(payload.checkedInAt)
        : new Date();

    await db.insert(schema.statuses).values({
      containerId: payload.containerId,
      status: "running",
      checkedInAt,
    });

    return NextResponse.json(
      { message: "Heartbeat recorded successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to record heartbeat" },
      { status: 500 },
    );
  }
}
