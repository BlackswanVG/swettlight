import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  isKYCVerified: boolean("is_kyc_verified").default(false),
});

export const listings = pgTable("listings", {
  whitepaperCID: text("whitepaper_cid"),
  legalDocumentsCID: text("legal_documents_cid"),
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  vesselType: text("vessel_type").notNull(),
  projectedROI: text("projected_roi").notNull(),
  ownershipPercentage: integer("ownership_percentage").notNull(),
  createdById: integer("created_by_id")
    .references(() => users.id)
    .notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  details: jsonb("details").notNull().$type<Record<string, unknown>>(),
  whitepaperCID: text("whitepaper_cid"),
  legalDocumentsCID: text("legal_documents_cid"),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  userId: integer("user_id").notNull(),
  vote: text("vote").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertListingSchema = createInsertSchema(listings).pick({
  title: true,
  description: true,
  vesselType: true,
  projectedROI: true,
  ownershipPercentage: true,
  details: true,
  whitepaperCID: true,
  legalDocumentsCID: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  listingId: true,
  vote: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Vote = typeof votes.$inferSelect;