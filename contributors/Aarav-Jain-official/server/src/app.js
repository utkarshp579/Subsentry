2;
import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.send('SubSentry API running');
});

export default app;
