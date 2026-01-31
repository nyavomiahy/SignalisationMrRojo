const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pointsRouter = require("./routes/points");
app.use("/api/points", pointsRouter);

const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

// const statusRouter = require("./routes/status_points");
// app.use("/api/status_point", statusRouter);


const statusRouter = require("./routes/status_points");
app.use("/api/status_point", statusRouter);

const typeAccountRouter = require("./routes/type_account");
app.use("/api/type_account", typeAccountRouter);

//app.use("/api/sync", require("./routes/sync"));

const ff = require("./routes/firebase-firestore");
app.use("/api/firestore-to-postgres", ff);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
