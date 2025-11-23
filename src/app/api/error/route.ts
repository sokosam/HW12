import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export async function GET(_request: Request) {
  try {
    const results = await db
      .select({
        id: schema.errors.id,
        containerId: schema.errors.containerId,
        errorMessage: schema.errors.errorMessage,
        explaination: schema.errors.explaination,
        suggestedFix: schema.errors.suggestedFix,
        occurredAt: schema.errors.occurredAt,
        resolved: schema.errors.resolved,
        resolvedAt: schema.errors.resolvedAt,
        containerName: schema.containers.name,
      })
      .from(schema.errors)
      .innerJoin(
        schema.containers,
        eq(schema.errors.containerId, schema.containers.id),
      )
      .orderBy(desc(schema.errors.occurredAt));

    const incidents = results.map((record) => ({
      id: record.id.toString(),
      serverId: record.containerId.toString(),
      serverName: record.containerName,
      timestamp: record.occurredAt,
      logs: record.errorMessage,
      aiSummary: record.explaination,
      aiFix: record.suggestedFix,
      resolved: record.resolved,
    }));

    return NextResponse.json(incidents, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
