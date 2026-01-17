import express from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import subscriptionRoutes from "./routes/subscription.routes.js"

const app = express();

app.use(clerkMiddleware());

app.use(cors());
app.use(express.json());



app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "SubSentry backend is healthy",
  });
});

app.use("/api/subscriptions", clerkMiddleware(), subscriptionRoutes);

export default app;
