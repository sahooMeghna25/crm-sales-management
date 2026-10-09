require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dealRoutes = require("./routes/dealRoutes");
const activityRoutes = require("./routes/activityRoutes");
const timelineRoutes = require("./routes/timelineRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "CRM API is running" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
