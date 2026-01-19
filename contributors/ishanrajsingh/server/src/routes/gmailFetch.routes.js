import express from "express";
import { fetchTransactionalEmails } from "../controllers/gmailFetch.controller.js";

const router = express.Router();

// GET /api/gmail/transactions?limit=10
router.get("/gmail/transactions", fetchTransactionalEmails);

export default router;
