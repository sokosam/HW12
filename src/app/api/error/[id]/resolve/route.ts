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

    // Update the error record with resolved status
    await db
      .update(schema.errors)
      .set({
        resolved: true,
        resolvedAt: new Date(),
      })
      .where(eq(schema.errors.id, parseInt(id)));

    return NextResponse.json(
      {
        id,
        resolved: true,
        message: "Incident marked as resolved successfully.",
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