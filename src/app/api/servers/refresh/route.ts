import { NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const servers = await db.select().from(schema.containers);
        return NextResponse.json(servers, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}