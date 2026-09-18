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

const app = express();

const PORT = process.env.PORT || 5000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

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

});