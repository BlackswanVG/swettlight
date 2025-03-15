import { users, listings, votes, proposals, delegations, type User, type InsertUser, type Listing, type InsertListing, type Vote, type InsertVote, type Proposal, type InsertProposal, type Delegation, type InsertDelegation } from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Existing methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getListings(): Promise<Listing[]>;
  createListing(listing: InsertListing & { createdById: number }): Promise<Listing>;
  createVote(vote: InsertVote & { userId: number }): Promise<Vote>;
  verifyUserKYC(userId: number): Promise<void>;

  // New methods for DAO governance
  getProposals(): Promise<Proposal[]>;
  getProposal(id: number): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal & { createdById: number }): Promise<Proposal>;
  getProposalVotes(proposalId: number): Promise<Vote[]>;
  getDelegations(userId: number): Promise<Delegation[]>;
  createDelegation(delegation: InsertDelegation & { delegatorId: number }): Promise<Delegation>;
  revokeDelegation(delegationId: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Existing methods remain unchanged
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getListings(): Promise<Listing[]> {
    return await db.select().from(listings);
  }

  async createListing(listing: InsertListing & { createdById: number }): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async createVote(vote: InsertVote & { userId: number }): Promise<Vote> {
    const [newVote] = await db.insert(votes).values(vote).returning();
    return newVote;
  }

  async verifyUserKYC(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ isKYCVerified: true })
      .where(eq(users.id, userId));
  }

  // New methods for DAO governance
  async getProposals(): Promise<Proposal[]> {
    return await db
      .select()
      .from(proposals)
      .orderBy(proposals.createdAt);
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id));
    return proposal;
  }

  async createProposal(proposal: InsertProposal & { createdById: number }): Promise<Proposal> {
    const [newProposal] = await db
      .insert(proposals)
      .values(proposal)
      .returning();
    return newProposal;
  }

  async getProposalVotes(proposalId: number): Promise<Vote[]> {
    return await db
      .select()
      .from(votes)
      .where(eq(votes.proposalId, proposalId));
  }

  async getDelegations(userId: number): Promise<Delegation[]> {
    return await db
      .select()
      .from(delegations)
      .where(
        and(
          eq(delegations.delegatorId, userId),
          eq(delegations.isActive, true),
        )
      );
  }

  async createDelegation(delegation: InsertDelegation & { delegatorId: number }): Promise<Delegation> {
    // First deactivate any existing active delegations
    await db
      .update(delegations)
      .set({ isActive: false })
      .where(
        and(
          eq(delegations.delegatorId, delegation.delegatorId),
          eq(delegations.isActive, true)
        )
      );

    // Create new delegation
    const [newDelegation] = await db
      .insert(delegations)
      .values({ ...delegation, isActive: true })
      .returning();
    return newDelegation;
  }

  async revokeDelegation(delegationId: number): Promise<void> {
    await db
      .update(delegations)
      .set({ isActive: false })
      .where(eq(delegations.id, delegationId));
  }
}

export const storage = new DatabaseStorage();