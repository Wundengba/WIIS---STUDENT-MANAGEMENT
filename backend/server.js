const express  = require("express");
const cors     = require("cors");
const morgan   = require("morgan");
require("dotenv").config();

const studentsRouter   = require("./routes/students");
const scoresRouter     = require("./routes/scores");
const selectionsRouter = require("./routes/selections");
const schoolsRouter    = require("./routes/schools");

const app  = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.get("/",   (_, res) => res.json({ message: "Ghana Placement API v1.0", status: "ok" }));
app.get("/health", (_, res) => res.json({ status: "healthy" }));

// Test route that doesn't use Supabase
app.get("/api/test", (_, res) => res.json({ message: "API routes are working" }));

console.log("Loading API routes...");
try {
  app.use("/api/students",   studentsRouter);
  app.use("/api/scores",     scoresRouter);
  app.use("/api/selections", selectionsRouter);
  app.use("/api/schools",    schoolsRouter);
  console.log("API routes loaded successfully");
} catch (error) {
  console.error("Error loading API routes:", error.message);
}

// 404
app.use((_, res) => res.status(404).json({ error: "Route not found" }));
// Error handler
app.use((err, _, res, __) => {
  if (NODE_ENV === "development") {
    console.error(err);
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  if (NODE_ENV === "development") {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  } else {
    console.log(`API listening on port ${PORT}`);
  }
});
