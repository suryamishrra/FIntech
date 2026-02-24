require("dotenv").config();

const express = require("express");
const cors = require("cors");

const indexRoutes = require("./src/routes/indexRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Use all routes from indexRoutes
app.use("/api", indexRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});