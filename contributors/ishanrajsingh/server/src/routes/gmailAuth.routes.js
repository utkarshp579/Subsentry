import express from "express";
import {
  startGoogleOAuth,
  googleOAuthCallback
} from "../controllers/gmailAuthController.js";

const router = express.Router();

router.get("/auth/google", startGoogleOAuth);
router.get("/auth/google/callback", googleOAuthCallback);

export default router;
