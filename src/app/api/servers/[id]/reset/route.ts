import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const [server] = await db
      .select()
      .from(schema.containers)
      .where(eq(schema.containers.id, Number.parseInt(id, 10)));

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // INTEGRATION: Trigger agent reset webhook here

    return NextResponse.json(
      { message: `Reset triggered for server ${server.name}` },
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