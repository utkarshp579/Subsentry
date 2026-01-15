const express = require("express");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Temporary test route
app.get("/", (req, res) => {
  res.send("Subsentry backend running ✅");
});

// TODO: later you can connect subscription routes here

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
