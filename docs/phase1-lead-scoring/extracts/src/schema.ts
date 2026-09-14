import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(), openId: varchar("openId", { length: 64 }).notNull().unique(), name: text("name"), email: varchar("email", { length: 320 }), loginMethod: varchar("loginMethod", { length: 64 }), role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(), lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const outreachQueue = mysqlTable("outreach_queue", {
  id: int("id").autoincrement().primaryKey(), leadId: varchar("leadId", { length: 128 }).notNull(), company: varchar("company", { length: 255 }).notNull(), jobTitle: varchar("jobTitle", { length: 255 }).notNull(), recipientEmail: varchar("recipientEmail", { length: 320 }), jobUrl: text("jobUrl"), resumeUrl: text("resumeUrl"), coverLetter: text("coverLetter"), resumeText: text("resumeText"), status: mysqlEnum("status", ["pending", "approved", "rejected", "sent", "archived"]).default("pending").notNull(), generatedAt: timestamp("generatedAt").defaultNow().notNull(), approvedAt: timestamp("approvedAt"), sentAt: timestamp("sentAt"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const outreachTouches = mysqlTable("outreach_touches", {
  id: int("id").autoincrement().primaryKey(), queueId: int("queueId").notNull(), touchNumber: int("touchNumber").notNull(), delayDays: int("delayDays").notNull(), scheduledFor: timestamp("scheduledFor"), status: mysqlEnum("status", ["scheduled", "sent", "skipped", "cancelled"]).default("scheduled").notNull(), sentAt: timestamp("sentAt"), createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export const outreachEvents = mysqlTable("outreach_events", {
  id: int("id").autoincrement().primaryKey(), queueId: int("queueId").notNull(), eventType: mysqlEnum("eventType", ["generated", "approved", "rejected", "sent", "opened", "replied", "unsubscribed", "archived", "send_blocked"]).notNull(), metadata: text("metadata"), occurredAt: timestamp("occurredAt").defaultNow().notNull(),
});
export const outreachOptOuts = mysqlTable("outreach_opt_outs", {
  id: int("id").autoincrement().primaryKey(), email: varchar("email", { length: 320 }).notNull().unique(), token: varchar("token", { length: 128 }).notNull().unique(), reason: varchar("reason", { length: 255 }), createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OutreachQueueItem = typeof outreachQueue.$inferSelect;
export type OutreachTouch = typeof outreachTouches.$inferSelect;
export type OutreachEvent = typeof outreachEvents.$inferSelect;
