const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");

const connectDB = require("./src/config/db.config");
const helmetConfig = require("./src/config/helmet.config");
const sessionConfig = require("./src/config/session.config");
const logger = require("./src/config/logger.config");

const { nosqliShield } = require("./src/middleware/baseline/nosqli.middleware");
const { xssShield } = require("./src/middleware/baseline/xss.middleware");
const {
  globalLimiter,
} = require("./src/middleware/baseline/rateLimiter.middleware");
const { mtdShield } = require("./src/middleware/exceptional/mtd.middleware");

const authRoutes = require("./src/routes/auth.routes");
const agreementRoutes = require("./src/routes/agreement.routes");
const userRoutes = require("./src/routes/user.routes");
const adminRoutes = require("./src/routes/admin.routes");
const decoyRoutes = require("./src/routes/decoy.routes");

dotenv.config();

connectDB();

const app = express();

app.use(helmetConfig);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/", globalLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

app.use(mongoSanitize());
app.use(nosqliShield);
app.use(xssShield);
app.use(mtdShield);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "active",
    system: "FundBridge Sentinel",
    uptime: process.uptime(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/agreements", agreementRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/decoy", decoyRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(
    `${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal security error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SENTINEL] FundBridge active on port ${PORT}`);
});
