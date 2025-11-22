import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const [incident] = await db
      .select({
        id: schema.errors.id,
        containerId: schema.errors.containerId,
        errorMessage: schema.errors.errorMessage,
        explaination: schema.errors.explaination,
        suggestedFix: schema.errors.suggestedFix,
        occurredAt: schema.errors.occurredAt,
        containerName: schema.containers.name,
      })
      .from(schema.errors)
      .innerJoin(
        schema.containers,
        eq(schema.errors.containerId, schema.containers.id),
      )
      .where(eq(schema.errors.id, Number.parseInt(id, 10)))
      .limit(1);

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: incident.id.toString(),
        serverId: incident.containerId.toString(),
        serverName: incident.containerName,
        timestamp: incident.occurredAt,
        logs: incident.errorMessage,
        aiSummary: incident.explaination,
        aiFix: incident.suggestedFix,
        resolved: false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}