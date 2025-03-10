"use strict";
const express = require("express");
const helmet = require("helmet");
const https = require("https");
const fs = require("fs");
const hsts = require("hsts");

try {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(helmet());
  app.use(express.json());

  // Apply HSTS middleware
  const hstsOptions = {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  };
  app.use(hsts(hstsOptions));

  // Cache Middleware
  const cacheMiddleware = (req, res, next) => {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=360");
    next();
  };
  app.get("/", cacheMiddleware, (req, res) => {
    res.send("Hello from the Wellness App!");
  });

  app.get("/api/goals", cacheMiddleware, (req, res) => {
    res.send("Showing wellness goals");
  });

  app.get("/api/goals/:id", cacheMiddleware, (req, res) => {
    const goalId = req.params.id;
    res.send(`Showing steps for goal No.${goalId}`);
  });

  // Sensitive user profile endpoint (no cache to protect sensitive user data)
  app.get("/api/user-profile", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.send({ username: "Austin Lin", phone: "825-754-7566" });
  });

  // !! my POST and PUT routes do not have cache control, because they are to modify data, so not too much sense to cache them
  app.post("/api/goals", (req, res) => {
    const newGoal = req.body;
    res.send(`Added new goal: ${JSON.stringify(newGoal)}`);
  });

  app.put("/api/goals/:id/finish", (req, res) => {
    const goalId = req.params.id;
    res.send(`Goal No.${goalId} finished, awesome!`);
  });

  // ================= HTTPS Server Setup ==================

  let options;
  try {
    options = {
      key: fs.readFileSync("private-key.pem"),
      cert: fs.readFileSync("certificate.pem"),
    };
  } catch (error) {
    console.error("Error reading SSL certificate files", error);
    process.exit(1);
  }

  const httpsServer = https.createServer(options, app);

  // Start HTTPS server
  httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server running at https://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Error. Oops, something went wrong", error);
  process.exit(1);
}
