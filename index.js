import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = process.env.PORT || 8080; // Use dynamic port for Azure

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(express.static("public")); // Serve static files

// Session configuration (needed for authentication)
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Store this in your .env file
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week session
      httpOnly: true, // Security flag
    },
  })
);

// Initialize passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// ========== ROUTES ========== //
// Home page route
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Login page route
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Signup page route
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// Protected home route (only accessible when authenticated)
app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("home.ejs");
  } else {
    res.redirect("/login");
  }
});

// ========== PASSPORT CONFIGURATION ========== //
// Passport local strategy for username/password authentication
passport.use(
  new Strategy(async function verify(username, password, cb) {
    // Database query would go here
    // Currently just a placeholder for the auth logic
  })
);

// Serialize user to store in session
passport.serializeUser((user, cb) => {
  cb(null, user.id); // Assuming user has an id property
});

// Deserialize user from session
passport.deserializeUser(async (id, cb) => {
  // Database query would go here
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
