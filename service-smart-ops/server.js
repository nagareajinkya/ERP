const express = require('express');
const cors = require('cors');
const initScheduler = require('./utils/scheduler');
const connectDB = require('./config/db');
const smartOpsRoutes = require('./routes/smartOpsRoutes');
const offerRoutes = require('./routes/offerRoutes');
const templateRoutes = require('./routes/templateRoutes');
const printerRoutes = require('./routes/printerRoutes');



const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.options('*', (req, res) => res.sendStatus(200)); // Handle preflight status manually





app.use(express.json());
// Database
connectDB();

// Scheduler
initScheduler();

// Routes
app.use('/api/smart-ops/offers', offerRoutes);
app.use('/api/smart-ops/templates', templateRoutes);
app.use('/api/smart-ops/printer-settings', printerRoutes);
app.use('/api/smart-ops', smartOpsRoutes);


app.get('/', (req, res) => {
    res.send('Smart Ops Service Running');
});

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
});
