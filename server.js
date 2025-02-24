const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

router.get("/custom-api", async (req, res) => {
  res.json({ message: "Hello from Custom API!" });
});

app.use("/.netlify/functions/server", router);

module.exports.handler = serverless(app);
