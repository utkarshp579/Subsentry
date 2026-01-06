require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const port = process.env.PORT || 5000;

//db connection establish
connectDB();
//--------------------

//middleware
app.use(express.json());

//routes------------------------
//--subscription routes :----------
app.use("/api/subscriptions", subscriptionRoutes);

// //--root route :----------
// app.get("/", (req, res) => {
//   res.send("Hello i am root route");
// });
//---listen function
app.listen(port, (req, res) => {
  console.log(`Server running at ${port}`);
});
