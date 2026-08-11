const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   FRONTEND / PUBLIC
   ========================= */
app.use(express.static(path.join(__dirname, "../public")));


/* =========================
   ROUTES
   ========================= */

// Auth
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


// Users
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


// Roles
const roleRoutes = require("./routes/roleRoutes");
app.use("/api/roles", roleRoutes);


// Permissions
const permissionRoutes = require("./routes/permissionRoutes");
app.use("/api/permissions", permissionRoutes);


// Dashboard
const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);


// Questionnaires
const questionnaireRoutes = require("./routes/surveyRoutes");
app.use("/api/questionnaires", questionnaireRoutes);


// Campaigns
const campaignRoutes = require("./routes/campaignRoutes");
app.use("/api/campaigns", campaignRoutes);


// Logic / questionnaire dynamique
const logicRoutes = require("./routes/logicRoutes");
app.use("/api/logic", logicRoutes);


// Notifications
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);


/* =========================
   DATABASE
   ========================= */

const pool = require("./config/db");

pool.query("SELECT NOW()")
    .then(() => {
        console.log("✅ PostgreSQL connecté");
    })
    .catch((error) => {
        console.error("❌ Erreur PostgreSQL :", error);
    });


/* =========================
   SERVER
   ========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});