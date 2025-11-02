const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

 const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes')
const authenticate = require('./middlewares/authmiddleware');
const PORT = 3000;

app.use('/api/auth',authRoutes);
app.use('/api/users',authenticate,userRoutes)


app.listen(PORT,()=>{
    console.log("Server is running on port ",PORT)
})