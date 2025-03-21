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
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  vesselType: text("vessel_type").notNull(),
  projectedROI: text("projected_roi").notNull(),
  ownershipPercentage: integer("ownership_percentage").notNull(),
  createdById: integer("created_by_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  details: jsonb("details").notNull(),
  imageUrl: text("image_url"),
  tokenSupply: integer("token_supply"),
  tokenPrice: text("token_price"),
  tokenContractAddress: text("token_contract_address"),
  vesselIdentifiers: jsonb("vessel_identifiers").notNull(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdById: integer("created_by_id").notNull(),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  executionData: jsonb("execution_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id"),
  listingId: integer("listing_id"),
  userId: integer("user_id").notNull(),
  vote: text("vote").notNull(), 
  votingPower: integer("voting_power").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const delegations = pgTable("delegations", {
  id: serial("id").primaryKey(),
  delegatorId: integer("delegator_id").notNull(),
  delegateId: integer("delegate_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
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
  imageUrl: true,
  tokenSupply: true,
  tokenPrice: true,
  tokenContractAddress: true,
  vesselIdentifiers: true,
});

export const insertProposalSchema = createInsertSchema(proposals).pick({
  title: true,
  description: true,
  endDate: true,
  executionData: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  proposalId: true,
  listingId: true,
  vote: true,
  votingPower: true,
});

export const insertDelegationSchema = createInsertSchema(delegations).pick({
  delegateId: true,
  expiresAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertDelegation = z.infer<typeof insertDelegationSchema>;

export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Delegation = typeof delegations.$inferSelect;