// // Mock data for frontend development
// // TODO: Replace with actual tRPC calls marked with //INTEGRATION

// export interface Server {
//   id: string;
//   name: string;
//   status: "running" | "stopped" | "crashed";
//   cpu: number;
//   memory: number;
//   updatedAt: Date;
//   lastCrashTime?: Date;
// }

// export interface Incident {
//   id: string;
//   serverId: string;
//   serverName: string;
//   timestamp: Date;
//   logs: string;
//   aiSummary: string;
//   aiFix: string;
//   resolved: boolean;
// }

// export interface TimelineEvent {
//   id: string;
//   timestamp: Date;
//   title: string;
//   description: string;
//   type: "error" | "deployment" | "incident" | "info";
// }

// export interface Org {
//   id: string;
//   name: string;
//   members: OrgMember[];
// }

// export interface OrgMember {
//   id: string;
//   userId: string;
//   userName: string;
//   userEmail: string;
//   role: "admin" | "member";
// }

// // Mock data
// export const mockServers: Server[] = [
//   {
//     id: "1",
//     name: "web-server-01",
//     status: "running",
//     cpu: 45.2,
//     memory: 62.8,
//     updatedAt: new Date(),
//   },
//   {
//     id: "2",
//     name: "api-server-02",
//     status: "running",
//     cpu: 78.5,
//     memory: 89.3,
//     updatedAt: new Date(Date.now() - 300000),
//     lastCrashTime: new Date(Date.now() - 86400000),
//   },
//   {
//     id: "3",
//     name: "db-server-03",
//     status: "crashed",
//     cpu: 0,
//     memory: 0,
//     updatedAt: new Date(Date.now() - 600000),
//     lastCrashTime: new Date(Date.now() - 600000),
//   },
//   {
//     id: "4",
//     name: "cache-server-04",
//     status: "running",
//     cpu: 23.1,
//     memory: 34.5,
//     updatedAt: new Date(),
//   },
// ];

// export const mockIncidents: Incident[] = [
//   {
//     id: "1",
//     serverId: "3",
//     serverName: "db-server-03",
//     timestamp: new Date(Date.now() - 600000),
//     logs: `[2024-01-15 10:22:15] ERROR: Out of memory exception
// [2024-01-15 10:22:14] WARN: Memory usage at 98%
// [2024-01-15 10:22:13] INFO: Processing query batch
// [2024-01-15 10:22:12] INFO: Connection pool exhausted
// [2024-01-15 10:22:11] ERROR: Failed to allocate memory for query result`,
//     aiSummary: "The database server experienced an out-of-memory (OOM) error due to excessive connection pooling and large query result sets. The system was unable to allocate additional memory when processing a batch of queries.",
//     aiFix: "1. Increase memory limits for the container\n2. Reduce connection pool size from 100 to 50\n3. Implement query result pagination\n4. Add memory monitoring alerts at 85% threshold",
//     resolved: false,
//   },
//   {
//     id: "2",
//     serverId: "2",
//     serverName: "api-server-02",
//     timestamp: new Date(Date.now() - 86400000),
//     logs: `[2024-01-14 14:30:22] ERROR: Connection timeout to database
// [2024-01-14 14:30:20] WARN: Retry attempt 3/3 failed
// [2024-01-14 14:30:18] INFO: Attempting database connection
// [2024-01-14 14:30:15] ERROR: Network interface down`,
//     aiSummary: "API server lost connection to the database due to network interface failure. Multiple retry attempts were unsuccessful.",
//     aiFix: "1. Restart network interface\n2. Verify database server is accessible\n3. Check firewall rules\n4. Implement exponential backoff retry strategy",
//     resolved: true,
//   },
//   {
//     id: "3",
//     serverId: "1",
//     serverName: "web-server-01",
//     timestamp: new Date(Date.now() - 172800000),
//     logs: `[2024-01-13 09:15:33] ERROR: SSL certificate expired
// [2024-01-13 09:15:32] WARN: Certificate expires in 0 days
// [2024-01-13 09:15:30] INFO: Starting HTTPS server`,
//     aiSummary: "Web server failed to start due to expired SSL certificate. The certificate had reached its expiration date.",
//     aiFix: "1. Renew SSL certificate\n2. Update certificate in container\n3. Restart web server\n4. Set up automatic certificate renewal",
//     resolved: true,
//   },
// ];

