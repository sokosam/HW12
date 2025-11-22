import { NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const server = await db.select().from(schema.containers).where(eq(schema.containers.id, parseInt(params.id)));
        return NextResponse.json(server, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}