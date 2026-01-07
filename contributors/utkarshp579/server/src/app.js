import cors from "cors";
import express from "express";
import authenticate from "./middleware/authenticate.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticate);

app.get("/", (_, res) => {
  res.send("SubSentry API running");
});

app.use("/api/subscriptions", subscriptionRoutes);

export default app;
