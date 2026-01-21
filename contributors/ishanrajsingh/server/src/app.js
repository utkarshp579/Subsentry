import cors from 'cors';
import express from 'express';

import attachUser from './middleware/attachUser.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import gmailRoutes from './routes/gmailAuth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(attachUser);

app.get('/', (_req, res) => {
  res.send('SubSentry API running');
});

app.use('/api/gmail', gmailRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

export default app;