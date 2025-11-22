import { NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        // Get all errors ordered by occurredAt (newest first)
        const errors = await db
            .select({
                id: schema.errors.id,
                errorMessage: schema.errors.errorMessage,
                explaination: schema.errors.explaination,
                occurredAt: schema.errors.occurredAt,
                containerId: schema.errors.containerId,
                containerName: schema.containers.name,
            })
            .from(schema.errors)
            .innerJoin(schema.containers, eq(schema.errors.containerId, schema.containers.id))
            .orderBy(desc(schema.errors.occurredAt));

        // Transform to timeline format
        const timeline = errors.map((error) => ({
            id: error.id.toString(),
            timestamp: error.occurredAt,
            title: error.errorMessage.substring(0, 100), // Truncate for title
            description: `${error.containerName}: ${error.errorMessage.substring(0, 150)}`,
            type: "error" as const,
            // Metadata for hover
            explanation: error.explaination,
            occurredAt: error.occurredAt,
            containerName: error.containerName,
        }));

        return NextResponse.json(timeline, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}