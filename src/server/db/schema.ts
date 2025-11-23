// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `HW12_${name}`);

// This is just the default table that came with init of project
export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`NOW()`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const containers = createTable("container", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
}));

export const statuses = createTable("status", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  containerId: d
    .integer()
    .notNull()
    .references(() => containers.id, { onDelete: "cascade" }),
  status: d.varchar({ length: 256 }).notNull(),
  checkedInAt: d
    .timestamp({ withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
}));

export const errors = createTable("error", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  containerId: d
    .integer()
    .notNull()
    .references(() => containers.id, { onDelete: "cascade" }),
  errorMessage: d.varchar({ length: 1024 }).notNull(),
  explaination: d.varchar({ length: 2048 }).notNull(),
  suggestedFix: d.varchar({ length: 2048 }).notNull(),
  occurredAt: d
    .timestamp({ withTimezone: true })
    .default(sql`NOW()`)
    .notNull(),
  resolved: d.boolean().default(false).notNull(),
  resolvedAt: d.timestamp({ withTimezone: true }),
}));

// User and organization tables might not be necessary lets wait for clerk auth implementation first
