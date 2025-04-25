const express = require('express');
const connectDB = require('./config/db');  
const cookieParser = require('cookie-parser');  
const path = require('path');  
const app = express(); 
const authRouter = require('./routes/authRoutes');  
const propertyRouter = require('./routes/propertyRoutes'); 
const filterPropertiesRouter = require('./routes/filterPropertiesRoutes');  
const profileRouter = require('./routes/profileRoutes');  
const rateLimiter = require('./middleware/rateLimiter');  
const securityHeaders = require('./middleware/securityHeaders');  

app.use(cookieParser());   
// Middleware for parsing cookies and handling static file requests
app.use('/uploads/imagesProperty', express.static(path.join(__dirname, 'uploads', 'imagesProperty')));
app.use('/uploads/imagesUser', express.static(path.join(__dirname, 'uploads', 'imagesUser')));  
app.use(express.json());  
// Middleware to secure apis
app.use(rateLimiter);  
app.use(securityHeaders); 

connectDB();  

app.listen(process.env.Port, () => {
    console.log('Server is running on port 3000');
});

app.use(authRouter);  
app.use(propertyRouter);  
app.use(filterPropertiesRouter); 
app.use(profileRouter);  
