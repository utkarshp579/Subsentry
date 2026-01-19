import cors from 'cors';
import express from 'express';
import subscriptionRoutes from './routes/subscription.routes.js';
import attachUser from './middleware/attachUser.js';
import gmailAuthRoutes from "./routes/gmailAuth.routes.js";
import gmailFetchRoutes from "./routes/gmailFetch.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(attachUser);
app.use("/api", gmailAuthRoutes);
app.use("/api", gmailFetchRoutes);

app.get('/', (_, res) => {
  res.send('SubSentry API running');
});

app.use('/api/subscriptions', subscriptionRoutes);

export default app;
