require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/projectRoutes');
const connectDB = require('./db/connection');
const app = express();
const PORT = process.env.PORT || 3000; // Provide a default port if not set in .env

// Connect to the database
connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
  }));

app.use('/', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});