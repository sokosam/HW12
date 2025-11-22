import { NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const error = await db.select().from(schema.errors).where(eq(schema.errors.id, parseInt(params.id)));
        return NextResponse.json(error, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}