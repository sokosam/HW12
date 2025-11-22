import { NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export async function GET(request: Request) {
    try {
        const errors = await db.select().from(schema.errors);
        return NextResponse.json(errors, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}