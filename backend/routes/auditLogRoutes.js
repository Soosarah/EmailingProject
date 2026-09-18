const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authmiddleware");

const {
    getAuditLogs
} = require("../controllers/auditLogController");

router.get(
    "/",
    authenticateToken,
    getAuditLogs
);

module.exports = router;