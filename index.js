import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import env from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Initialize environment variables
env.config();

const app = express();
const port = process.env.PORT || 8080; // Use dynamic port for Azure

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set view engine for EJS (make sure your EJS templates are in a "views" folder)
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Initialize session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize Database
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});

app.post("/signup", async (req, res) => {
  const { person, email, password } = req.body;
  const saltRounds = 12;
  try {
    // Check if user exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).send("Email already in use.");
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Insert user into database
      const result = await db.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [person, email, hashedPassword]
      );
      const user = result.rows[0];
      req.login(user, (err) => {
        if (err) {
          console.error("Sign Up Error:", err.message);
          return res
            .status(500)
            .json({ error: "Authentication failed. Please try again." });
        }
        return res.redirect("/home");
      });
    }
  } catch (err) {
    console.error("Database Error", err.message);
    return res
      .status(500)
      .json({ error: "Oops! Something went wrong. Please try again later." });
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Login Error", err.message);
      return res
        .status(500)
        .json({ error: "Oops! Something went wrong. Please try again later." });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    req.login(user, (err) => {
      if (err) {
        console.error("Login Session Error:", err.message);
        return res.status(500).json({ error: "Session error. Try again." });
      }
      return res.redirect("/home");
    });
  })(req, res, next);
});

// Configure Passport Local Strategy
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      // Check if email exists in database
      const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
      if (result.rows.length === 0) {
        return cb(null, false, { message: "User does not exist." });
      }
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      // Compare passwords
      const isMatch = await bcrypt.compare(password, storedHashedPassword);
      if (isMatch) {
        return cb(null, user);
      } else {
        return cb(null, false, { message: "Incorrect Password." });
      }
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return cb(null, false);
    }
    cb(null, result.rows[0]);
  } catch (err) {
    console.error("Deserialize Error:", err.message);
    cb(err);
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