// export const mockTimelineEvents: TimelineEvent[] = [
//   {
//     id: "1",
//     timestamp: new Date(Date.now() - 600000),
//     title: "app crashed (OOM)",
//     description: "db-server-03 experienced out-of-memory error",
//     type: "error",
//   },
//   {
//     id: "2",
//     timestamp: new Date(Date.now() - 1800000),
//     title: "deployment: image app:v13",
//     description: "New version deployed to production",
//     type: "deployment",
//   },
//   {
//     id: "3",
//     timestamp: new Date(Date.now() - 3600000),
//     title: "incident resolved",
//     description: "api-server-02 connection issue fixed",
//     type: "incident",
//   },
//   {
//     id: "4",
//     timestamp: new Date(Date.now() - 86400000),
//     title: "app crashed (Connection timeout)",
//     description: "api-server-02 lost database connection",
//     type: "error",
//   },
//   {
//     id: "5",
//     timestamp: new Date(Date.now() - 172800000),
//     title: "deployment: image app:v12",
//     description: "Previous version deployed",
//     type: "deployment",
//   },
//   {
//     id: "6",
//     timestamp: new Date(Date.now() - 172800000),
//     title: "SSL certificate expired",
//     description: "web-server-01 certificate renewal required",
//     type: "error",
//   },
// ];

// export const mockOrgs: Org[] = [
//   {
//     id: "1",
//     name: "Engineering Team",
//     members: [
//       {
//         id: "1",
//         userId: "user1",
//         userName: "John Doe",
//         userEmail: "john@example.com",
//         role: "admin",
//       },
//       {
//         id: "2",
//         userId: "user2",
//         userName: "Jane Smith",
//         userEmail: "jane@example.com",
//         role: "member",
//       },
//     ],
//   },
//   {
//     id: "2",
//     name: "DevOps Team",
//     members: [
//       {
//         id: "3",
//         userId: "user1",
//         userName: "John Doe",
//         userEmail: "john@example.com",
//         role: "member",
//       },
//       {
//         id: "4",
//         userId: "user3",
//         userName: "Bob Johnson",
//         userEmail: "bob@example.com",
//         role: "admin",
//       },
//     ],
//   },
// ];




// src/lib/mock-data.ts
// Mock data for frontend development
// TODO: Replace with actual tRPC calls (//INTEGRATION)

export interface Server {
  id: string;
  name: string;
  status: "running" | "stopped" | "crashed";
  cpu: number;      // CPU usage in %
  memory: number;   // Memory usage in %
  updatedAt: Date;
  lastCrashTime?: Date;
}

export interface Incident {
  id: string;
  serverId: string;
  serverName: string;
  timestamp: Date;
  logs: string;
  aiSummary: string;
  aiFix: string;
  resolved: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  type: "error" | "deployment" | "incident" | "info";
}

export interface Org {
  id: string;
  name: string;
  members: OrgMember[];
}

export interface OrgMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: "admin" | "member";
}

// Helper to generate "X days ago" dates for the uptime graph
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const daysAgo = (days: number): Date =>
  new Date(Date.now() - days * MS_PER_DAY);

// -----------------------------------------------------------------------------
// SERVERS
// -----------------------------------------------------------------------------

export const mockServers: Server[] = [
  {
    id: "srv-1",
    name: "api-gateway-01",
    status: "running",
    cpu: 42.3,
    memory: 68.1,
    updatedAt: new Date(),
  },
  {
    id: "srv-2",
    name: "db-cluster-01",
    status: "running",
    cpu: 57.2,
    memory: 73.4,
    updatedAt: new Date(),
    lastCrashTime: daysAgo(21),
  },
  {
    id: "srv-3",
    name: "worker-pool-01",
    status: "crashed",
    cpu: 0,
    memory: 0,
    updatedAt: new Date(),
    lastCrashTime: daysAgo(0),
  },
  {
    id: "srv-4",
    name: "auth-service-02",
    status: "stopped",
    cpu: 0,
    memory: 0,
    updatedAt: new Date(),
    lastCrashTime: daysAgo(10),
  },
];

// -----------------------------------------------------------------------------
// INCIDENTS – sparse incident history across 90 days
// These feed the TrendGraph (uptime) and IncidentTimeline.
// -----------------------------------------------------------------------------

