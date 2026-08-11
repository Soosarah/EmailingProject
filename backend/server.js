const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname,"../public")));

const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);
const roleRoutes = require("./routes/roleRoutes");

app.use("/api/roles", roleRoutes);
const permissionRoutes = require("./routes/permissionRoutes");

app.use("/api/permissions", permissionRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const pool = require("./config/db");

pool.query("SELECT NOW()")
.then(()=>{

    console.log("✅ PostgreSQL connecté");

})
.catch(console.error);

app.listen(process.env.PORT,()=>{

    console.log(`Server running on port ${process.env.PORT}`);

});