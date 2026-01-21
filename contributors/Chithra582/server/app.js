import express from "express";
import subscriptionRoutes from "./api/subscriptions/subscription.routes.js";
const app = express();
app.use(express.json());
app.use("/api/subscriptions", subscriptionRoutes);
app.get("/", (req, res) => {
  res.send("Subsentry backend running");
});
export default app;
