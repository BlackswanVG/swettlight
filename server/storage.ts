import { users, listings, votes, type User, type InsertUser, type Listing, type InsertListing, type Vote, type InsertVote } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getListings(): Promise<Listing[]>;
  createListing(listing: InsertListing & { createdById: number }): Promise<Listing>;
  createVote(vote: InsertVote & { userId: number }): Promise<Vote>;
  verifyUserKYC(userId: number): Promise<void>;
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
}

export const storage = new DatabaseStorage();