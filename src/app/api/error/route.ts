import { NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export async function GET(request: Request) {
    try {
        const errors = await db.select().from(schema.errors);
        // Return empty array if no errors, not an error response
        return NextResponse.json(errors || [], { status: 200 });
    } catch (error) {
        console.error("Error fetching errors from database:", error);
        // Return empty array on error so frontend doesn't break
        return NextResponse.json([], { status: 200 });
    }
}