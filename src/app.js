const express = require("express");
require("dotenv").config();
const indexRoutes = require("./routes");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.use("/api/v1", indexRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
