import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const daysAgo = (days: number): Date =>
  new Date(Date.now() - days * MS_PER_DAY);

// Historical incidents matching mockIncidents pattern
const historicalIncidents = [
  {
    daysAgo: 0,
    containerName: "worker-pool-01",
    agentId: 3,
    serviceName: "Job Processing Service",
    errorMessage: "[Today] Panic: out of memory in job executor",
    explaination: "Worker pool crashed due to an OOM condition.",
    suggestedFix: "Increase memory limits and add queue backpressure.",
    resolved: false,
  },
  {
    daysAgo: 1,
    containerName: "api-gateway-01",
    agentId: 7,
    serviceName: "API Gateway Service",
    errorMessage: "[Day 1] Elevated 5xx errors during deployment window.",
    explaination: "API gateway had a brief outage during rollout.",
    suggestedFix: "Use blue/green deployments to avoid downtime.",
    resolved: true,
  },
  {
    daysAgo: 3,
    containerName: "db-cluster-01",
    agentId: 2,
    serviceName: "Database Service",
    errorMessage: "[Day 3] Slow queries due to missing index.",
    explaination: "Heavy reports caused contention on an unindexed column.",
    suggestedFix: "Add proper indexes and tune slow queries.",
    resolved: true,
  },
  {
    daysAgo: 7,
    containerName: "auth-service-02",
    agentId: 5,
    serviceName: "Authentication Service",
    errorMessage: "[Day 7] Token validation failures for mobile clients.",
    explaination: "JWT library upgrade caused incompatible token parsing.",
    suggestedFix: "Roll back library and add compatibility tests.",
    resolved: true,
  },
  {
    daysAgo: 15,
    containerName: "api-gateway-01",
    agentId: 1,
    serviceName: "API Gateway Service",
    errorMessage: "[Day 15] Sudden spike in 429 rate-limits.",
    explaination: "Upstream service degraded, causing cascading throttling.",
    suggestedFix: "Introduce circuit breaker and better fallbacks.",
    resolved: true,
  },
  {
    daysAgo: 30,
    containerName: "db-cluster-01",
    agentId: 4,
    serviceName: "Database Service",
    errorMessage: "[Day 30] Replication lag exceeded 10 minutes.",
    explaination: "Long-running ETL jobs overloaded replica.",
    suggestedFix: "Move heavy jobs to a dedicated reporting replica.",
    resolved: true,
  },
  {
    daysAgo: 45,
    containerName: "worker-pool-01",
    agentId: 8,
    serviceName: "Job Processing Service",
    errorMessage: "[Day 45] Worker restart loop detected.",
    explaination: "Bad config caused workers to exit immediately.",
    suggestedFix: "Add config validation and safe defaults.",
    resolved: true,
  },
  {
    daysAgo: 60,
    containerName: "db-cluster-01",
    agentId: 6,
    serviceName: "Database Service",
    errorMessage: "[Day 60] Backup job starved I/O.",
    explaination: "Nightly backup overlapped with traffic peak.",
    suggestedFix: "Reschedule backups and throttle I/O.",
    resolved: true,
  },
  {
    daysAgo: 70,
    containerName: "worker-pool-01",
    agentId: 2,
    serviceName: "Job Processing Service",
    errorMessage: "[Day 70] Crash loop due to uncaught exception.",
    explaination: "Unhandled error in job handler crashed workers.",
    suggestedFix: "Patch handler and add error boundaries.",
    resolved: true,
  },
  {
    daysAgo: 89,
    containerName: "auth-service-02",
    agentId: 3,
    serviceName: "Authentication Service",
    errorMessage: "[Day 89] Stale configuration cache.",
    explaination: "Config updates weren't propagated to all nodes.",
    suggestedFix: "Fix cache invalidation and add health checks.",
    resolved: true,
  },
];

async function seedHistoricalIncidents() {
  console.log("🌱 Seeding historical incidents...");

  try {
    // First, ensure containers exist
    const containerNames = Array.from(
      new Set(historicalIncidents.map((i) => i.containerName)),
    );

    for (const name of containerNames) {
      // Check if container exists
      const existing = await db
        .select()
        .from(schema.containers)
        .where(eq(schema.containers.name, name))
        .limit(1);

      if (existing.length === 0) {
        // Create container
        await db.insert(schema.containers).values({ name });
        console.log(`  ✓ Created container: ${name}`);
      }
    }

    // Get container IDs
    const containers = await db.select().from(schema.containers);
    const containerMap = new Map(containers.map((c) => [c.name, c.id]));

    // Insert historical incidents
    for (const incident of historicalIncidents) {
      const containerId = containerMap.get(incident.containerName);
      if (!containerId) {
        console.warn(`  ⚠ Container not found: ${incident.containerName}`);
        continue;
      }

      const occurredAt = daysAgo(incident.daysAgo);
      const resolvedAt = incident.resolved
        ? new Date(occurredAt.getTime() + 3600000) // 1 hour after occurrence
        : null;

      await db.insert(schema.errors).values({
        containerId: containerId,
        agentId: incident.agentId,
        serviceName: incident.serviceName,
        errorMessage: incident.errorMessage,
        explaination: incident.explaination,
        suggestedFix: incident.suggestedFix,
        occurredAt,
        resolved: incident.resolved,
        resolvedAt,
      });

      console.log(
        `  ✓ Seeded: ${incident.containerName} - ${incident.daysAgo} days ago (resolved: ${incident.resolved})`,
      );
    }

    console.log("✅ Historical incident seeding complete!");
    console.log(`   Total incidents: ${historicalIncidents.length}`);
    console.log(
      `   Resolved: ${historicalIncidents.filter((i) => i.resolved).length}`,
    );
    console.log(
      `   Unresolved: ${historicalIncidents.filter((i) => !i.resolved).length}`,
    );
  } catch (error) {
    console.error("❌ Error seeding historical incidents:", error);
    throw error;
  }
}

// Run if called directly
seedHistoricalIncidents()
  .then(() => {
    console.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
