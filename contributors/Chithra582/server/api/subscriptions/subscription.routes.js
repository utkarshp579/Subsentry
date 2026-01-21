import express from "express";
import { saveEmailSubscription } from "./subscription.controller.js";

const router = express.Router();

router.post("/email", saveEmailSubscription);

export default router;
