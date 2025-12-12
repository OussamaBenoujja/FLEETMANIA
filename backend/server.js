const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const path = require("path");

require("dotenv").config({ path: "../.env" });
const port = process.env.PORT || 3045;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const authRoutes = require("./routes/authRoutes");
const truckRoutes = require("./routes/truckRoutes");
const tripRoutes = require("./routes/tripRoutes");
const userRoutes = require("./routes/userRoutes");
const trailerRoutes = require("./routes/trailerRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

app.use("/api/auth", authRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trailers", trailerRoutes);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
