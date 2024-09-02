const express = require("express");
const indexRoutes = require("./src/routes");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.use("/api/v1", indexRoutes);

module.exports = app;
