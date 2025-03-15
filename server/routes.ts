import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertListingSchema, insertVoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Listings
  app.get("/api/listings", async (req, res) => {
    const listings = await storage.getListings();
    res.json(listings);
  });

  app.post("/api/listings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user.isKYCVerified) return res.status(403).send("KYC verification required");

    const parsed = insertListingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const listing = await storage.createListing({
      ...parsed.data,
      createdById: req.user.id,
    });
    res.status(201).json(listing);
  });

  // Votes
  app.post("/api/listings/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user.isKYCVerified) return res.status(403).send("KYC verification required");

    const parsed = insertVoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const vote = await storage.createVote({
      ...parsed.data,
      userId: req.user.id,
      listingId: parseInt(req.params.id),
    });
    res.status(201).json(vote);
  });

  // KYC
  app.post("/api/kyc/verify", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // In a real app, this would integrate with a KYC provider
    await storage.verifyUserKYC(req.user.id);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}
