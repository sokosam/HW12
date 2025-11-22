import { NextResponse } from "next/server";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export async function POST() {
  try {
    const servers = await db.select().from(schema.containers);
    // INTEGRATION: Trigger agent refresh before returning cached data.
    return NextResponse.json(servers, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}