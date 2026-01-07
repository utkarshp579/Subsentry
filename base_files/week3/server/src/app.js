import cors from 'cors';
import express from 'express';
import subscriptionRoutes from './routes/subscription.routes.js';
import attachUser from './middleware/attachUser.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(attachUser);

app.get('/', (_, res) => {
  res.send('SubSentry API running');
});

app.use('/api/subscriptions', subscriptionRoutes);

export default app;
