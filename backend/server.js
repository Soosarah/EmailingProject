
const campaignRoutes = require("./routes/campaignRoutes");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const { findUserByEmail } = require("./models/userModel");
const express = require("express");
const cors = require("cors");
const questionnaireRoutes = require("./routes/surveyRoutes");
require("dotenv").config();
const logicRoutes =
require("./routes/logicRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);


app.use("/api/logic",logicRoutes);

const pool = require("./config/db");
const notificationRoutes = require("./routes/notificationRoutes");


app.use("/api/notifications", notificationRoutes);

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Database connected!");
        console.log(result.rows);
    }
});
async function testDatabase() {
    const user = await findUserByEmail("admin@djezzy.dz");

    console.log(user);
}

testDatabase();
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});