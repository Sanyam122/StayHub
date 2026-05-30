const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const express       = require("express");
const mongoose      = require("mongoose");
const path          = require("path");
const session       = require("express-session");
const passport      = require("passport");
const MongoStore    = require("connect-mongo");
const flash         = require("connect-flash");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const ejsMate       = require("ejs-mate");

// Models
const User = require("./Models/user.js");

// Utils
const ExpressError = require("./utils/ExpressError.js");

// Routes
const listingRoutes = require("./routes/listing.js");
const reviewRoutes  = require("./routes/review.js");
const userRoutes    = require("./routes/user.js");

// ─── App Init
const app = express();

// ─── Env
const MONGO_URI      = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || "changeme";
const STORE_SECRET   = process.env.STORE_SECRET   || "changeme";
const PORT           = process.env.PORT           || 8080;

// ─── Database
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ─── View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ─── Global Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ─── Session Store
const store = MongoStore.create({
  mongoUrl:   MONGO_URI,
  touchAfter: 24 * 3600,
});

store.on("error", (err) => console.error("Session store error:", err));

app.use(
  session({
    store,
    secret:            SESSION_SECRET,
    resave:            false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge:   7 * 24 * 60 * 60 * 1000,
      secure:   process.env.NODE_ENV === "production",
    },
  })
);

// ─── Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ─── Flash + Locals
app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success     = req.flash("success");
  res.locals.error       = req.flash("error");
  next();
});

// ─── Routes
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings",     listingRoutes);
app.use("/listings/:id", reviewRoutes);
app.use("/",             userRoutes);

// ─── 404 Handler
app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ─── Global Error Handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("ERROR:", err.message);
  const statusCode = err.statusCode || 500;
  const message    = err.message    || "Something went wrong";
  return res.status(statusCode).render("Error.ejs", { message });
});

// ─── Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});