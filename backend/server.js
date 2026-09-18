<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
=======
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const logicRoutes = require("./routes/logicRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Services
const cadenceWorker = require("./services/cadenceWorker");
>>>>>>> origin/master

const app = express();

const PORT = process.env.PORT || 5000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

<<<<<<< HEAD
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
=======
app.use(express.urlencoded({
    extended: true
}));


// ============================================================
// SERVE FRONTEND
// ============================================================

app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);


// ============================================================
// API ROUTES
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/campaigns",
    campaignRoutes
);

app.use(
    "/api/statistics",
    statisticsRoutes
);

app.use(
    "/api/logic",
    logicRoutes
);

app.use(
    "/api/audit-logs",
    auditLogRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);


// ============================================================
// API TEST
// ============================================================

app.get("/api", (req, res) => {
    res.json({
        message: "Djezzy API is running"
    });
});


// ============================================================
// DATABASE TEST
// ============================================================

app.get("/api/db-test", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT NOW()"
        );

        res.json({
            success: true,
            time: result.rows[0].now
        });

    } catch (error) {

        console.error(
            "DATABASE TEST ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});


// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../public/djezzy_login.html"
        )
    );
});


// ============================================================
// 404 API HANDLER
// ============================================================

app.use("/api", (req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found"
    });

});


// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {

    console.error(
        "SERVER ERROR:",
        err
    );

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, async () => {

    console.log(
        `SERVER RUNNING ON PORT ${PORT}`
    );

    console.log(
        `http://localhost:${PORT}`
    );


    // --------------------------------------------------------
    // Start cadence worker
    // --------------------------------------------------------

    cadenceWorker.start();

>>>>>>> origin/master
});