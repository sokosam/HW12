import { NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const errors = await db.select().from(schema.errors).where(eq(schema.errors.id, parseInt(params.id)));
        
        if (errors.length === 0) {
            return NextResponse.json({ error: "Error not found" }, { status: 404 });
        }
        
        return NextResponse.json(errors[0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}