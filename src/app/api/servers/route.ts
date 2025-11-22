import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export async function GET(request: Request) {
    try {
        // Get all containers
        const containers = await db.select().from(schema.containers);
        
        // Get latest status for each container
        const servers = await Promise.all(
            containers.map(async (container) => {
                const latestStatus = await db
                    .select()
                    .from(schema.statuses)
                    .where(eq(schema.statuses.containerId, container.id))
                    .orderBy(desc(schema.statuses.checkedInAt))
                    .limit(1);

                return {
                    id: container.id.toString(),
                    name: container.name,
                    status: latestStatus[0]?.status as "running" | "stopped" | "crashed" ?? "stopped",
                    cpu: 0,
                    memory: 0,
                    updatedAt: latestStatus[0]?.checkedInAt ?? container.createdAt,
                    lastCrashTime: undefined,
                };
            })
        );

        return NextResponse.json(servers, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}