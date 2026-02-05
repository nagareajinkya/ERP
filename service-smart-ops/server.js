const express = require('express');
const cors = require('cors');
// const dotenv = require('dotenv');
// dotenv.config();
const connectDB = require('./config/db');
const smartOpsRoutes = require('./routes/smartOpsRoutes');
const offerRoutes = require('./routes/offerRoutes');



const app = express();
const PORT = 5002;

// Middleware
app.use((req, res, next) => {
    console.log(`[SmartOps] Received: ${req.method} ${req.url}`);
    next();
});
// app.use(cors()); // Disabled to prevent "Multiple Values" error (Gateway handles it)
app.options('*', (req, res) => res.sendStatus(200)); // Handle preflight status manually





app.use(express.json());

// Database
connectDB();

// Routes
app.use('/api/smart-ops/offers', offerRoutes);
app.use('/api/smart-ops', smartOpsRoutes);


app.get('/', (req, res) => {
    res.send('Smart Ops Service Running');
});

app.listen(PORT, '0.0.0.0', () => {

    console.log(`Server running on port ${PORT}`);
});
