require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const authRoutes      = require('./routes/authRoutes');
const userRoutes      = require('./routes/userRoutes');
const childAuthRoutes = require('./routes/childAuthRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const progressRoutes  = require('./routes/progressRoutes');

app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/child',      childAuthRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/progress',   progressRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});