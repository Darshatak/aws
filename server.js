const express = require("express");
const app = express();

app.use(express.json());

// Factorial Endpoint
app.get("/factorial/:number", (req, res) => {
  const num = parseInt(req.params.number);

  if (isNaN(num) || num < 0) {
    return res
      .status(400)
      .json({ error: "Please provide a valid non-negative number." });
  }

  const factorial = (n) => (n === 0 ? 1 : n * factorial(n - 1));

  res.json({ number: num, factorial: factorial(num) });
});

// Reverse String Endpoint
app.get("/reverse-string/:text", (req, res) => {
  const text = req.params.text;

  if (!text) {
    return res.status(400).json({ error: "Please provide a valid string." });
  }

  const reversed = text.split("").reverse().join("");

  res.json({ original: text, reversed });
});

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Node.js API!" });
});

// Start Server (for local testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
