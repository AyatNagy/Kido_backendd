require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const childAuthRoutes = require('./routes/childAuthRoutes');
const authenticate = require('./middlewares/authmiddleware');
const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/child', childAuthRoutes);


app.listen(PORT,()=>{
    console.log("Server is running on port ",PORT)
})