const express = require("express");
const cors = require("cors");
const indexRoutes = require("./src/routes");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.use("/api/v1", indexRoutes);

module.exports = app;