export const mockIncidents: Incident[] = [
  // DAY 0 – today
  {
    id: "inc-1",
    serverId: "srv-3",
    serverName: "worker-pool-01",
    timestamp: daysAgo(0),
    logs: "[Today] Panic: out of memory in job executor",
    aiSummary: "Worker pool crashed due to an OOM condition.",
    aiFix: "Increase memory limits and add queue backpressure.",
    resolved: false,
  },

  // DAY 1
  {
    id: "inc-2",
    serverId: "srv-1",
    serverName: "api-gateway-01",
    timestamp: daysAgo(1),
    logs: "[Day 1] Elevated 5xx errors during deployment window.",
    aiSummary: "API gateway had a brief outage during rollout.",
    aiFix: "Use blue/green deployments to avoid downtime.",
    resolved: true,
  },

  // DAY 3
  {
    id: "inc-3",
    serverId: "srv-2",
    serverName: "db-cluster-01",
    timestamp: daysAgo(3),
    logs: "[Day 3] Slow queries due to missing index.",
    aiSummary: "Heavy reports caused contention on an unindexed column.",
    aiFix: "Add proper indexes and tune slow queries.",
    resolved: true,
  },

  // DAY 7
  {
    id: "inc-4",
    serverId: "srv-4",
    serverName: "auth-service-02",
    timestamp: daysAgo(7),
    logs: "[Day 7] Token validation failures for mobile clients.",
    aiSummary: "JWT library upgrade caused incompatible token parsing.",
    aiFix: "Roll back library and add compatibility tests.",
    resolved: true,
  },

  // DAY 15
  {
    id: "inc-5",
    serverId: "srv-1",
    serverName: "api-gateway-01",
    timestamp: daysAgo(15),
    logs: "[Day 15] Sudden spike in 429 rate-limits.",
    aiSummary: "Upstream service degraded, causing cascading throttling.",
    aiFix: "Introduce circuit breaker and better fallbacks.",
    resolved: true,
  },

  // DAY 30
  {
    id: "inc-6",
    serverId: "srv-2",
    serverName: "db-cluster-01",
    timestamp: daysAgo(30),
    logs: "[Day 30] Replication lag exceeded 10 minutes.",
    aiSummary: "Long-running ETL jobs overloaded replica.",
    aiFix: "Move heavy jobs to a dedicated reporting replica.",
    resolved: true,
  },

  // DAY 45
  {
    id: "inc-7",
    serverId: "srv-3",
    serverName: "worker-pool-01",
    timestamp: daysAgo(45),
    logs: "[Day 45] Worker restart loop detected.",
    aiSummary: "Bad config caused workers to exit immediately.",
    aiFix: "Add config validation and safe defaults.",
    resolved: true,
  },

  // DAY 60
  {
    id: "inc-8",
    serverId: "srv-2",
    serverName: "db-cluster-01",
    timestamp: daysAgo(60),
    logs: "[Day 60] Backup job starved I/O.",
    aiSummary: "Nightly backup overlapped with traffic peak.",
    aiFix: "Reschedule backups and throttle I/O.",
    resolved: true,
  },

  // DAY 70
  {
    id: "inc-9",
    serverId: "srv-3",
    serverName: "worker-pool-01",
    timestamp: daysAgo(70),
    logs: "[Day 70] Crash loop due to uncaught exception.",
    aiSummary: "Unhandled error in job handler crashed workers.",
    aiFix: "Patch handler and add error boundaries.",
    resolved: true,
  },

  // DAY 89 (oldest day in 90-day window)
  {
    id: "inc-10",
    serverId: "srv-4",
    serverName: "auth-service-02",
    timestamp: daysAgo(89),
    logs: "[Day 89] Stale configuration cache.",
    aiSummary: "Config updates weren't propagated to all nodes.",
    aiFix: "Fix cache invalidation and add health checks.",
    resolved: true,
  },
];

// -----------------------------------------------------------------------------
// OPTIONAL: timeline + orgs (not strictly needed for your current imports,
// but left here in case other components use them later).
// -----------------------------------------------------------------------------

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "evt-1",
    timestamp: daysAgo(0),
    title: "Worker pool crash",
    description: "worker-pool-01 crashed due to OOM.",
    type: "incident",
  },
  {
    id: "evt-2",
    timestamp: daysAgo(1),
    title: "Deployment: api-gateway-01 v2",
    description: "Rolled out new gateway version.",
    type: "deployment",
  },
  {
    id: "evt-3",
    timestamp: daysAgo(7),
    title: "Auth service patch",
    description: "Patched JWT parsing bug.",
    type: "info",
  },
];

export const mockOrgs: Org[] = [
  {
    id: "org-1",
    name: "Platform Engineering",
    members: [
      {
        id: "m-1",
        userId: "user-1",
        userName: "Alice Smith",
        userEmail: "alice@example.com",
        role: "admin",
      },
      {
        id: "m-2",
        userId: "user-2",
        userName: "Bob Johnson",
        userEmail: "bob@example.com",
        role: "member",
      },
    ],
  },
];
