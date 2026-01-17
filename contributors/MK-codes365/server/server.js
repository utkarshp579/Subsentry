const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

const subscriptionRoutes = require('./src/routes/subscriptionRoutes');

// Basic Route for Verification
app.get('/', (req, res) => {
    res.send('SubSentry Backend is Running...');
});

// Mount Routes
app.use('/api/subscriptions', subscriptionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
