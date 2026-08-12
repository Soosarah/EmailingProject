
const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const {
    getStatistics
} = require("../controllers/statisticsController");

router.get(
    "/",
    authenticateToken,
    getStatistics
);

module.exports = router;

