import express from "express";
import { createSubscription, getSubscription } from "../controllers/subscriptions.controller.js";
import { requireAuth } from "../middlewares/clerk.middleware.js";

const router = express.Router();

router.post("/", createSubscription);
router.get("/", getSubscription);

export default router;